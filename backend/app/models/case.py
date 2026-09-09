"""Case ORM Model"""

from sqlalchemy import Column, Integer, String, Text, Enum, ForeignKey, Date, TIMESTAMP, func
from app.database.connection import Base


class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, autoincrement=True)
    case_number = Column(String(30), unique=True, nullable=False)
    fir_number = Column(String(30))
    title = Column(String(500), nullable=False)
    description = Column(Text)
    case_type = Column(
        Enum("THEFT", "ROBBERY", "FRAUD", "CYBERCRIME", "MURDER",
             "ASSAULT", "KIDNAPPING", "NARCOTICS", "MISSING_PERSON",
             "PROPERTY_DISPUTE", "DOMESTIC_VIOLENCE", "OTHER",
             name="case_type_enum"),
        nullable=False, default="OTHER"
    )
    status = Column(
        Enum("REGISTERED", "ACTIVE", "UNDER_INVESTIGATION",
             "CHARGESHEET_FILED", "CLOSED", "REOPENED",
             name="case_status_enum"),
        nullable=False, default="REGISTERED"
    )
    priority = Column(
        Enum("CRITICAL", "HIGH", "MEDIUM", "LOW", name="case_priority_enum"),
        nullable=False, default="MEDIUM"
    )
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    ai_summary = Column(Text)
    ai_open_questions = Column(Text)
    incident_date = Column(Date)
    incident_location = Column(String(500))
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
