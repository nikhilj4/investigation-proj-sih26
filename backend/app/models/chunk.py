"""Document Chunk ORM Model"""

from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey, TIMESTAMP, func
from app.database.connection import Base


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    content_length = Column(Integer)
    token_count = Column(Integer)
    page_start = Column(Integer)
    page_end = Column(Integer)
    embedding = Column(JSON)
    embedding_model = Column(String(50), default="gemini-embedding-001")
    metadata_json = Column(JSON)
    created_at = Column(TIMESTAMP, server_default=func.now())
