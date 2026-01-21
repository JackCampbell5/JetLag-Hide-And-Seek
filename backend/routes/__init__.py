from routes.auth import router as auth_router
from routes.game import router as game_router
from routes.stats import router as stats_router

__all__ = ["auth_router", "game_router", "stats_router"]
