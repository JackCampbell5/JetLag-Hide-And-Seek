# JetLag Hide and Seek Card Game (Unofficial)

A fan-made web implementation of the JetLag: The Game card game. Play the strategic card game where you draw, manage, and play various cards to build your deck and track your progress.

> **Disclaimer**: This is a fan-made project with no affiliation with, endorsement from, or connection to the official JetLag: The Game or its creators. All rights to the original game belong to their respective owners.

## Features

- **Full Card Game Implementation**: Draw from question types (Matching, Measuring, Thermometer, Radar, Tentacles, Photos)
- **Special Card Types**: Support for Time Bonus, Curse, Duplicate, and Discard cards
- **Game Size Options**: Play small , medium , or large games
- **Statistics Tracking**: Monitor total cards drawn, played, and games completed
- **Dark Mode**: Toggle between light and dark themes
- **User Authentication**: Secure registration and login system
- **Persistent Progress**: Save and resume your game state
- **Mobile Responsive**: Optimized for both desktop and mobile play

## Tech Stack

### Frontend

- **React 19** with Hooks
- **Vite** for fast development and building
- **React Router** for navigation
- **Axios** for API communication

### Backend

- **Node.js** with Fastify framework
- **PostgreSQL** database
- **Prisma ORM** for database management
- **JWT** authentication
- **Bcrypt** for password hashing

### Deployment

- **Vercel** for hosting (frontend and serverless functions)
- **Vercel Postgres** for production database

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/JackCampbell5/JetLag-Hide-And-Seek.git
   cd JetLag-Hide-And-Seek
   ```

2. **Install dependencies**

   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../api
   npm install
   ```

3. **Setup database**

   ```bash
   # Create PostgreSQL database
   psql -U postgres
   CREATE DATABASE jetlag_card_game;
   \q
   ```

4. **Configure environment variables**

   ```bash
   cd api
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/jetlag_card_game"
   JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long"
   PORT=8000
   NODE_ENV="development"
   ```

5. **Initialize the database**

   ```bash
   cd api
   npm run prisma:generate
   npx prisma db push
   ```

6. **Start the development servers**

   Terminal 1 (Backend):

   ```bash
   cd api
   npm run dev
   ```

   Terminal 2 (Frontend):

   ```bash
   cd frontend
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## Project Structure

```
JetLag-Hide-And-Seek/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Auth/       # Login/Register components
│   │   │   └── Game/       # Game board and card components
│   │   ├── context/        # React Context providers
│   │   ├── api/            # API client
│   │   ├── hooks/          # Custom React hooks
│   │   └── themes/         # Light/Dark theme definitions
│   └── package.json
│
├── api/                     # Node.js backend
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   ├── prisma/             # Database schema and migrations
│   ├── cards.json          # Card definitions
│   └── package.json
│
├── database/               # SQL schema reference
└── README.md
```

## Game Rules

1. **Select a Question Type**: Choose from Matching, Measuring, Thermometer, Radar, Tentacles, or Photos
2. **Draw Cards**: Draw the specified number of cards based on the question type
3. **Pick Cards**: Select the number of cards to add to your hand discarding if necessary
4. **Play Cards**: Click the play button to play cards
5. **Special Cards**:
   - **Time Bonus**: Adds time to your score
   - **Curse**: Applies negative effects (may require discarding cards)
   - **Duplicate**: Copy any card in your hand
   - **Discard X Draw Y**: Discard cards to draw more

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Game

- `GET /api/game/state` - Get current game state
- `POST /api/game/draw` - Draw cards
- `PUT /api/game/hand` - Update hand
- `POST /api/game/play` - Play a card
- `GET /api/game/deck` - Get deck info

### Statistics

- `GET /api/stats/user` - Get user statistics
- `POST /api/stats/reset` - Reset progress
- `GET /api/stats/history` - Get game history

## Development

### Running Tests

```bash
cd api
npm test
```

### Database Management

```bash
# View database in Prisma Studio
npm run prisma:studio

# Reset database
npx prisma db push --force-reset

# Generate Prisma Client after schema changes
npm run prisma:generate
```

### Code Style

- Frontend: ESLint configured for React
- Backend: Node.js best practices

## Deployment

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact

- **Developer**: jdeveloper012@gmail.com
- **Repository**: https://github.com/JackCampbell5/JetLag-Hide-And-Seek

## License

This is a fan-made project for educational and entertainment purposes. All rights to the original JetLag: The Game belong to their respective owners.

## Acknowledgments

- Inspired by JetLag: The Game
- Built with React, Node.js, and PostgreSQL
- Card game mechanics and design credit to the original creators

---

**Note**: This project is not affiliated with or endorsed by JetLag: The Game.
