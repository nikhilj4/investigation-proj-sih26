"""Document ORM Model"""

from sqlalchemy import Column, Integer, BigInteger, String, Text, Enum, ForeignKey, TIMESTAMP, func
from app.database.connection import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String(500), nullable=False)
    original_name = Column(String(500), nullable=False)
    file_type = Column(String(20), nullable=False)
    file_path = Column(String(1000), nullable=False)
    file_size = Column(BigInteger)
    mime_type = Column(String(100))
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_type = Column(String(50), default="OTHER")
    processing_status = Column(
        Enum("PENDING", "EXTRACTING", "CHUNKING", "EMBEDDING",
             "ENTITY_EXTRACTING", "COMPLETED", "FAILED",
             name="processing_status_enum"),
        default="PENDING"
    )
    processing_error = Column(Text)
    total_pages = Column(Integer)
    total_chunks = Column(Integer, default=0)
    extracted_text = Column(Text)
    uploaded_at = Column(TIMESTAMP, server_default=func.now())
    processed_at = Column(TIMESTAMP, nullable=True)
