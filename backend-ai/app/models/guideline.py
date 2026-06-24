from sqlalchemy import Column, Integer, String, Text
from app.db.database import Base

class Guideline(Base):
    __tablename__ = "treatment_guideline"   # 🔥 แก้ตรงนี้

    guideline_id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer)
    grade = Column(String(50))
    self_care_advice = Column(Text)
    treatment_method = Column(Text)
    admin_id = Column(Integer)