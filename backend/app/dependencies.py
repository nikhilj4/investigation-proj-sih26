"""FastAPI dependency injection — DB session, auth, audit logging"""

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from functools import wraps
from typing import Optional

from app.config import settings
from app.database.connection import get_db
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.auth import TokenData


security = HTTPBearer()


def decode_token(token: str) -> TokenData:
    """Decode and validate JWT token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return TokenData(
            user_id=payload["user_id"],
            employee_id=payload["employee_id"],
            role=payload["role"],
            station_id=payload["station_id"],
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Get current authenticated user from JWT token."""
    token_data = decode_token(credentials.credentials)
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    return user


def require_role(*allowed_roles):
    """Dependency factory: ensures user has one of the allowed roles."""
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role}' not authorized. Required: {allowed_roles}",
            )
        return current_user
    return role_checker


def log_action(
    db: Session,
    user: Optional[User],
    action: str,
    resource_type: str = None,
    resource_id: int = None,
    details: dict = None,
    ip_address: str = None,
    user_agent: str = None,
):
    """Write an entry to the audit log."""
    entry = AuditLog(
        user_id=user.id if user else None,
        employee_id=user.employee_id if user else None,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details_json=details,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.add(entry)
    db.commit()
