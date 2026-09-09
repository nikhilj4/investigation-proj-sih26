"""Relationship ORM Model"""

from sqlalchemy import Column, Integer, Float, String, Enum, JSON, ForeignKey, TIMESTAMP, func
from app.database.connection import Base


class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    source_entity_id = Column(Integer, ForeignKey("entities.id", ondelete="CASCADE"), nullable=False)
    target_entity_id = Column(Integer, ForeignKey("entities.id", ondelete="CASCADE"), nullable=False)
    relationship_type = Column(
        Enum("CONTACTED", "MET", "ASSOCIATED_WITH", "LOCATED_AT",
             "OWNS", "USED_BY", "EMPLOYED_BY", "RELATED_TO",
             "TRANSFERRED_TO", "WITNESSED", "REPORTED_BY",
             "ARRESTED", "ACCUSED_IN", "TRAVELLED_TO",
             "COMMUNICATED_WITH", "FINANCIAL_LINK", "OTHER",
             name="relationship_type_enum"),
        nullable=False, default="ASSOCIATED_WITH"
    )
    relationship_label = Column(String(200))
    confidence = Column(Float, default=1.0)
    evidence_count = Column(Integer, default=1)
    source_chunk_id = Column(Integer, ForeignKey("document_chunks.id", ondelete="SET NULL"), nullable=True)
    metadata_json = Column(JSON)
    created_at = Column(TIMESTAMP, server_default=func.now())
