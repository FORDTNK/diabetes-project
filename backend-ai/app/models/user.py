from sqlalchemy import Column, Integer, String
from app.db.database import Base

class User(Base):
    __tablename__ = "user"

    user_id = Column(Integer, primary_key=True, index=True)
    national_id = Column(String(13), unique=True, index=True)
    password = Column(String(255))
    first_name = Column(String(100))
    last_name = Column(String(100))
    birth_date = Column(String(20))
    phone = Column(String(20))