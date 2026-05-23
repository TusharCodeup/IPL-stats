from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BillingOrderCreate(BaseModel):
    plan_name: str = Field(..., description="Name of subscription plan (e.g. 'Pro')")

class BillingVerification(BaseModel):
    order_id: str = Field(..., description="Simulated order identifier")
    payment_id: str = Field(..., description="Simulated payment transaction identifier")
    signature: str = Field(..., description="Simulated Razorpay transaction signature verification")

class UPIConfirmation(BaseModel):
    upi_reference: str = Field(..., description="UPI Transaction Reference ID from the user's payment app")

class BillingTransactionResponse(BaseModel):
    id: int
    order_id: str
    payment_id: Optional[str] = None
    amount: float
    currency: str
    status: str
    plan_name: str
    created_at: datetime

    class Config:
        from_attributes = True
