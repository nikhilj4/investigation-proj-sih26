"""Case Member ORM Model"""

from sqlalchemy import Column, Integer, Enum, ForeignKey, TIMESTAMP, UniqueConstraint, func
from app.database.connection import Base


class CaseMember(Base):
    __tablename__ = "case_members"

    id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(
        Enum("LEAD_INVESTIGATOR", "INVESTIGATOR", "ANALYST", "SUPERVISOR",
             name="member_role_enum"),
        nullable=False, default="INVESTIGATOR"
    )
    assigned_at = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("case_id", "user_id", name="uk_case_user"),
    )
