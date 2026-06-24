from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# import routers
from app.routers import auth
from app.routers import blood_sugar
from app.routers import wound
from app.routers import diabetes
from app.routers import treatment

# import database
from app.db.database import engine, Base
from app.core.config import UPLOADS_DIR

# สร้างตาราง
Base.metadata.create_all(bind=engine)

# สร้าง app
app = FastAPI(title="Diabetes Care API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# health check
@app.get("/")
def health_check():
    return {"status": "ok"}

# static uploads
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOADS_DIR)),
    name="uploads"
)

# include routers
app.include_router(
    auth.router,
    prefix="/auth",
    tags=["Auth"]
)

app.include_router(
    blood_sugar.router,
    prefix="/blood-sugar",
    tags=["Blood Sugar"]
)

app.include_router(
    wound.router,
    prefix="/wound",
    tags=["Wound"]
)

app.include_router(
    diabetes.router,
    prefix="/api"
)

app.include_router(
    treatment.router,
    prefix="/api"
)
