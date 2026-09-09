"""Chat Message ORM Model"""

from sqlalchemy import Column, Integer, String, Text, Enum, JSON, ForeignKey, TIMESTAMP, func
from app.database.connection import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)
    role = Column(
        Enum("USER", "ASSISTANT", "SYSTEM", name="message_role_enum"),
        nullable=False
    )
    content = Column(Text, nullable=False)
    sources_json = Column(JSON)
    entities_json = Column(JSON)
    search_context = Column(JSON)
    token_count = Column(Integer)
    latency_ms = Column(Integer)
    created_at = Column(TIMESTAMP, server_default=func.now())
