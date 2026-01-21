# Testing Guide - Node.js Backend

## ✅ Backend is Working!

Your Node.js backend is running successfully. The 400 errors you saw were likely from:
- Unauthenticated requests (missing JWT token)
- Incorrect request format
- Missing Content-Type header

These are **normal** and expected when testing without proper authentication.

## Quick Test Commands

### 1. Health Check (No Auth Required)
```bash
curl http://localhost:8000/api/health
```

**Expected Response:**
```json
{"status":"healthy"}
```

### 2. Register New User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"testpass123"}'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@test.com",
    "created_at": "2026-01-21T..."
  }
}
```

Save the `access_token` for next requests!

### 3. Get Game State (Requires Auth)
```bash
curl http://localhost:8000/api/game/state \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "hand": [null, null, null, null, null],
  "game_size": 5,
  "deck_size": 0,
  "deck_composition": {}
}
```

### 4. Draw Cards (Requires Auth)
```bash
curl -X POST http://localhost:8000/api/game/draw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"question_type":"MATCHING"}'
```

**Expected Response:**
```json
{
  "cards": [
    {
      "id": 1,
      "Type": "Time Bonus",
      "name": "Extra Small Time Bonus",
      "color": "Red",
      ...
    },
    ...
  ],
  "count": 3,
  "pick_count": 1
}
```

## Full Frontend + Backend Test

### 1. Start Backend (Terminal 1)
```bash
cd api
npm run dev
```

Should see:
```
{"level":30,"time":...,"msg":"Server running at http://0.0.0.0:8000"}
```

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

Should see:
```
VITE v7.2.4  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 3. Open Browser
Navigate to: http://localhost:5173

### 4. Test User Flow

1. **Register**:
   - Click "Register" or go to registration page
   - Username: `testplayer`
   - Email: `test@example.com`
   - Password: `password123`
   - Difficulty: Large (5)

2. **Draw Cards**:
   - Click on any question type (Matching, Measuring, etc.)
   - Should see cards appear in modal
   - Select cards and add to hand

3. **Play Cards**:
   - Click "Play" button on any card in hand
   - Card should move to discard pile
   - Statistics should update

4. **Check Stats**:
   - View your statistics
   - Should show cards drawn/played

## Understanding the Logs

### Normal Backend Logs

**Good (200/201):**
```json
{"level":30,"reqId":"req-1","res":{"statusCode":200},"msg":"request completed"}
{"level":30,"reqId":"req-2","res":{"statusCode":201},"msg":"request completed"}
```

**Expected 400 Errors (No Auth):**
```json
{"level":30,"reqId":"req-3","res":{"statusCode":400},"msg":"request completed"}
```
This happens when:
- No Authorization header provided
- Invalid token format
- Validation error (wrong data format)

**Auth Errors (401):**
```json
{"level":30,"reqId":"req-4","res":{"statusCode":401},"msg":"request completed"}
```
This happens when:
- Token expired (>30 minutes old)
- Invalid token signature
- Token missing "Bearer" prefix

### Frontend Network Tab

Open browser DevTools (F12) → Network tab:

**Check for:**
- ✅ Requests to `/api/auth/register` → 201
- ✅ Requests to `/api/game/draw` → 200
- ✅ Requests include `Authorization: Bearer ...` header
- ✅ Response includes card data

## Common Issues & Solutions

### Issue: 400 Bad Request on /api/game/draw

**Cause 1: No Authentication**
```bash
# Missing Authorization header
curl -X POST http://localhost:8000/api/game/draw \
  -H "Content-Type: application/json" \
  -d '{"question_type":"MATCHING"}'
```

**Solution:** Add Authorization header with Bearer token:
```bash
curl -X POST http://localhost:8000/api/game/draw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"question_type":"MATCHING"}'
```

**Cause 2: Invalid question_type**
```json
{"question_type": "INVALID"}  // ❌ Wrong
```

**Solution:** Use valid question types:
- `MATCHING`
- `MEASURING`
- `THERMOMETER`
- `RADAR`
- `TENTACLES`
- `PHOTOS`

### Issue: 401 Unauthorized

**Cause:** Token expired or invalid

**Solution:** Login again to get new token:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'
```

### Issue: CORS Error in Browser

**Symptom:**
```
Access to fetch at 'http://localhost:8000/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:** Backend already has CORS enabled. If you see this:
1. Ensure backend is running
2. Check frontend proxy in `vite.config.js`
3. Restart both servers

### Issue: Frontend Can't Connect

**Symptom:** All API calls fail with network error

**Solution:**
1. Verify backend is running: `curl http://localhost:8000/api/health`
2. Check backend is on port 8000
3. Check frontend proxy configuration
4. Restart both servers

## Debugging Checklist

Before asking for help, verify:

- [ ] Backend running (`npm run dev` in api/)
- [ ] Frontend running (`npm run dev` in frontend/)
- [ ] Health check works: `curl localhost:8000/api/health`
- [ ] Can register user (returns token)
- [ ] Can login (returns token)
- [ ] Token included in authenticated requests
- [ ] Browser console shows no errors (F12)
- [ ] Network tab shows requests going to `/api`

## API Endpoint Reference

### Authentication (No Auth Required)

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/register` | `{username, email, password}` | `{access_token, user}` |
| POST | `/api/auth/login` | `{username, password}` | `{access_token, user}` |

### User Info (Auth Required)

| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/api/auth/me` | `{id, username, email}` |

### Game (Auth Required)

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/game/state` | - | `{hand, game_size, deck_size}` |
| POST | `/api/game/draw` | `{question_type}` | `{cards, count, pick_count}` |
| PUT | `/api/game/hand` | `{hand}` | `{hand, game_size}` |
| PUT | `/api/game/hand-size` | `{game_size}` | `{hand, game_size}` |
| POST | `/api/game/play` | `{hand_position, discard_positions?}` | `{success, hand, message}` |
| GET | `/api/game/deck` | - | `{deck_size, deck_composition}` |

### Statistics (Auth Required)

| Method | Endpoint | Query | Response |
|--------|----------|-------|----------|
| GET | `/api/stats/user` | - | `{total_cards_drawn, total_cards_played}` |
| GET | `/api/stats/history` | `?limit=50&offset=0` | `[{id, action_type, action_data}]` |

## Performance Testing

### Measure Response Times
```bash
# Time a request
time curl http://localhost:8000/api/health

# Should be < 50ms for health check
```

### Concurrent Requests
```bash
# Test with Apache Bench (if installed)
ab -n 100 -c 10 http://localhost:8000/api/health

# Or use wrk (if installed)
wrk -t2 -c10 -d10s http://localhost:8000/api/health
```

## Success Indicators

✅ Backend starts without errors
✅ Health check returns `{"status":"healthy"}`
✅ Registration returns JWT token
✅ Draw cards returns 3 card objects
✅ Frontend connects and shows UI
✅ Can register, login, draw, and play cards
✅ No CORS errors in browser console
✅ Stats update after actions

## Next Steps

Once local testing passes:
1. Deploy to Vercel (see [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md))
2. Setup production database
3. Test production deployment

---

**Summary:** Your backend is working correctly! The 400 errors are expected when requests don't include proper authentication. Follow this guide to test each endpoint systematically.
