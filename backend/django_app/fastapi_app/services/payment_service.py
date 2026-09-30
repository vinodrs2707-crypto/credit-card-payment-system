import random
import uuid


def process_payment():
    """
    Simulates a payment.
    Returns SUCCESS or FAILED randomly.
    """

    status = random.choice(["SUCCESS", "FAILED"])

    payment_reference = f"PAY-{uuid.uuid4().hex[:10].upper()}"

    return {
        "status": status,
        "payment_reference": payment_reference
    }