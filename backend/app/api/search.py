"""Search API routes"""

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.models.entity import Entity
from app.schemas.search import SearchResponse, SearchResult, EntityBrief
from app.dependencies import get_current_user, log_action
from app.services.hybrid_search import hybrid_search

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("", response_model=SearchResponse)
def search(
    q: str = Query(..., min_length=1),
    case_id: int = Query(None),
    top_k: int = Query(10, ge=1, le=50),
    req: Request = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Hybrid search across case documents. Omit case_id for cross-case search."""
    results = hybrid_search.search(db, q, case_id=case_id, top_k=top_k)

    # Also find matching entities
    entities_found = []
    entity_query = db.query(Entity).filter(
        Entity.entity_value.ilike(f"%{q}%")
    )
    if case_id:
        entity_query = entity_query.filter(Entity.case_id == case_id)

    for e in entity_query.limit(20).all():
        entities_found.append(EntityBrief(
            id=e.id,
            entity_type=e.entity_type,
            entity_value=e.entity_value,
            case_id=e.case_id,
        ))

    log_action(db, current_user, "SEARCH", details={"query": q, "case_id": case_id, "results": len(results)},
               ip_address=req.client.host if req else None)

    return SearchResponse(
        results=[
            SearchResult(
                chunk_id=r["chunk_id"],
                document_id=r["document_id"],
                document_name=r["document_name"],
                case_id=r["case_id"],
                case_number=r.get("case_number", ""),
                content=r["content"][:500],
                page_start=r.get("page_start"),
                page_end=r.get("page_end"),
                bm25_score=r["bm25_score"],
                semantic_score=r["semantic_score"],
                hybrid_score=r["hybrid_score"],
            )
            for r in results
        ],
        total=len(results),
        query=q,
        entities_found=entities_found,
    )
