import requests
import uuid

from fastapi import APIRouter, Header, HTTPException

from schemas.payment import PaymentRequest, PaymentResponse
from services.payment_service import process_payment
def verify_jwt_token(authorization: str):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header is required."
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Authorization header must use Bearer token."
        )

    token = authorization.split(" ", 1)[1]

    response = requests.post(
        "http://127.0.0.1:8000/api/token/verify/",
        json={"token": token}
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    payload = __import__("jwt").decode(
        token,
        options={"verify_signature": False}
    )

    return payload["user_id"]

router = APIRouter(
    prefix="/api/payments",
    tags=["Payments"]
)


@router.post("/", response_model=PaymentResponse)
def make_payment(
    payment: PaymentRequest,
    authorization: str = Header(None)
):
    authenticated_user_id = verify_jwt_token(authorization)
    # Step 1: Create transaction as PENDING
    # Generate a unique reference for every payment
    pending_reference = f"PENDING-{uuid.uuid4().hex[:10].upper()}"

    django_response = requests.post(
        "http://127.0.0.1:8000/api/transactions/create/",
        headers={
            "X-Internal-API-Key": "payment-service-secret-2026"
        },
        json={
            "user_id": authenticated_user_id,
            "card_id": payment.card_id,
            "amount": payment.amount,
            "status": "PENDING",
            "payment_reference": pending_reference
        }
    )

    if django_response.status_code != 201:
        return {
            "transaction_id": 0,
            "user_id": authenticated_user_id,
            "card_id": payment.card_id,
            "amount": payment.amount,
            "status": "FAILED",
            "payment_reference": pending_reference
        }

    transaction = django_response.json()

    transaction_id = transaction["id"]

    # Step 2: Simulate payment
    result = process_payment()

    final_status = result["status"]
    final_reference = result["payment_reference"]

    # Step 3: Update transaction status and payment reference
    update_response = requests.patch(
        f"http://127.0.0.1:8000/api/transactions/{transaction_id}/status/",
        headers={
            "X-Internal-API-Key": "payment-service-secret-2026"
        },
        json={
            "status": final_status,
            "payment_reference": final_reference
        }
    )

    if update_response.status_code != 200:
        return {
            "transaction_id": transaction_id,
            "user_id": authenticated_user_id,
            "card_id": payment.card_id,
            "amount": payment.amount,
            "status": "FAILED",
            "payment_reference": final_reference
        }

    # Step 4: Return final payment result
    return {
        "transaction_id": transaction_id,
        "user_id": authenticated_user_id,
        "card_id": payment.card_id,
        "amount": payment.amount,
        "status": final_status,
        "payment_reference": final_reference
    }