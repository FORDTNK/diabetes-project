from sqlalchemy import Column, Integer, String, Text, DateTime
from app.db.database import Base

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(String(20))
    grade = Column(String(10))
    class_id = Column(String(10))
    advice = Column(Text)
    wound_position = Column(String(100))
    image_name = Column(String(255))
    created_at = Column(DateTime)