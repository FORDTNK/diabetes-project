from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_wound():
    return {"message": "wound router works"}
