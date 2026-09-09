"""AI Chat API routes"""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage
from app.schemas.search import ChatRequest, ChatResponse, ChatSource, EntityBrief
from app.dependencies import get_current_user, log_action
from app.services.rag_engine import rag_engine

router = APIRouter(prefix="/cases/{case_id}/chat", tags=["AI Chat"])


@router.post("", response_model=ChatResponse)
def chat(
    case_id: int,
    chat_req: ChatRequest,
    req: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a question to the AI investigation assistant."""
    # Get or create session
    if chat_req.session_id:
        session = db.query(ChatSession).filter(ChatSession.id == chat_req.session_id).first()
    else:
        session = ChatSession(
            case_id=case_id,
            user_id=current_user.id,
            title=chat_req.message[:100],
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    # Save user message
    user_msg = ChatMessage(
        session_id=session.id,
        role="USER",
        content=chat_req.message,
    )
    db.add(user_msg)
    db.commit()

    # Run RAG pipeline
    result = rag_engine.query(db, chat_req.message, case_id)

    # Save assistant message
    assistant_msg = ChatMessage(
        session_id=session.id,
        role="ASSISTANT",
        content=result["answer"],
        sources_json=result["sources"],
        entities_json=result["related_entities"],
        search_context=result["search_context"],
        latency_ms=result["latency_ms"],
    )
    db.add(assistant_msg)
    db.commit()

    log_action(db, current_user, "AI_CHAT", "case", case_id,
               {"question": chat_req.message[:200]}, req.client.host)

    from app.core_logger import log_event
    log_event("AI_CHAT_QUERY", {
        "case_id": case_id,
        "user_id": current_user.id,
        "prompt": chat_req.message,
        "response_snippet": result["answer"][:200],
        "latency_ms": result["latency_ms"]
    })

    return ChatResponse(
        answer=result["answer"],
        sources=[
            ChatSource(
                document_id=s["document_id"],
                document_name=s["document_name"],
                chunk_id=s["chunk_id"],
                page=s.get("page"),
                snippet=s["snippet"],
            )
            for s in result["sources"]
        ],
        related_entities=[
            EntityBrief(**e) for e in result["related_entities"]
        ],
        confidence=result["confidence"],
        session_id=session.id,
        latency_ms=result["latency_ms"],
    )


@router.get("/sessions")
def list_sessions(
    case_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List chat sessions for a case."""
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.case_id == case_id, ChatSession.user_id == current_user.id)
        .order_by(ChatSession.updated_at.desc())
        .all()
    )
    return [
        {
            "id": s.id,
            "title": s.title,
            "created_at": s.created_at,
            "updated_at": s.updated_at,
        }
        for s in sessions
    ]


@router.get("/sessions/{session_id}/messages")
def get_messages(
    case_id: int,
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all messages in a chat session."""
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
        .all()
    )
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "sources": m.sources_json,
            "entities": m.entities_json,
            "latency_ms": m.latency_ms,
            "created_at": m.created_at,
        }
        for m in messages
    ]
