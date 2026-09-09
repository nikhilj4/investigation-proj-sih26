"""Entity Source ORM Model — tracks which chunk/document an entity was found in"""

from sqlalchemy import Column, Integer, String, ForeignKey
from app.database.connection import Base


class EntitySource(Base):
    __tablename__ = "entity_sources"

    id = Column(Integer, primary_key=True, autoincrement=True)
    entity_id = Column(Integer, ForeignKey("entities.id", ondelete="CASCADE"), nullable=False)
    chunk_id = Column(Integer, ForeignKey("document_chunks.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    context_snippet = Column(String(500))
    page_number = Column(Integer)
