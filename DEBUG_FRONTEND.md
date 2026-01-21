# Frontend Error Debugging Guide

## Step-by-Step Debugging

### 1. Open Browser Console

1. Open your browser to http://localhost:5173
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Clear any old errors (click the 🚫 icon)

### 2. Check Network Tab

1. Click **Network** tab in DevTools
2. Make sure "All" filter is selected
3. Try drawing cards
4. Look for the `/api/game/draw` request

**What to check:**
- ✅ Request URL should be: `http://localhost:5173/api/game/draw`
- ✅ Method should be: `POST`
- ✅ Status should be: `200` (not 400 or 401)

### 3. Inspect the Failed Request

Click on the failed `/api/game/draw` request in Network tab:

**Check Headers Tab:**
- Look for `Authorization: Bearer eyJ...` header
- If missing → Auth token problem

**Check Payload Tab:**
- Should show: `{"question_type":"MATCHING"}` (or other valid type)
- If different format → Frontend sending wrong data

**Check Response Tab:**
- What error message do you see?
- Copy the full error message

### 4. Common Issues & Solutions

#### Issue 1: 401 Unauthorized

**Error in Console:**
```
Failed to draw cards: Error: Request failed with status code 401
```

**Cause:** No auth token or expired token

**Solution:**
```javascript
// Check if token exists
console.log('Token:', localStorage.getItem('token'));

// If null, you need to login again
// Go to login page and login
```

#### Issue 2: 400 Bad Request - Invalid question_type

**Error Response:**
```json
{
  "error": [
    {
      "validation": "enum",
      "code": "invalid_enum_value",
      "message": "Invalid enum value..."
    }
  ]
}
```

**Cause:** Frontend sending wrong question type format

**Valid question types:**
- `MATCHING`
- `MEASURING`
- `THERMOMETER`
- `RADAR`
- `TENTACLES`
- `PHOTOS`

**Solution:** Check what the frontend is sending in Network tab → Payload

#### Issue 3: CORS Error

**Error in Console:**
```
Access to fetch at 'http://localhost:8000/api/game/draw' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Cause:** Frontend not using proxy or backend CORS not configured

**Solution:**
1. Verify `frontend/vite.config.js` has proxy:
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

2. Restart frontend: `Ctrl+C` then `npm run dev`

#### Issue 4: Connection Refused

**Error in Console:**
```
Failed to draw cards: Error: Network Error
```

**Cause:** Backend not running

**Solution:**
```bash
# In api/ directory
npm run dev
```

Verify backend is running:
```bash
curl http://localhost:8000/api/health
```

### 5. Manual API Test

Open browser console and run:

```javascript
// Test health check
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Test draw with auth
fetch('/api/game/draw', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({ question_type: 'MATCHING' })
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

### 6. Check Token

In browser console:

```javascript
// Check if token exists
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);
console.log('Token length:', token?.length);

// Decode token (just to see payload, not validate)
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token payload:', payload);
  console.log('User ID:', payload.id);
  console.log('Username:', payload.username);

  // Check if expired (iat is issue time, expires in 30 min)
  const issuedAt = new Date(payload.iat * 1000);
  const expiresAt = new Date((payload.iat + 1800) * 1000); // +30 min
  console.log('Issued at:', issuedAt);
  console.log('Expires at:', expiresAt);
  console.log('Is expired:', new Date() > expiresAt);
}
```

### 7. Re-register/Login

If token is missing or expired:

1. Click "Logout" (if logged in)
2. Click "Register" (or "Login" if already have account)
3. Fill in form
4. Submit

Check console for:
```
Token saved: <long string>
```

### 8. Verify Backend Logs

In the terminal where backend is running, you should see:

**Successful request:**
```json
{"level":30,"reqId":"req-X","req":{"method":"POST","url":"/api/game/draw"},"msg":"incoming request"}
{"level":30,"reqId":"req-X","res":{"statusCode":200},"responseTime":15.23,"msg":"request completed"}
```

**Failed request:**
```json
{"level":30,"reqId":"req-X","res":{"statusCode":400},"msg":"request completed"}
{"level":30,"reqId":"req-X","res":{"statusCode":401},"msg":"request completed"}
```

### 9. Full Diagnostic Script

Run in browser console:

```javascript
async function diagnose() {
  console.log('=== Frontend Diagnostic ===\n');

  // 1. Check token
  const token = localStorage.getItem('token');
  console.log('1. Token exists:', !!token);
  if (!token) {
    console.error('❌ No token found. Please login first.');
    return;
  }
  console.log('   Token length:', token.length);

  // 2. Decode token
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('   User ID:', payload.id);
    console.log('   Username:', payload.username);

    const expiresAt = new Date((payload.iat + 1800) * 1000);
    const isExpired = new Date() > expiresAt;
    console.log('   Expired:', isExpired);

    if (isExpired) {
      console.error('❌ Token is expired. Please login again.');
      return;
    }
  } catch (e) {
    console.error('❌ Invalid token format:', e);
    return;
  }

  // 3. Test health endpoint
  console.log('\n2. Testing health endpoint...');
  try {
    const health = await fetch('/api/health').then(r => r.json());
    console.log('   ✅ Health:', health);
  } catch (e) {
    console.error('   ❌ Health check failed:', e);
    return;
  }

  // 4. Test auth endpoint
  console.log('\n3. Testing auth endpoint...');
  try {
    const me = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json());
    console.log('   ✅ User:', me);
  } catch (e) {
    console.error('   ❌ Auth failed:', e);
    return;
  }

  // 5. Test game state
  console.log('\n4. Testing game state...');
  try {
    const state = await fetch('/api/game/state', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json());
    console.log('   ✅ Game state:', state);
  } catch (e) {
    console.error('   ❌ Game state failed:', e);
    return;
  }

  // 6. Test draw cards
  console.log('\n5. Testing draw cards...');
  try {
    const draw = await fetch('/api/game/draw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ question_type: 'MATCHING' })
    });

    if (!draw.ok) {
      const error = await draw.json();
      console.error('   ❌ Draw failed:', draw.status, error);
      return;
    }

    const cards = await draw.json();
    console.log('   ✅ Drew cards:', cards.count);
    console.log('   Cards:', cards.cards.map(c => c.name));
  } catch (e) {
    console.error('   ❌ Draw failed:', e);
    return;
  }

  console.log('\n✨ All tests passed!');
}

diagnose();
```

### 10. Quick Fixes Checklist

- [ ] Backend is running (`npm run dev` in api/)
- [ ] Frontend is running (`npm run dev` in frontend/)
- [ ] Health check works: http://localhost:8000/api/health
- [ ] You are logged in (check localStorage.getItem('token'))
- [ ] Token is not expired (issued < 30 minutes ago)
- [ ] No CORS errors in console
- [ ] Request goes to `/api/game/draw` not `http://localhost:8000/api/game/draw`

### 11. If Nothing Works

**Nuclear option - Fresh start:**

1. **Logout and clear storage:**
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

2. **Register new user:**
- Use a different username
- Use a different email

3. **Try again**

### 12. Report the Error

If still not working, provide these details:

1. **Console error** (exact text):
```
[Copy full error from console]
```

2. **Network tab details:**
- Request URL:
- Status code:
- Request headers:
- Request payload:
- Response body:

3. **Backend logs** (last 5 lines from terminal where `npm run dev` is running)

4. **Token check:**
```javascript
console.log('Token exists:', !!localStorage.getItem('token'));
```

---

**Most Common Issue:** Token expired or not logged in. Solution: Login again!
