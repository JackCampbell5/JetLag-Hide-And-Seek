from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.user import User
from schemas.game_schema import (
    GameStateResponse,
    DrawCardsRequest,
    DrawCardsResponse,
    PlayCardRequest,
    UpdateHandRequest,
    UpdateHandSizeRequest,
    PlacePendingCardsRequest,
    Card
)
from services.auth_service import get_current_user
from services.card_service import generate_random_cards, get_draw_count
from services.game_service import (
    get_or_create_game_state,
    get_deck_composition,
    update_user_hand,
    update_hand_size,
    play_card_from_hand,
    place_pending_cards,
    log_game_action,
    update_statistics
)

router = APIRouter(prefix="/api/game", tags=["game"])


@router.get("/state", response_model=GameStateResponse)
async def get_game_state(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    game_state = get_or_create_game_state(db, current_user)

    return GameStateResponse(
        hand=game_state.hand,
        hand_size=game_state.hand_size,
        deck_size=len(game_state.deck),
        deck_composition=get_deck_composition(game_state)
    )


@router.post("/draw", response_model=DrawCardsResponse)
async def draw_cards(
    request: DrawCardsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    draw_count, pick_count = get_draw_count(request.question_type)

    if draw_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid question type"
        )

    # Get game state to use difficulty level for filtering
    game_state = get_or_create_game_state(db, current_user)

    # Generate random cards filtered by game difficulty
    cards = generate_random_cards(draw_count, game_state.hand_size)

    # Log action
    log_game_action(db, current_user.id, "draw_cards", {
        "question_type": request.question_type,
        "count": len(cards)
    })

    # Update statistics
    update_statistics(db, current_user.id, cards_drawn=len(cards))

    return DrawCardsResponse(
        cards=cards,
        count=draw_count,
        pick_count=pick_count
    )


@router.put("/hand", response_model=GameStateResponse)
async def update_hand(
    request: UpdateHandRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Convert Card objects to dictionaries
        hand_dicts = [card.dict() if card else None for card in request.hand]
        game_state = update_user_hand(db, current_user, hand_dicts)

        return GameStateResponse(
            hand=game_state.hand,
            hand_size=game_state.hand_size,
            deck_size=len(game_state.deck),
            deck_composition=get_deck_composition(game_state)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/hand-size", response_model=GameStateResponse)
async def change_hand_size(
    request: UpdateHandSizeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the game difficulty level (3=Small, 4=Medium, 5=Large)"""
    try:
        game_state = update_hand_size(db, current_user, request.game_size)

        return GameStateResponse(
            hand=game_state.hand,
            hand_size=game_state.hand_size,
            deck_size=len(game_state.deck),
            deck_composition=get_deck_composition(game_state)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/play", response_model=dict)
async def play_card(
    request: PlayCardRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        game_state, drawn_cards, auto_placed, placed_positions = play_card_from_hand(
            db,
            current_user,
            request.hand_position,
            request.discard_positions
        )

        response = {
            "success": True,
            "hand": game_state.hand,
            "hand_size": game_state.hand_size,
            "deck_size": len(game_state.deck),
            "deck_composition": get_deck_composition(game_state),
            "message": "Card played successfully"
        }

        if drawn_cards:
            response["drawn_cards"] = [card.dict() for card in drawn_cards]
            response["auto_placed"] = auto_placed
            response["placed_positions"] = placed_positions

            if not auto_placed:
                # Calculate how many cards need to be discarded
                empty_slots = sum(1 for card in game_state.hand if card is None)
                cards_to_place = len(drawn_cards)
                must_discard = cards_to_place - empty_slots

                response["message"] = f"Cards drawn but hand is full. Must discard {must_discard} card(s) to make room."
                response["must_discard_count"] = must_discard

        return response

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/place-pending-cards", response_model=GameStateResponse)
async def place_cards(
    request: PlacePendingCardsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Place pending cards into the hand after drawing cards when there wasn't enough space.
    User must specify which cards to discard to make room.
    """
    try:
        # Convert Card objects to dictionaries
        cards_dicts = [card.dict() for card in request.cards_to_place]

        game_state = place_pending_cards(
            db,
            current_user,
            cards_dicts,
            request.discard_positions
        )

        return GameStateResponse(
            hand=game_state.hand,
            hand_size=game_state.hand_size,
            deck_size=len(game_state.deck),
            deck_composition=get_deck_composition(game_state)
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/deck")
async def get_deck_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    game_state = get_or_create_game_state(db, current_user)

    return {
        "deck_size": len(game_state.deck),
        "deck_composition": get_deck_composition(game_state),
        "discard_pile_size": len(game_state.discard_pile),
        "hand_size": game_state.hand_size
    }
