from app.db.database import engine

try:
    with engine.connect() as conn:
        print("✅ MySQL connected")
except Exception as e:
    print("❌ Error:", e)