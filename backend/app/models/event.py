"""Event ORM Model — timeline entries"""

from sqlalchemy import Column, Integer, Float, String, Text, Date, Time, DateTime, Enum, Boolean, ForeignKey, TIMESTAMP, func
from app.database.connection import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    event_date = Column(Date)
    event_time = Column(Time)
    event_datetime = Column(DateTime)
    title = Column(String(500), nullable=False)
    description = Column(Text)
    location = Column(String(500))
    event_type = Column(
        Enum("INCIDENT", "ARREST", "STATEMENT", "EVIDENCE_COLLECTED",
             "SIGHTING", "COMMUNICATION", "FINANCIAL", "COURT",
             "FORENSIC", "OTHER",
             name="event_type_enum"),
        default="OTHER"
    )
    source_chunk_id = Column(Integer, ForeignKey("document_chunks.id", ondelete="SET NULL"), nullable=True)
    source_document_id = Column(Integer, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    is_ai_generated = Column(Boolean, default=False)
    confidence = Column(Float, default=1.0)
    created_at = Column(TIMESTAMP, server_default=func.now())
