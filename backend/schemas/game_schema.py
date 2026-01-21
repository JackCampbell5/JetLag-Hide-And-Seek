from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class QuestionType(str, Enum):
    MATCHING = "Matching"
    MEASURING = "Measuring"
    THERMOMETER = "Thermometer"
    RADAR = "Radar"
    TENTACLES = "Tentacles"
    PHOTOS = "Photos"


class Card(BaseModel):
    id: int
    Type: str
    color: Optional[str] = None
    name: Optional[str] = None
    cards: int
    Small: int | float
    Medium: int | float
    Large: int | float
    description: Optional[str] = None
    casting_cost: Optional[Dict[str, Any]] = None
    curse_text: Optional[str] = None


class GameStateResponse(BaseModel):
    hand: List[Optional[Card]]  # Always 5 positions
    game_size: int  # Game difficulty level (3=Small, 4=Medium, 5=Large)
    deck_size: int
    deck_composition: Dict[str, int]  # Card type -> count

    class Config:
        from_attributes = True


class DrawCardsRequest(BaseModel):
    question_type: QuestionType


class DrawCardsResponse(BaseModel):
    cards: List[Card]
    count: int
    pick_count: int


class PlayCardRequest(BaseModel):
    hand_position: int = Field(..., ge=0)
    discard_positions: Optional[List[int]] = None  # For special "Discard X Draw Y" cards


class UpdateHandRequest(BaseModel):
    hand: List[Optional[Card]]  # Always 5 positions


class UpdateHandSizeRequest(BaseModel):
    game_size: int = Field(..., ge=3, le=5, description="Game difficulty level (3=Small, 4=Medium, 5=Large)")


class PlacePendingCardsRequest(BaseModel):
    cards_to_place: List[Card]  # The cards that were drawn and need to be placed
    discard_positions: List[int] = Field(..., description="Positions of cards to discard to make room")


class StatisticsResponse(BaseModel):
    total_cards_drawn: int
    total_cards_played: int
    games_completed: int

    class Config:
        from_attributes = True


class GameHistoryItem(BaseModel):
    id: int
    action_type: str
    action_data: Optional[Dict[str, Any]]
    created_at: Any

    class Config:
        from_attributes = True
