from app.db.database import engine

try:
    with engine.connect() as conn:
        print("✅ MySQL connected successfully")
except Exception as e:
    print("❌ Connection error:", e)