# api/app/routes/cards.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter()

# Example card metadata model
class CardInfo(BaseModel):
    name: str
    set: str
    number: str
    rarity: str
    type: str

# Placeholder in-memory list
FAKE_CARD_DB = [
    CardInfo(name="Charizard VMAX", set="Darkness Ablaze", number="020/189", rarity="Ultra Rare", type="Fire"),
    CardInfo(name="Pikachu V", set="Vivid Voltage", number="043/185", rarity="Rare Holo V", type="Electric"),
]

@router.get("/api/v1/cards", response_model=List[CardInfo])
async def list_cards():
    return FAKE_CARD_DB

@router.get("/api/v1/cards/{card_name}", response_model=CardInfo)
async def get_card(card_name: str):
    for card in FAKE_CARD_DB:
        if card.name.lower() == card_name.lower():
            return card
    raise HTTPException(status_code=404, detail="Card not found") 