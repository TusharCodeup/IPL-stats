from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")  # 'user' or 'admin'
    full_name = Column(String, nullable=True)
    credits = Column(Integer, default=5, nullable=False)
    subscription = Column(String, default="free", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    predictions = relationship("PredictionLog", back_populates="user", cascade="all, delete-orphan")

class PredictionLog(Base):
    __tablename__ = "prediction_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    team1 = Column(String, nullable=False)
    team2 = Column(String, nullable=False)
    venue = Column(String, nullable=False)
    toss_winner = Column(String, nullable=False)
    toss_decision = Column(String, nullable=False)
    predicted_winner = Column(String, nullable=False)
    win_probability = Column(Float, nullable=False)
    model_used = Column(String, nullable=False)
    explanation_summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="predictions")

class ModelMetric(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    retrained_on = Column(String, nullable=False)
    dataset_version = Column(String, nullable=False)
    roc_auc_pre_match = Column(Float, nullable=False)
    roc_auc_live_chase = Column(Float, nullable=False)
    run_id = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class BillingTransaction(Base):
    __tablename__ = "billing_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    order_id = Column(String, unique=True, index=True, nullable=False)
    payment_id = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR", nullable=False)
    status = Column(String, default="created", nullable=False)  # 'created', 'captured', 'failed'
    plan_name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")

