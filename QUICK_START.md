# Quick Start Guide - Node.js Backend

## Test the Backend Locally

### 1. Setup Database

Make sure PostgreSQL is running, then:

```bash
# Create database (if not exists)
psql -U postgres
CREATE DATABASE jetlag_card_game;
\q
```

### 2. Configure Environment

```bash
cd api

# Create .env file
echo DATABASE_URL="postgresql://postgres:password@localhost:5432/jetlag_card_game" > .env
echo JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long-random" >> .env
echo PORT=8000 >> .env
echo NODE_ENV="development" >> .env
```

**Important**: Replace `password` with your actual PostgreSQL password!

### 3. Initialize Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database (creates tables)
npx prisma db push

# (Optional) Open Prisma Studio to view database
npm run prisma:studio
```

### 4. Start Backend

```bash
npm run dev
```

You should see:
```
Server running at http://0.0.0.0:8000
```

### 5. Test API

Open a new terminal and test the health endpoint:

```bash
curl http://localhost:8000/api/health
```

Should return:
```json
{"status":"healthy"}
```

### 6. Start Frontend (separate terminal)

```bash
cd frontend
npm run dev
```

Frontend should start at `http://localhost:5173`

### 7. Test Full Stack

1. Open browser to `http://localhost:5173`
2. Register a new user
3. Try drawing cards
4. Play some cards
5. Check statistics

## Troubleshooting

### "Cannot reach database server"

- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env` matches your PostgreSQL credentials
- Test connection: `psql -U postgres -d jetlag_card_game`

### "Cannot find module '@prisma/client'"

```bash
cd api
npm run prisma:generate
```

### Port 8000 already in use

Either:
1. Kill process on port 8000: `npx kill-port 8000`
2. Or change port in `.env`: `PORT=3001`

### Frontend can't connect to API

- Ensure backend is running on port 8000
- Check browser console for errors (F12)
- Frontend is configured to use `/api` (proxied by Vite)

## NPM Deprecation Warnings

The warnings you see are from transitive dependencies (dependencies of dependencies):
- `inflight`, `glob`, `tar` - Used by older npm packages
- These don't affect functionality
- Will be resolved when dependencies update
- Safe to ignore for development

To suppress warnings (optional):
```bash
npm install --no-audit --no-fund
```

## Next Steps

Once local testing works:

1. **Deploy to Vercel**: Follow [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
2. **Setup Production Database**: Use Vercel Postgres or Neon
3. **Configure Environment Variables** in Vercel Dashboard

## Database Schema Overview

Tables created by Prisma:
- `users` - User accounts with auth
- `user_game_state` - Player's hand, deck, discard pile
- `user_statistics` - Cards drawn/played stats
- `game_history` - Action log

View with:
```bash
npm run prisma:studio
```

## API Endpoints

All endpoints match the Python backend:

**Auth:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

**Game:**
- `GET /api/game/state`
- `POST /api/game/draw`
- `PUT /api/game/hand`
- `PUT /api/game/hand-size`
- `POST /api/game/play`
- `GET /api/game/deck`

**Stats:**
- `GET /api/stats/user`
- `GET /api/stats/history?limit=50&offset=0`

## Development Tips

**Watch mode** (auto-restart on changes):
```bash
npm run dev  # Uses Node --watch flag
```

**View logs**:
- Backend logs appear in terminal where you ran `npm run dev`
- Fastify includes request logging by default

**Database changes**:
1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push`
3. Restart server

**Reset database**:
```bash
npx prisma db push --force-reset
```

## Success Indicators

✅ Backend starts without errors
✅ Health check returns `{"status":"healthy"}`
✅ Can register user (201 response with token)
✅ Can login (200 response with token)
✅ Can draw cards (returns card array)
✅ Frontend connects to backend
✅ No CORS errors in browser console

Ready for Vercel deployment! 🚀
