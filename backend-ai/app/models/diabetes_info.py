from sqlalchemy import Column, Integer, String, Text
from app.db.database import Base


class DiabetesInfo(Base):
    __tablename__ = "diabetes_info"

    diabetes_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    title = Column(String)
    topic = Column(String)
    content = Column(Text)
    admin_id = Column(Integer)

    image_url = Column(Text)  # 🔥 เพิ่มบรรทัดนี้