from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User


def get_current_user_id(
    x_user_id: str = Header(..., alias="X-User-Id"),
    db: Session = Depends(get_db),
) -> int:
    try:
        user_id = int(x_user_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่",
        )

    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=401,
            detail="ไม่พบผู้ใช้ในระบบ กรุณาเข้าสู่ระบบใหม่",
        )

    return user_id
