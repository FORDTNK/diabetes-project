from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from app.db.database import Base

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.user_id"), nullable=False, index=True)
    grade = Column(String(10))
    class_id = Column(String(10))
    advice = Column(Text)
    wound_position = Column(String(100))
    image_name = Column(String(255))
    created_at = Column(DateTime)