from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_blood_sugar():
    return {"message": "blood sugar router works"}