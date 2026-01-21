# JetLag Hide and Seek Card Game - Implementation Details

## Overview

This is a web-based card game application inspired by the JetLag Hide and Seek game. Players draw cards based on question types and manage a hand of cards with different difficulty values.

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens
- **API Documentation**: Automatic OpenAPI/Swagger docs

### Frontend
- **Framework**: React
- **Routing**: React Router
- **State Management**: React Context API
- **Drag & Drop**: react-dnd
- **HTTP Client**: Axios

## Architecture

### Backend Structure

```
backend/
├── models/           # SQLAlchemy database models
│   ├── user.py      # User authentication model
│   └── game_state.py # Game state, history, statistics
├── routes/          # API endpoints
│   ├── auth.py      # Login, register, user management
│   ├── game.py      # Game logic endpoints
│   └── stats.py     # Statistics endpoints
├── services/        # Business logic
│   ├── auth_service.py
│   ├── card_service.py
│   └── game_service.py
├── schemas/         # Pydantic models for validation
│   └── game_schema.py
├── data/           # Game data
│   └── cards.json  # Card definitions
├── config.py       # Configuration settings
├── database.py     # Database connection
└── main.py         # Application entry point
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   └── Game/
│   │       ├── GameBoard.jsx
│   │       ├── Hand.jsx
│   │       ├── Card.jsx
│   │       ├── GameSizeSelector.jsx
│   │       └── CardSelectionModal.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── GameContext.jsx
│   ├── api/
│   │   └── client.js
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

## Game Logic

### Card System

Cards have three difficulty levels:
- **Small (S)**: Shortest duration/easiest
- **Medium (M)**: Moderate duration
- **Large (L)**: Longest duration/hardest

Game size (3-5) determines which difficulty level is shown on cards:
- Game size 3 = Only Small values shown
- Game size 4 = Only Medium values shown
- Game size 5 = Only Large values shown

### Question Types

Different question types draw different numbers of cards:
- **Matching**: Draw 3, Pick 1
- **Measuring**: Draw 3, Pick 1
- **Thermometer**: Draw 2, Pick 1
- **Radar**: Draw 2, Pick 1
- **Tentacles**: Draw 4, Pick 2
- **Photos**: Draw 1, Pick 1

### Special Cards

- **Discard 1 Draw 2**: Discard 1 card, draw 2 new cards
- **Discard 2 Draw 3**: Discard 2 cards, draw 3 new cards

These cards appear at all difficulty levels.

### Hand Management

- Hand always has 5 positions
- Cards can be dragged and dropped to rearrange
- Empty slots display as "Empty"
- Cards can be played from any position

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Game
- `GET /api/game/state` - Get current game state
- `POST /api/game/draw` - Draw cards based on question type
- `PUT /api/game/hand` - Update hand with new cards
- `PUT /api/game/hand-size` - Change game difficulty level
- `POST /api/game/play` - Play a card from hand
- `POST /api/game/place-pending-cards` - Place cards when hand is full
- `GET /api/game/deck` - Get deck information

### Statistics
- `GET /api/stats` - Get user statistics

## Database Schema

### Users Table
- id (Primary Key)
- username (Unique)
- email (Unique)
- hashed_password
- created_at

### User Game State Table
- id (Primary Key)
- user_id (Foreign Key)
- hand (JSON) - Always 5 positions
- hand_size (Integer) - Difficulty level (3-5)
- deck (JSON)
- discard_pile (JSON)
- created_at
- updated_at

### Game History Table
- id (Primary Key)
- user_id (Foreign Key)
- action_type (String)
- action_data (JSON)
- created_at

### User Statistics Table
- id (Primary Key)
- user_id (Foreign Key)
- total_cards_drawn
- total_cards_played
- games_completed
- created_at
- updated_at

## Key Features

1. **User Authentication**: Secure JWT-based authentication
2. **Game State Persistence**: All game state saved to database
3. **Card Filtering**: Cards filtered by difficulty level at generation time
4. **Drag and Drop**: Intuitive card management with react-dnd
5. **Action History**: All game actions logged for analytics
6. **Statistics Tracking**: Track cards drawn, played, and games completed
7. **Responsive UI**: Works on desktop and mobile devices

## Security

- Passwords hashed with bcrypt
- JWT tokens for stateless authentication
- SQL injection prevention with SQLAlchemy ORM
- CORS configured for frontend origin
- Input validation with Pydantic

## Development Notes

- Backend runs on port 8000
- Frontend dev server on port 5173 (Vite default)
- Database connection configured via environment variables
- Hot reload enabled for both frontend and backend
