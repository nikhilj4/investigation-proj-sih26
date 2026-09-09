"""Authentication API routes"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext

from app.config import settings
from app.database.connection import get_db
from app.models.station import Station
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse, UserInfo, StationInfo
from app.dependencies import get_current_user, log_action

router = APIRouter(prefix="/auth", tags=["Authentication"])
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")


def create_access_token(user: User) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRY_HOURS)
    payload = {
        "user_id": user.id,
        "employee_id": user.employee_id,
        "role": user.role,
        "station_id": user.station_id,
        "exp": expire,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, req: Request, db: Session = Depends(get_db)):
    """Authenticate officer with station, employee ID, and password."""
    # Find user
    user = (
        db.query(User)
        .filter(User.employee_id == request.employee_id, User.station_id == request.station_id)
        .first()
    )
    if not user or not pwd_context.verify(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    # Update last login
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    # Get station
    station = db.query(Station).filter(Station.id == user.station_id).first()

    # Audit
    log_action(db, user, "LOGIN", ip_address=req.client.host, user_agent=req.headers.get("user-agent"))

    token = create_access_token(user)
    return LoginResponse(
        access_token=token,
        user=UserInfo(
            id=user.id,
            employee_id=user.employee_id,
            name=user.name,
            role=user.role,
            designation=user.designation,
            station_id=user.station_id,
        ),
        station=StationInfo(
            id=station.id,
            station_code=station.station_code,
            station_name=station.station_name,
            city=station.city,
        ),
    )


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user profile."""
    station = db.query(Station).filter(Station.id == current_user.station_id).first()
    return {
        "user": UserInfo.model_validate(current_user),
        "station": StationInfo.model_validate(station),
    }


@router.get("/stations")
def list_stations(db: Session = Depends(get_db)):
    """List all active stations for login dropdown."""
    stations = db.query(Station).filter(Station.is_active == True).all()
    return [
        StationInfo(
            id=s.id,
            station_code=s.station_code,
            station_name=s.station_name,
            city=s.city,
        )
        for s in stations
    ]


@router.post("/logout")
def logout(
    req: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Log the logout action (JWT is stateless, client discards token)."""
    log_action(db, current_user, "LOGOUT", ip_address=req.client.host)
    return {"message": "Logged out successfully"}
