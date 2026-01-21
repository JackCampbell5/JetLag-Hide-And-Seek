from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from typing import List, Optional, Dict
from models.game_state import UserGameState, GameHistory, UserStatistics
from models.user import User
from schemas.game_schema import Card
from services.card_service import generate_random_cards


def get_or_create_game_state(db: Session, user: User, hand_size: int = 5) -> UserGameState:
    """
    Get or create game state for a user.

    Note: hand_size represents game difficulty level (3=Small, 4=Medium, 5=Large),
    NOT the number of hand positions. Hand is always 5 positions.
    """
    game_state = db.query(UserGameState).filter(UserGameState.user_id == user.id).first()

    if not game_state:
        # Validate game_size (difficulty level)
        if hand_size < 3 or hand_size > 5:
            hand_size = 5  # Default to 5 (Large) if invalid

        # Create new game state with empty hand (always 5 slots)
        game_state = UserGameState(
            user_id=user.id,
            hand=[None] * 5,  # Always 5 positions
            hand_size=hand_size,  # This is difficulty level (3-5)
            deck=[],
            discard_pile=[]
        )
        db.add(game_state)

        # Also create statistics
        stats = UserStatistics(user_id=user.id)
        db.add(stats)

        db.commit()
        db.refresh(game_state)

    return game_state


def get_deck_composition(game_state: UserGameState) -> Dict[str, int]:
    """Calculate deck composition (for display purposes)"""
    composition = {}
    for card in game_state.deck:
        if card:
            card_type = f"{card.get('Type', 'Unknown')} ({card.get('color', 'Unknown')})"
            composition[card_type] = composition.get(card_type, 0) + 1
    return composition


def update_user_hand(db: Session, user: User, new_hand: List[Optional[Dict]]) -> UserGameState:
    """Update user's hand with new cards"""
    game_state = get_or_create_game_state(db, user)

    # Validate hand is always 5 positions
    if len(new_hand) != 5:
        raise ValueError("Hand must have exactly 5 positions")

    # Update hand
    game_state.hand = new_hand
    flag_modified(game_state, "hand")
    db.commit()
    db.refresh(game_state)

    # Log action
    log_game_action(db, user.id, "update_hand", {"hand": new_hand})

    return game_state


def play_card_from_hand(db: Session, user: User, hand_position: int, discard_positions: Optional[List[int]] = None) -> tuple[UserGameState, Optional[List[Card]], bool, List[int], Optional[Dict]]:
    """
    Play a card from hand.
    Returns: (updated_game_state, drawn_cards, auto_placed, placed_positions, curse_data)
    - drawn_cards: Cards that were drawn (None if no cards drawn)
    - auto_placed: True if cards were placed, False if user needs to choose placement
    - placed_positions: List of hand positions where cards were placed
    - curse_data: Curse card data if a curse was played (None otherwise)
    """
    game_state = get_or_create_game_state(db, user)

    if hand_position < 0 or hand_position >= game_state.hand_size:
        raise ValueError("Invalid hand position")

    card = game_state.hand[hand_position]
    if not card:
        raise ValueError("No card at this position")

    # Check if it's a special card
    drawn_cards = None
    auto_placed = True  # Default to True for regular cards
    placed_positions = []
    curse_data = None

    if card.get("Type") == "Curse":
        # Handle curse card
        casting_cost = card.get("casting_cost", {})
        discard_count = casting_cost.get("discard", 0)

        if discard_count > 0:
            # Validate discard positions
            if not discard_positions or len(discard_positions) != discard_count:
                raise ValueError(f"Must select {discard_count} card(s) to discard")

            # Check for duplicate positions
            if len(discard_positions) != len(set(discard_positions)):
                raise ValueError("Cannot select the same card position multiple times")

            # Validate discard positions
            for pos in discard_positions:
                if pos < 0 or pos >= game_state.hand_size or pos == hand_position:
                    raise ValueError(f"Invalid discard position: {pos}")
                if not game_state.hand[pos]:
                    raise ValueError(f"No card at position {pos}")

            # Discard selected cards
            for pos in discard_positions:
                game_state.discard_pile.append(game_state.hand[pos])
                game_state.hand[pos] = None

        # Move curse card to discard pile
        game_state.discard_pile.append(card)
        game_state.hand[hand_position] = None
        flag_modified(game_state, "hand")
        flag_modified(game_state, "discard_pile")

        # Store curse data to return to frontend
        curse_data = card

    elif card.get("name") == "Discard 1 Draw 2":
        if not discard_positions or len(discard_positions) != 1:
            raise ValueError("Must select 1 card to discard")
        drawn_cards, auto_placed, placed_positions = handle_discard_draw(db, game_state, user, hand_position, discard_positions, 1, 2)

    elif card.get("name") == "Discard 2 Draw 3":
        if not discard_positions or len(discard_positions) != 2:
            raise ValueError("Must select 2 cards to discard")
        drawn_cards, auto_placed, placed_positions = handle_discard_draw(db, game_state, user, hand_position, discard_positions, 2, 3)

    else:
        # Regular card - just remove from hand
        game_state.discard_pile.append(card)
        game_state.hand[hand_position] = None
        flag_modified(game_state, "hand")
        flag_modified(game_state, "discard_pile")

    db.commit()
    db.refresh(game_state)

    # Update statistics
    update_statistics(db, user.id, cards_played=1)

    # Log action
    log_game_action(db, user.id, "play_card", {
        "card": card,
        "position": hand_position,
        "discard_positions": discard_positions
    })

    return game_state, drawn_cards, auto_placed, placed_positions, curse_data


def handle_discard_draw(db: Session, game_state: UserGameState, user: User,
                       played_position: int, discard_positions: List[int],
                       discard_count: int, draw_count: int) -> tuple[List[Card], bool, List[int]]:
    """
    Handle special 'Discard X Draw Y' cards.
    Returns: (drawn_cards, auto_placed, placed_positions)
    - drawn_cards: The newly drawn cards
    - auto_placed: True if cards were automatically placed, False if user needs to choose placement
    - placed_positions: List of hand positions where cards were placed (empty if not auto-placed)
    """

    # Check for duplicate positions
    if len(discard_positions) != len(set(discard_positions)):
        raise ValueError("Cannot select the same card position multiple times")

    # Validate discard positions
    for pos in discard_positions:
        if pos < 0 or pos >= game_state.hand_size or pos == played_position:
            raise ValueError(f"Invalid discard position: {pos}")
        if not game_state.hand[pos]:
            raise ValueError(f"No card at position {pos}")

    # Discard cards
    for pos in discard_positions:
        game_state.discard_pile.append(game_state.hand[pos])
        game_state.hand[pos] = None

    # Remove the played card itself
    game_state.discard_pile.append(game_state.hand[played_position])
    game_state.hand[played_position] = None

    # Mark as modified so SQLAlchemy tracks the changes
    flag_modified(game_state, "hand")
    flag_modified(game_state, "discard_pile")

    # Draw new cards filtered by game difficulty
    new_cards = generate_random_cards(draw_count, game_state.hand_size)

    # Update statistics
    update_statistics(db, user.id, cards_drawn=len(new_cards))

    # Log action
    log_game_action(db, user.id, "draw_cards", {"count": len(new_cards)})

    # Check if there's enough empty space in hand for the drawn cards
    empty_slots = [i for i, card in enumerate(game_state.hand) if card is None]

    if len(empty_slots) >= len(new_cards):
        # Automatically place cards in empty slots
        placed_positions = []
        for i, card in enumerate(new_cards):
            position = empty_slots[i]
            game_state.hand[position] = card.dict()
            placed_positions.append(position)
        flag_modified(game_state, "hand")
        return new_cards, True, placed_positions
    else:
        # Not enough space - user must choose what to discard
        return new_cards, False, []


def log_game_action(db: Session, user_id: int, action_type: str, action_data: Dict):
    """Log a game action to history"""
    history_entry = GameHistory(
        user_id=user_id,
        action_type=action_type,
        action_data=action_data
    )
    db.add(history_entry)
    db.commit()


def place_pending_cards(db: Session, user: User, cards_to_place: List[Dict], discard_positions: List[int]) -> UserGameState:
    """
    Place pending cards into the hand, discarding cards as necessary.
    This is called when drawn cards couldn't be auto-placed due to lack of space.

    Args:
        cards_to_place: The cards that need to be placed into the hand
        discard_positions: Positions of cards to discard to make room
    """
    game_state = get_or_create_game_state(db, user)

    # Validate that we're discarding the right number of cards
    empty_slots = sum(1 for card in game_state.hand if card is None)
    cards_needed = len(cards_to_place)
    additional_discards_needed = cards_needed - empty_slots

    if additional_discards_needed < 0:
        raise ValueError("There's already enough space in the hand")

    if len(discard_positions) != additional_discards_needed:
        raise ValueError(f"Must discard exactly {additional_discards_needed} card(s) to make room")

    # Validate discard positions
    if len(discard_positions) != len(set(discard_positions)):
        raise ValueError("Cannot select the same card position multiple times")

    for pos in discard_positions:
        if pos < 0 or pos >= game_state.hand_size:
            raise ValueError(f"Invalid discard position: {pos}")
        if not game_state.hand[pos]:
            raise ValueError(f"No card at position {pos}")

    # Discard the selected cards
    for pos in discard_positions:
        game_state.discard_pile.append(game_state.hand[pos])
        game_state.hand[pos] = None

    # Now place the new cards in empty slots
    empty_slots_indices = [i for i, card in enumerate(game_state.hand) if card is None]

    if len(empty_slots_indices) < len(cards_to_place):
        raise ValueError("Not enough space even after discarding")

    for i, card in enumerate(cards_to_place):
        game_state.hand[empty_slots_indices[i]] = card

    # Mark as modified
    flag_modified(game_state, "hand")
    flag_modified(game_state, "discard_pile")

    db.commit()
    db.refresh(game_state)

    # Log action
    log_game_action(db, user.id, "place_pending_cards", {
        "cards_placed": len(cards_to_place),
        "discarded_positions": discard_positions
    })

    return game_state


def update_statistics(db: Session, user_id: int, cards_drawn: int = 0, cards_played: int = 0, games_completed: int = 0):
    """Update user statistics"""
    stats = db.query(UserStatistics).filter(UserStatistics.user_id == user_id).first()

    if stats:
        stats.total_cards_drawn += cards_drawn
        stats.total_cards_played += cards_played
        stats.games_completed += games_completed
        db.commit()


def update_hand_size(db: Session, user: User, new_game_size: int) -> UserGameState:
    """
    Update the game difficulty level (game_size) for a user's game state.

    Note: This does NOT resize the hand array - hand always stays at 5 positions.
    The hand_size field stores the difficulty level (3=Small, 4=Medium, 5=Large).
    """
    # Validate game_size (difficulty level)
    if new_game_size < 3 or new_game_size > 5:
        raise ValueError("Game size must be between 3 and 5")

    game_state = get_or_create_game_state(db, user)
    old_game_size = game_state.hand_size

    if old_game_size == new_game_size:
        return game_state

    # Update game_size field (hand stays at 5 positions)
    game_state.hand_size = new_game_size
    db.commit()
    db.refresh(game_state)

    # Log action
    log_game_action(db, user.id, "update_game_size", {
        "old_size": old_game_size,
        "new_size": new_game_size
    })

    return game_state
