from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime

from app.db.database import get_db
from app.core.config import BACKEND_AI_DIR, UPLOADS_DIR
from app.models.diabetes_info import DiabetesInfo
from app.models.analysis_history import AnalysisHistory
from app.models.guideline import Guideline
from app.deps.auth import get_current_user_id

import shutil
import tensorflow as tf
import numpy as np
from PIL import Image
from tensorflow.keras.applications.efficientnet import preprocess_input

router = APIRouter()

# ================== LOAD MODEL ==================
MODEL_PATH = BACKEND_AI_DIR / "app" / "model" / "best_efficientnetv2.keras"

model = tf.keras.models.load_model(MODEL_PATH)

CLASSES = [
    "Wagner 0",
    "Wagner 1",
    "Wagner 2",
    "Wagner 3",
    "Wagner 4",
    "Wagner 5"
]


def normalize_upload_url(image_url: str | None, image_name: str | None):
    if image_url:
        if image_url.startswith("http://") or image_url.startswith("https://") or image_url.startswith("/"):
            return image_url
        return f"/uploads/{image_url}"

    if image_name:
        return f"/uploads/{image_name}"

    return None

# ================== GET INFO ==================
@router.get("/diabetes")
def get_diabetes(
    db: Session = Depends(get_db)
):

    rows = db.execute(
        text(
            """
            SELECT
                d.title,
                d.topic,
                d.content,
                d.image_url,
                first_image.image_name
            FROM diabetes_info d
            LEFT JOIN (
                SELECT i.diabetes_id, i.image_name
                FROM image i
                INNER JOIN (
                    SELECT diabetes_id, MIN(image_id) AS image_id
                    FROM image
                    GROUP BY diabetes_id
                ) first_ids
                    ON first_ids.image_id = i.image_id
            ) AS first_image
                ON first_image.diabetes_id = d.diabetes_id
            ORDER BY d.diabetes_id DESC
            """
        )
    ).mappings().all()

    return [
        {
            "title": item["title"],
            "topic": item["topic"],
            "content": item["content"],
            "image_url": normalize_upload_url(item["image_url"], item["image_name"])
        }
        for item in rows
    ]


# ================== UPLOAD IMAGE ==================
@router.post("/upload")
def upload_image(
    file: UploadFile = File(...)
):

    try:

        UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

        file_path = UPLOADS_DIR / file.filename

        with open(file_path, "wb") as buffer:

            shutil.copyfileobj(file.file, buffer)

        return {
            "message": "upload success",
            "filename": file.filename,
            "path": f"/uploads/{file.filename}"
        }

    except Exception as e:

        return {
            "error": str(e)
        }


# ================== PREDICT AI ==================
@router.post("/predict")
def predict(
    file: UploadFile = File(...)
):

    try:

        image = Image.open(file.file).convert("RGB")

        image = image.resize((224, 224))

        img_array = np.array(image)

        img_array = np.expand_dims(
            img_array,
            axis=0
        )

        img_array = preprocess_input(img_array)

        prediction = model.predict(img_array)

        print("\n==== DEBUG ====")
        print("Raw prediction:", prediction)
        print("Argmax:", np.argmax(prediction))
        print("================\n")

        class_id = int(np.argmax(prediction))

        confidence = float(
            np.max(prediction)
        ) * 100

        return {
            "grade": CLASSES[class_id],
            "percent": round(confidence, 2)
        }

    except Exception as e:

        return {
            "error": str(e)
        }


# ================== GET GUIDELINE ==================
@router.get("/guideline/{grade}")
def get_guideline(
    grade: str,
    db: Session = Depends(get_db)
):

    if "class" in grade:

        class_name = grade

    else:

        class_name = f"class {grade}"

    data = db.query(Guideline).filter(
        Guideline.grade == class_name
    ).first()

    if not data:

        return {
            "error": "not found"
        }

    return {
        "self_care_advice": data.self_care_advice,
        "treatment_method": data.treatment_method
    }


def _format_history_item(item):
    return {
        "id": item.id,
        "user_id": item.user_id,
        "grade": item.grade,
        "class_id": item.class_id,
        "advice": item.advice,
        "wound_position": item.wound_position,
        "image_name": item.image_name,
        "created_at": item.created_at,
    }


# ================== SAVE ANALYSIS ==================
@router.post("/save-analysis")
def save_analysis(
    data: dict,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):

    try:

        new_record = AnalysisHistory(
            user_id=user_id,
            grade=data.get("grade"),
            class_id=data.get("class_id"),
            advice=data.get("advice"),
            wound_position=data.get("wound_position"),
            image_name=data.get("image_name"),
            created_at=datetime.now(),
        )

        db.add(new_record)

        db.commit()

        db.refresh(new_record)

        return {
            "message": "saved successfully",
            "id": new_record.id,
        }

    except IntegrityError:

        db.rollback()

        return {
            "error": "ไม่พบผู้ใช้ในระบบ กรุณาเข้าสู่ระบบใหม่",
        }

    except Exception as e:

        db.rollback()

        print("SAVE ERROR =", e)

        return {
            "error": str(e),
        }


# ================== GET HISTORY ==================
@router.get("/history")
def get_history(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):

    data = (
        db.query(AnalysisHistory)
        .filter(AnalysisHistory.user_id == user_id)
        .order_by(AnalysisHistory.created_at.desc())
        .all()
    )

    return [_format_history_item(item) for item in data]


# ================== HISTORY DETAIL ==================
@router.get("/history-detail/{history_id}")
def history_detail(
    history_id: int,
    db: Session = Depends(get_db)
):

    data = db.query(AnalysisHistory).filter(
        AnalysisHistory.id == history_id
    ).first()

    if not data:

        return {
            "error": "not found"
        }

    return _format_history_item(data)


# ================== DELETE HISTORY ==================
@router.delete("/delete-history/{history_id}")
def delete_history(
    history_id: int,
    db: Session = Depends(get_db)
):

    try:

        record = db.query(AnalysisHistory).filter(
            AnalysisHistory.id == history_id
        ).first()

        if not record:

            return {
                "success": False,
                "message": "ไม่พบข้อมูล"
            }

        # ลบรูป
        if record.image_name:

            image_path = UPLOADS_DIR / record.image_name

            if image_path.exists():

                image_path.unlink()

        # ลบ database
        db.delete(record)

        db.commit()

        return {
            "success": True,
            "message": "ลบสำเร็จ"
        }

    except Exception as e:

        db.rollback()

        print("DELETE HISTORY ERROR =", e)

        return {
            "success": False,
            "message": str(e)
        }
