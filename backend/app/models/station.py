"""Station ORM Model"""

from sqlalchemy import Column, Integer, String, Boolean, DECIMAL, TIMESTAMP, func
from app.database.connection import Base


class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    station_code = Column(String(20), unique=True, nullable=False)
    station_name = Column(String(200), nullable=False)
    district = Column(String(100))
    city = Column(String(100))
    state = Column(String(100), default="Karnataka")
    pincode = Column(String(10))
    phone = Column(String(20))
    latitude = Column(DECIMAL(10, 8))
    longitude = Column(DECIMAL(11, 8))
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
