from sqlalchemy import Column, Integer, ForeignKey, DateTime, String, JSON
from sqlalchemy.sql import func
from database import Base


class UserGameState(Base):
    __tablename__ = "user_game_state"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    hand = Column(JSON, default=list)  # Always 5 positions, null for empty slots
    game_size = Column(Integer, default=5)  # Game difficulty level (3=Small, 4=Medium, 5=Large)
    deck = Column(JSON, default=list)  # Deck composition for tracking
    discard_pile = Column(JSON, default=list)  # Discarded cards
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class GameHistory(Base):
    __tablename__ = "game_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    action_type = Column(String(50), nullable=False)  # "draw", "play", "discard", etc.
    action_data = Column(JSON)  # Additional data about the action
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UserStatistics(Base):
    __tablename__ = "user_statistics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    total_cards_drawn = Column(Integer, default=0)
    total_cards_played = Column(Integer, default=0)
    games_completed = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
