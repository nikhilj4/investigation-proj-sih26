"""User (Officer) ORM Model"""

from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey, TIMESTAMP, func
from app.database.connection import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(String(20), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    email = Column(String(200))
    phone = Column(String(20))
    password_hash = Column(String(255), nullable=False)
    role = Column(
        Enum("ADMIN", "STATION_OFFICER", "INVESTIGATOR", "ANALYST", "VIEW_ONLY",
             name="user_role"),
        nullable=False, default="INVESTIGATOR"
    )
    designation = Column(String(100))
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    last_login_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
