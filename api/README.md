# JetLag Hide-And-Seek Card Game - Node.js Backend

This is the Node.js rewrite of the FastAPI backend, designed for Vercel deployment.

## Tech Stack

- **Framework**: Fastify (high-performance Node.js web framework)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Zod schemas

## Local Development Setup

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running

### Installation

```bash
cd api
npm install
```

### Environment Variables

Create a `.env` file in the `api/` directory:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/jetlag_card_game"
JWT_SECRET="your-secret-key-change-this-in-production-min-32-chars-long"
JWT_EXPIRES_IN="30m"
PORT=8000
NODE_ENV="development"
```

### Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view/edit data
npm run prisma:studio
```

### Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:8000`

- API Documentation: Available at each endpoint
- Health Check: `http://localhost:8000/api/health`

## Project Structure

```
api/
├── index.js              # Main server file
├── package.json          # Dependencies
├── prisma/
│   └── schema.prisma     # Database schema
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── game.js           # Game logic routes
│   └── stats.js          # Statistics routes
├── services/
│   ├── cardService.js    # Card generation logic
│   └── gameService.js    # Game state management
├── utils/
│   ├── auth.js           # Auth helpers (bcrypt, JWT)
│   └── validation.js     # Zod validation schemas
└── cards.json            # Card definitions
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Game
- `GET /api/game/state` - Get game state (protected)
- `POST /api/game/draw` - Draw cards (protected)
- `PUT /api/game/hand` - Update hand (protected)
- `PUT /api/game/hand-size` - Update difficulty (protected)
- `POST /api/game/play` - Play card (protected)
- `POST /api/game/place-pending-cards` - Place pending cards (protected)
- `GET /api/game/deck` - Get deck info (protected)

### Statistics
- `GET /api/stats/user` - Get user statistics (protected)
- `GET /api/stats/history` - Get game history (protected)

## Differences from Python Backend

The Node.js backend is functionally equivalent to the Python FastAPI backend with these minor differences:

1. **Framework**: Fastify instead of FastAPI (similar performance, better for serverless)
2. **ORM**: Prisma instead of SQLAlchemy (modern, type-safe)
3. **Validation**: Zod instead of Pydantic (TypeScript-first validation)
4. **JWT Library**: @fastify/jwt instead of python-jose
5. **Password Hashing**: bcrypt (same library, Node.js version)

All game logic, card mechanics, and API contracts remain identical.

## Production Deployment

See the main project README for Vercel deployment instructions.
