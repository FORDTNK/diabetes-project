from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.db.database import engine
from app.deps.auth import get_current_user_id
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

router = APIRouter()


# ================= MODEL =================
class Treatment(BaseModel):
    treatment_date: str
    treatment_text: str
    doctor_advice: str
    detail_text: str


def _fk_error_message(err: Exception) -> str | None:
    message = str(err.orig) if hasattr(err, "orig") else str(err)
    if "1452" in message or "foreign key constraint" in message.lower():
        return "ไม่พบผู้ใช้ในระบบ กรุณาเข้าสู่ระบบใหม่"
    return None


# ================= SAVE =================
@router.post("/save-treatment")
def save_treatment(
    data: Treatment,
    user_id: int = Depends(get_current_user_id),
):

    try:

        with engine.begin() as conn:

            conn.execute(text("""

                INSERT INTO treatment_records
                (
                    user_id,
                    treatment_date,
                    treatment_text,
                    doctor_advice,
                    detail_text
                )

                VALUES
                (
                    :user_id,
                    :treatment_date,
                    :treatment_text,
                    :doctor_advice,
                    :detail_text
                )

            """), {
                "user_id": user_id,
                "treatment_date": data.treatment_date,
                "treatment_text": data.treatment_text,
                "doctor_advice": data.doctor_advice,
                "detail_text": data.detail_text,
            })

        return {
            "success": True,
            "message": "saved",
        }

    except IntegrityError as e:

        print("SAVE ERROR =", e)

        return {
            "success": False,
            "error": _fk_error_message(e) or "บันทึกข้อมูลไม่สำเร็จ",
        }

    except Exception as e:

        print("SAVE ERROR =", e)

        return {
            "success": False,
            "error": str(e),
        }


# ================= GET ALL =================
@router.get("/treatments")
def get_treatments(user_id: int = Depends(get_current_user_id)):

    try:

        with engine.begin() as conn:

            result = conn.execute(text("""

                SELECT
                    tr.id,
                    tr.user_id,
                    tr.treatment_date,
                    tr.treatment_text,
                    tr.doctor_advice,
                    tr.detail_text,
                    tr.created_at

                FROM treatment_records tr
                INNER JOIN user u ON u.user_id = tr.user_id

                WHERE tr.user_id = :user_id

                ORDER BY tr.created_at DESC

            """), {
                "user_id": user_id,
            })

            rows = result.mappings().all()

        return rows

    except Exception as e:

        print("GET ERROR =", e)

        return {
            "success": False,
            "error": str(e),
        }


# ================= DETAIL =================
@router.get("/treatment-detail/{id}")
def treatment_detail(id: int):

    try:

        with engine.begin() as conn:

            result = conn.execute(text("""

                SELECT
                    tr.id,
                    tr.user_id,
                    tr.treatment_date,
                    tr.treatment_text,
                    tr.doctor_advice,
                    tr.detail_text,
                    tr.created_at

                FROM treatment_records tr
                INNER JOIN user u ON u.user_id = tr.user_id

                WHERE tr.id = :id

                LIMIT 1

            """), {
                "id": id,
            })

            row = result.mappings().first()

        if not row:

            return {
                "success": False,
                "message": "not found",
            }

        return row

    except Exception as e:

        print("DETAIL ERROR =", e)

        return {
            "success": False,
            "error": str(e),
        }


# ================= UPDATE =================
@router.put("/update-treatment/{id}")
def update_treatment(id: int, data: Treatment):

    try:

        with engine.begin() as conn:

            check = conn.execute(text("""

                SELECT id
                FROM treatment_records

                WHERE id = :id

            """), {
                "id": id,
            }).fetchone()

            if not check:

                return {
                    "success": False,
                    "message": "not found",
                }

            conn.execute(text("""

                UPDATE treatment_records

                SET
                    treatment_date = :treatment_date,
                    treatment_text = :treatment_text,
                    doctor_advice = :doctor_advice,
                    detail_text = :detail_text

                WHERE id = :id

            """), {
                "id": id,
                "treatment_date": data.treatment_date,
                "treatment_text": data.treatment_text,
                "doctor_advice": data.doctor_advice,
                "detail_text": data.detail_text,
            })

        return {
            "success": True,
            "message": "updated",
        }

    except Exception as e:

        print("UPDATE ERROR =", e)

        return {
            "success": False,
            "error": str(e),
        }


# ================= DELETE =================
@router.delete("/delete-treatment/{id}")
def delete_treatment(id: int):

    try:

        with engine.begin() as conn:

            check = conn.execute(text("""

                SELECT id
                FROM treatment_records

                WHERE id = :id

            """), {
                "id": id,
            }).fetchone()

            if not check:

                return {
                    "success": False,
                    "message": "not found",
                }

            conn.execute(text("""

                DELETE FROM treatment_records

                WHERE id = :id

            """), {
                "id": id,
            })

        return {
            "success": True,
            "message": "deleted",
        }

    except Exception as e:

        print("DELETE ERROR =", e)

        return {
            "success": False,
            "error": str(e),
        }
