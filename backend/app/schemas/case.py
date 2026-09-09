"""Pydantic schemas for cases"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class CaseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    case_type: str = "OTHER"
    priority: str = "MEDIUM"
    fir_number: Optional[str] = None
    incident_date: Optional[date] = None
    incident_location: Optional[str] = None
    assigned_investigators: Optional[List[int]] = None


class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    case_type: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    incident_date: Optional[date] = None
    incident_location: Optional[str] = None


class CaseResponse(BaseModel):
    id: int
    case_number: str
    fir_number: Optional[str] = None
    title: str
    description: Optional[str] = None
    case_type: str
    status: str
    priority: str
    station_id: int
    created_by: int
    ai_summary: Optional[str] = None
    ai_open_questions: Optional[str] = None
    incident_date: Optional[date] = None
    incident_location: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Computed fields populated by the API
    document_count: int = 0
    entity_count: int = 0
    creator_name: Optional[str] = None
    station_name: Optional[str] = None

    class Config:
        from_attributes = True


class CaseListResponse(BaseModel):
    cases: List[CaseResponse]
    total: int
    page: int
    page_size: int


class CaseSummary(BaseModel):
    """Dashboard-level case summary"""
    id: int
    case_number: str
    title: str
    status: str
    priority: str
    case_type: str
    created_at: Optional[datetime] = None
    document_count: int = 0
    entity_count: int = 0

    class Config:
        from_attributes = True
