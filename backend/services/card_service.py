import json
import random
from pathlib import Path
from typing import List, Dict
from schemas.game_schema import Card, QuestionType

# Load cards from JSON file
CARDS_FILE = Path(__file__).parent.parent / "data" / "cards.json"


def load_cards() -> List[Dict]:
    """Load all card definitions from JSON file"""
    with open(CARDS_FILE, "r") as f:
        return json.load(f)


def get_allowed_difficulty(game_size: int) -> str:
    """
    Returns the single allowed difficulty level based on game size.

    game_size 3 -> "Small"
    game_size 4 -> "Medium"
    game_size 5 -> "Large"
    """
    if game_size == 3:
        return "Small"
    elif game_size == 4:
        return "Medium"
    else:  # game_size == 5
        return "Large"


def generate_random_cards(count: int, game_size: int = 5) -> List[Card]:
    """
    Generate random cards from the card pool, filtered by game size (difficulty level).
    Only includes cards that have non-zero values in the allowed difficulty column,
    OR special cards (Discard types).

    Args:
        count: Number of cards to generate
        game_size: Game difficulty level (3=Small, 4=Medium, 5=Large)

    Returns:
        List of Card objects
    """
    all_cards = load_cards()
    allowed_difficulty = get_allowed_difficulty(game_size)

    # Create a weighted pool based on 'cards' count, filtered by difficulty
    card_pool = []
    for card_def in all_cards:
        # Include if it's an Action card OR has value in allowed difficulty
        is_action_card = card_def["Type"] == "Action"
        has_allowed_difficulty = card_def.get(allowed_difficulty, 0) > 0

        if is_action_card or has_allowed_difficulty:
            # Add each card type 'cards' times to the pool
            for _ in range(card_def["cards"]):
                card_pool.append(card_def)

    # Randomly select 'count' cards from the pool
    selected_cards = random.sample(card_pool, min(count, len(card_pool)))

    # Convert to Card schema objects
    return [Card(**card) for card in selected_cards]


def get_draw_count(question_type: QuestionType) -> tuple[int, int]:
    """
    Get the draw count and pick count for a question type.
    Returns: (draw_count, pick_count)
    """
    draw_pick_mapping = {
        QuestionType.MATCHING: (3, 1),
        QuestionType.MEASURING: (3, 1),
        QuestionType.THERMOMETER: (2, 1),
        QuestionType.RADAR: (2, 1),
        QuestionType.TENTACLES: (4, 2),
        QuestionType.PHOTOS: (1, 1),
    }
    return draw_pick_mapping.get(question_type, (0, 0))
