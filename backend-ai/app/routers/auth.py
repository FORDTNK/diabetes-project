from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.config import BACKEND_AI_DIR
from app.models.user import User
from pydantic import BaseModel
from dotenv import load_dotenv
import random
import time
import os
import smtplib
from email.message import EmailMessage

load_dotenv(BACKEND_AI_DIR / ".env", override=True)

router = APIRouter()
otp_store = {}
OTP_TTL_SECONDS = 5 * 60

# =========================
# 📌 Request Models
# =========================

class LoginRequest(BaseModel):
    citizen_id: str
    password: str


class RegisterRequest(BaseModel):
    citizen_id: str
    password: str
    confirm_password: str
    full_name: str
    birth_date: str
    phone: str


class ForgotPasswordOtpRequest(BaseModel):
    citizen_id: str
    email: str


class ForgotPasswordCheckRequest(BaseModel):
    citizen_id: str


class ResetPasswordRequest(BaseModel):
    citizen_id: str
    email: str
    otp: str
    new_password: str
    confirm_password: str


def normalize_email(email: str):
    return email.strip().lower()


def send_otp_email(to_email: str, otp: str):
    load_dotenv(BACKEND_AI_DIR / ".env", override=True)
    gmail_address = os.getenv("GMAIL_ADDRESS", "").strip()
    gmail_app_password = "".join(os.getenv("GMAIL_APP_PASSWORD", "").split())

    if not gmail_address or not gmail_app_password:
        raise HTTPException(
            status_code=500,
            detail="ยังไม่ได้ตั้งค่า Gmail: กรุณาใส่ GMAIL_ADDRESS และ GMAIL_APP_PASSWORD ใน backend-ai/.env"
        )

    if len(gmail_app_password) != 16:
        raise HTTPException(
            status_code=500,
            detail=f"GMAIL_APP_PASSWORD ไม่ถูกต้อง: ต้องเป็น Gmail App Password 16 ตัวอักษร แต่ตอนนี้ระบบอ่านได้ {len(gmail_app_password)} ตัวอักษร"
        )

    message = EmailMessage()
    message["Subject"] = "DFU Care+ OTP"
    message["From"] = gmail_address
    message["To"] = to_email
    message.set_content(
        f"รหัส OTP สำหรับเปลี่ยนรหัสผ่าน DFU Care+ คือ {otp}\n\n"
        "รหัสนี้จะหมดอายุภายใน 5 นาที"
    )

    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=20) as server:
            server.starttls()
            server.login(gmail_address, gmail_app_password)
            server.send_message(message)
    except smtplib.SMTPAuthenticationError as err:
        print("GMAIL AUTH ERROR =", err.smtp_code, err.smtp_error)
        raise HTTPException(
            status_code=502,
            detail="Gmail ปฏิเสธการเข้าสู่ระบบ: กรุณาใช้ Gmail App Password 16 ตัวอักษร ไม่ใช่รหัสผ่านบัญชี Gmail"
        )
    except Exception as err:
        print("GMAIL SEND ERROR =", err)
        raise HTTPException(status_code=502, detail="ส่งอีเมล OTP ไม่สำเร็จ กรุณาตรวจสอบ Gmail/App Password")


# =========================
# 🔐 LOGIN
# =========================

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.national_id == data.citizen_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="ไม่พบผู้ใช้")

    # 🔥 ตอนนี้ใช้ plain text (เหมือน DB ที่คุณมี)
    if data.password != user.password:
        raise HTTPException(status_code=401, detail="รหัสผ่านไม่ถูกต้อง")

    return {
        "status": "success",
        "user_id": user.user_id,
        "name": f"{user.first_name} {user.last_name}"
    }


# =========================
# 📝 REGISTER
# =========================

@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):

    # 🔍 เช็ค user ซ้ำ
    existing_user = db.query(User).filter(User.national_id == data.citizen_id).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="มีผู้ใช้นี้แล้ว")

    # 🔐 เช็ครหัสผ่าน
    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="รหัสผ่านไม่ตรงกัน")

    # 🧠 แยกชื่อ
    name_parts = data.full_name.strip().split(" ")
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""

    # 💾 สร้าง user ใหม่
    new_user = User(
        national_id=data.citizen_id,   # 🔥 map ให้ตรง DB
        password=data.password,        # 🔥 ตอนนี้ยังไม่ hash
        first_name=first_name,
        last_name=last_name,
        birth_date=data.birth_date,
        phone=data.phone
    )

    db.add(new_user)
    db.commit()

    return {"status": "success"}


# =========================
# FORGOT PASSWORD: CHECK CITIZEN ID
# =========================

@router.post("/forgot-password/check-citizen")
def check_forgot_password_citizen(
    data: ForgotPasswordCheckRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(User.national_id == data.citizen_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="ไม่พบบัญชีผู้ใช้")

    return {
        "status": "success",
        "message": "พบบัญชีผู้ใช้",
        "name": f"{user.first_name} {user.last_name}"
    }


# =========================
# FORGOT PASSWORD: SEND OTP
# =========================

@router.post("/forgot-password/request-otp")
def request_forgot_password_otp(
    data: ForgotPasswordOtpRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(User.national_id == data.citizen_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="ไม่พบบัญชีผู้ใช้")

    to_email = normalize_email(data.email)
    if "@" not in to_email or "." not in to_email:
        raise HTTPException(status_code=400, detail="กรุณากรอกอีเมลให้ถูกต้อง")

    otp = f"{random.randint(0, 999999):06d}"
    otp_store[data.citizen_id] = {
        "otp": otp,
        "email": to_email,
        "expires_at": time.time() + OTP_TTL_SECONDS
    }

    send_otp_email(to_email, otp)

    return {
        "status": "success",
        "message": "ส่งรหัส OTP ไปยังอีเมลแล้ว"
    }


# =========================
# FORGOT PASSWORD: RESET
# =========================

@router.post("/forgot-password/reset")
def reset_forgot_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):

    if data.new_password != data.confirm_password:
        raise HTTPException(status_code=400, detail="รหัสผ่านใหม่ไม่ตรงกัน")

    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")

    user = db.query(User).filter(User.national_id == data.citizen_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="ไม่พบบัญชีผู้ใช้")

    to_email = normalize_email(data.email)

    otp_record = otp_store.get(data.citizen_id)

    if not otp_record:
        raise HTTPException(status_code=400, detail="กรุณาขอรหัส OTP ก่อน")

    if otp_record["expires_at"] < time.time():
        otp_store.pop(data.citizen_id, None)
        raise HTTPException(status_code=400, detail="รหัส OTP หมดอายุแล้ว")

    if otp_record["email"] != to_email or otp_record["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="รหัส OTP ไม่ถูกต้อง")

    user.password = data.new_password
    db.commit()
    otp_store.pop(data.citizen_id, None)

    return {
        "status": "success",
        "message": "เปลี่ยนรหัสผ่านสำเร็จ"
    }
