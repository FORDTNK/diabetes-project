from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

# โหลด .env
load_dotenv()

# อ่านค่าจาก .env
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3307")  # ⚠️ ของคุณคือ 3307 (docker)
DB_NAME = os.getenv("DB_NAME", "diabetic_foot_ai")

# สร้าง URL
DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
)

print("Connecting to:", DATABASE_URL)  # debug

# สร้าง engine
engine = create_engine(
    DATABASE_URL,
    echo=True,           # log SQL
    pool_pre_ping=True   # กัน connection หลุด
)

# session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# base model
Base = declarative_base()


# dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
