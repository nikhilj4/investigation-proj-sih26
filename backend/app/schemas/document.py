"""Pydantic schemas for documents"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DocumentResponse(BaseModel):
    id: int
    case_id: int
    file_name: str
    original_name: str
    file_type: str
    file_size: Optional[int] = None
    document_type: Optional[str] = None
    processing_status: str = "PENDING"
    processing_error: Optional[str] = None
    total_pages: Optional[int] = None
    total_chunks: int = 0
    uploaded_by: int
    uploader_name: Optional[str] = None
    uploaded_at: Optional[datetime] = None
    processed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int


class ChunkResponse(BaseModel):
    id: int
    document_id: int
    chunk_index: int
    content: str
    page_start: Optional[int] = None
    page_end: Optional[int] = None
    token_count: Optional[int] = None

    class Config:
        from_attributes = True
