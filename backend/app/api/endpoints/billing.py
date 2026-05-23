import uuid
import time
import hmac
import hashlib
import requests
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from sqlalchemy.orm import Session
from ...database import connection, crud
from ...schemas import billing as billing_schemas
from ...core.config import settings
from .auth import get_current_user


router = APIRouter()

@router.post("/create-order", response_model=billing_schemas.BillingTransactionResponse)
def create_order(
    request: billing_schemas.BillingOrderCreate,
    db: Session = Depends(connection.get_db),
    current_user = Depends(get_current_user)
):
    """
    Generates a simulated Razorpay order ID for the checkout process, 
    and logs the transaction in the database.
    """
    # Define flat simulated pricing: Pro plan is 499.00 INR
    if request.plan_name.lower() == "pro":
        amount = 99.00
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported subscription plan requested."
        )

    # Generate a unique simulated order ID
    order_id = f"order_ipl_{uuid.uuid4().hex[:12]}"
    
    tx = crud.create_billing_transaction(
        db=db,
        user_id=current_user.id,
        order_id=order_id,
        amount=amount,
        plan_name=request.plan_name
    )
    return tx

def send_n8n_post_purchase_notification(username: str, amount: float, payment_id: str, plan_name: str):
    if not settings.N8N_WEBHOOK_URL:
        return
    payload = {
        "email": username,
        "amount": amount,
        "payment_id": payment_id,
        "plan_name": plan_name,
        "timestamp": time.time()
    }
    try:
        requests.post(settings.N8N_WEBHOOK_URL, json=payload, timeout=10)
    except Exception as e:
        print(f"[n8n webhook error]: {e}")

def verify_razorpay_signature(raw_body: bytes, signature: str, secret: str) -> bool:
    if not secret:
        return False
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        raw_body,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected_signature, signature)

@router.post("/verify-payment", status_code=status.HTTP_200_OK)
def verify_payment(
    request: billing_schemas.BillingVerification,
    background_tasks: BackgroundTasks,
    db: Session = Depends(connection.get_db),
    current_user = Depends(get_current_user)
):
    """
    Simulates Razorpay payment signature verification, updates transaction 
    status, and upgrades the authenticated user's tier to Pro.
    Triggers an outgoing n8n webhook notification.
    """
    # 1. Update the transaction in the database
    tx = crud.update_billing_transaction_status(
        db=db,
        order_id=request.order_id,
        payment_id=request.payment_id,
        status="captured"
    )
    
    if not tx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found."
        )
        
    # 2. Upgrade the user's subscription and refill credits
    crud.upgrade_user_subscription(
        db=db,
        user_id=current_user.id,
        subscription="pro",
        credits=9999
    )

    # 3. Trigger post-purchase automation via n8n
    if settings.N8N_WEBHOOK_URL:
        background_tasks.add_task(
            send_n8n_post_purchase_notification,
            current_user.username,
            tx.amount,
            request.payment_id,
            tx.plan_name
        )
    
    return {
        "message": "Payment verified successfully. Subscription upgraded to Pro.",
        "status": "success",
        "subscription": "pro",
        "credits": 9999
    }

@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(connection.get_db)
):
    """
    Razorpay Webhook receiver endpoint. Validates signatures using HMAC-SHA256,
    updates captured transaction logs, refuels user credit levels, and enqueues n8n sheet syncs.
    """
    signature = request.headers.get("X-Razorpay-Signature")
    if not signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Webhook signature header missing."
        )
        
    raw_body = await request.body()
    
    # Secure validation check if secret is configured
    if settings.RAZORPAY_WEBHOOK_SECRET:
        is_valid = verify_razorpay_signature(raw_body, signature, settings.RAZORPAY_WEBHOOK_SECRET)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Signature validation failed."
            )
            
    # Parse event contents
    try:
        event_data = await request.json()
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON body payload.")
        
    event_type = event_data.get("event")
    
    if event_type in ["payment.captured", "order.paid"]:
        payment_entity = event_data.get("payload", {}).get("payment", {}).get("entity", {})
        order_id = payment_entity.get("order_id")
        payment_id = payment_entity.get("id")
        amount = payment_entity.get("amount", 0) / 100.0
        
        if order_id and payment_id:
            # Update billing transaction status
            tx = crud.update_billing_transaction_status(db=db, order_id=order_id, payment_id=payment_id, status="captured")
            if tx:
                # Upgrade user status
                crud.upgrade_user_subscription(db=db, user_id=tx.user_id, subscription="pro", credits=9999)
                
                # Fetch user details for notification
                user = crud.get_user_by_id(db, user_id=tx.user_id)
                if user and settings.N8N_WEBHOOK_URL:
                    background_tasks.add_task(
                        send_n8n_post_purchase_notification,
                        user.username,
                        amount,
                        payment_id,
                        tx.plan_name
                    )
                    
    return {"status": "processed"}

@router.get("/history", response_model=List[billing_schemas.BillingTransactionResponse])
def get_billing_history(
    db: Session = Depends(connection.get_db),
    current_user = Depends(get_current_user)
):
    """
    Returns the full transaction log and subscription billing history for the user.
    """
    history = crud.get_billing_history_by_user(db=db, user_id=current_user.id)
    return history

@router.post("/confirm-upi", status_code=status.HTTP_200_OK)
def confirm_upi_payment(
    request: billing_schemas.UPIConfirmation,
    db: Session = Depends(connection.get_db),
    current_user = Depends(get_current_user)
):
    """
    Submits a UPI payment for admin verification. The user provides their UPI
    transaction reference ID after paying. The transaction is logged as 
    'pending_verification' and must be approved by an admin before the user 
    is upgraded to Pro.
    """
    ref = request.upi_reference.strip()
    
    # 1. Validate UPI reference format (10-35 alphanumeric characters)
    if len(ref) < 10 or len(ref) > 35:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid UPI Transaction Reference ID. Must be 10-35 characters."
        )
    if not ref.replace("-", "").replace("_", "").isalnum():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid UPI Transaction Reference ID. Only alphanumeric characters allowed."
        )
    
    # 2. Check for duplicate references (prevent replay attacks)
    existing = crud.check_duplicate_payment_id(db, payment_id=ref)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This UPI Transaction Reference has already been submitted. Please use a unique transaction ID."
        )
    
    # 3. Create transaction with pending_verification status
    order_id = f"upi_ipl_{uuid.uuid4().hex[:12]}"
    
    tx = crud.create_billing_transaction(
        db=db,
        user_id=current_user.id,
        order_id=order_id,
        amount=99.00,
        plan_name="Pro"
    )
    
    # 4. Update with UPI reference but keep status as pending
    crud.update_billing_transaction_status(
        db=db,
        order_id=order_id,
        payment_id=ref,
        status="pending_verification"
    )
    
    return {
        "message": "Payment reference submitted successfully. Your payment is pending admin verification. You will be upgraded to Pro once confirmed.",
        "status": "pending_verification",
        "order_id": order_id,
        "upi_reference": ref
    }



@router.get("/config")
def get_billing_config():
    """
    Returns public billing configurations, such as the Razorpay Key ID
    and UPI payment details for direct transfers.
    """
    return {
        "razorpay_key_id": settings.RAZORPAY_KEY_ID if settings.RAZORPAY_KEY_ID else None,
        "upi_id": settings.UPI_ID if settings.UPI_ID else None,
        "upi_payee_name": settings.UPI_PAYEE_NAME if settings.UPI_PAYEE_NAME else None,
        "upi_qr_url": "/assets/upi-qr-code.jpg"
    }

