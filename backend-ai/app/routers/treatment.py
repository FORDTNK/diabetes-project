from fastapi import APIRouter
from pydantic import BaseModel
from app.db.database import engine
from sqlalchemy import text

router = APIRouter()


# ================= MODEL =================
class Treatment(BaseModel):

    citizen_id: str
    treatment_date: str
    treatment_text: str
    doctor_advice: str
    detail_text: str


# ================= SAVE =================
@router.post("/save-treatment")
def save_treatment(data: Treatment):

    try:

        with engine.begin() as conn:

            conn.execute(text("""

                INSERT INTO treatment_records
                (
                    citizen_id,
                    treatment_date,
                    treatment_text,
                    doctor_advice,
                    detail_text
                )

                VALUES
                (
                    :citizen_id,
                    :treatment_date,
                    :treatment_text,
                    :doctor_advice,
                    :detail_text
                )

            """), {
                "citizen_id": data.citizen_id,
                "treatment_date": data.treatment_date,
                "treatment_text": data.treatment_text,
                "doctor_advice": data.doctor_advice,
                "detail_text": data.detail_text
            })

        return {
            "success": True,
            "message": "saved"
        }

    except Exception as e:

        print("SAVE ERROR =", e)

        return {
            "success": False,
            "error": str(e)
        }


# ================= GET ALL =================
@router.get("/treatments/{citizen_id}")
def get_treatments(citizen_id: str):

    try:

        with engine.begin() as conn:

            result = conn.execute(text("""

                SELECT
                    id,
                    citizen_id,
                    treatment_date,
                    treatment_text,
                    doctor_advice,
                    detail_text,
                    created_at

                FROM treatment_records

                WHERE citizen_id = :citizen_id

                ORDER BY created_at DESC

            """), {
                "citizen_id": citizen_id
            })

            rows = result.mappings().all()

        return rows

    except Exception as e:

        print("GET ERROR =", e)

        return {
            "success": False,
            "error": str(e)
        }


# ================= DETAIL =================
@router.get("/treatment-detail/{id}")
def treatment_detail(id: int):

    try:

        with engine.begin() as conn:

            result = conn.execute(text("""

                SELECT
                    id,
                    citizen_id,
                    treatment_date,
                    treatment_text,
                    doctor_advice,
                    detail_text,
                    created_at

                FROM treatment_records

                WHERE id = :id

                LIMIT 1

            """), {
                "id": id
            })

            row = result.mappings().first()

        if not row:

            return {
                "success": False,
                "message": "not found"
            }

        return row

    except Exception as e:

        print("DETAIL ERROR =", e)

        return {
            "success": False,
            "error": str(e)
        }


# ================= UPDATE =================
@router.put("/update-treatment/{id}")
def update_treatment(id: int, data: Treatment):

    try:

        with engine.begin() as conn:

            # 🔥 check data
            check = conn.execute(text("""

                SELECT id
                FROM treatment_records

                WHERE id = :id

            """), {
                "id": id
            }).fetchone()

            if not check:

                return {
                    "success": False,
                    "message": "not found"
                }

            # 🔥 update
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
                "detail_text": data.detail_text
            })

        return {
            "success": True,
            "message": "updated"
        }

    except Exception as e:

        print("UPDATE ERROR =", e)

        return {
            "success": False,
            "error": str(e)
        }


# ================= DELETE =================
@router.delete("/delete-treatment/{id}")
def delete_treatment(id: int):

    try:

        with engine.begin() as conn:

            # 🔥 check
            check = conn.execute(text("""

                SELECT id
                FROM treatment_records

                WHERE id = :id

            """), {
                "id": id
            }).fetchone()

            if not check:

                return {
                    "success": False,
                    "message": "not found"
                }

            # 🔥 delete
            conn.execute(text("""

                DELETE FROM treatment_records

                WHERE id = :id

            """), {
                "id": id
            })

        return {
            "success": True,
            "message": "deleted"
        }

    except Exception as e:

        print("DELETE ERROR =", e)

        return {
            "success": False,
            "error": str(e)
        }