"""Entity ORM Model"""

from sqlalchemy import Column, Integer, Float, String, Enum, JSON, ForeignKey, TIMESTAMP, func
from app.database.connection import Base


class Entity(Base):
    __tablename__ = "entities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    entity_type = Column(
        Enum("PERSON", "PHONE", "EMAIL", "VEHICLE", "LOCATION",
             "ORGANIZATION", "BANK_ACCOUNT", "AADHAAR", "PAN",
             "DATE", "WEAPON", "DRUG", "AMOUNT", "DOCUMENT_REF",
             name="entity_type_enum"),
        nullable=False
    )
    entity_value = Column(String(500), nullable=False)
    normalized_value = Column(String(500))
    display_name = Column(String(200))
    confidence = Column(Float, default=1.0)
    mention_count = Column(Integer, default=1)
    first_seen_at = Column(TIMESTAMP, nullable=True)
    last_seen_at = Column(TIMESTAMP, nullable=True)
    metadata_json = Column(JSON)
    created_at = Column(TIMESTAMP, server_default=func.now())
