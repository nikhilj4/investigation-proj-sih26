"""Audit Log ORM Model"""

from sqlalchemy import Column, Integer, String, JSON, ForeignKey, TIMESTAMP, func
from app.database.connection import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    employee_id = Column(String(20))
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50))
    resource_id = Column(Integer)
    details_json = Column(JSON)
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    created_at = Column(TIMESTAMP, server_default=func.now())
