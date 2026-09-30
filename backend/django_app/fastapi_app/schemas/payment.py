from pydantic import BaseModel, Field


class PaymentRequest(BaseModel):
    card_id: int
    amount: float = Field(gt=0)


class PaymentResponse(BaseModel):
    transaction_id: int
    user_id: int
    card_id: int
    amount: float
    status: str
    payment_reference: str