"""Pydantic schemas for authentication"""

from pydantic import BaseModel
from typing import Optional


class LoginRequest(BaseModel):
    station_id: int
    employee_id: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserInfo"
    station: "StationInfo"


class UserInfo(BaseModel):
    id: int
    employee_id: str
    name: str
    role: str
    designation: Optional[str] = None
    station_id: int

    class Config:
        from_attributes = True


class StationInfo(BaseModel):
    id: int
    station_code: str
    station_name: str
    city: Optional[str] = None

    class Config:
        from_attributes = True


class TokenData(BaseModel):
    user_id: int
    employee_id: str
    role: str
    station_id: int
