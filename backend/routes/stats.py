from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.user import User
from models.game_state import UserStatistics, GameHistory
from schemas.game_schema import StatisticsResponse, GameHistoryItem
from services.auth_service import get_current_user

router = APIRouter(prefix="/api/stats", tags=["statistics"])


@router.get("/user", response_model=StatisticsResponse)
async def get_user_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stats = db.query(UserStatistics).filter(UserStatistics.user_id == current_user.id).first()

    if not stats:
        # Return default stats if none exist
        return StatisticsResponse(
            total_cards_drawn=0,
            total_cards_played=0,
            games_completed=0
        )

    return StatisticsResponse.from_orm(stats)


@router.get("/history", response_model=List[GameHistoryItem])
async def get_game_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    history = (
        db.query(GameHistory)
        .filter(GameHistory.user_id == current_user.id)
        .order_by(GameHistory.created_at.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    return [GameHistoryItem.from_orm(item) for item in history]
