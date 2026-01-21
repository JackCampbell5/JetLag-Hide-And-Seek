"""
Script to drop all tables and recreate them with the current schema
WARNING: This will delete all data!

Usage: python reset_database.py --confirm
"""
import sys
from database import Base, engine
from models.user import User
from models.game_state import UserGameState, GameHistory, UserStatistics

def reset_database():
    if '--confirm' not in sys.argv:
        print("WARNING: This will delete all existing data!")
        print("Usage: python reset_database.py --confirm")
        return

    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("SUCCESS: All tables dropped")

    print("Creating all tables with new schema...")
    Base.metadata.create_all(bind=engine)
    print("SUCCESS: All tables created")

    print("\nDatabase reset complete! You can now register a new user.")

if __name__ == "__main__":
    reset_database()
