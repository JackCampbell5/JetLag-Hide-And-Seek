# Vercel Deployment Guide - JetLag Hide and Seek Card Game

This guide walks you through deploying your full-stack application (PostgreSQL + Node.js/Fastify + React) on Vercel.

## What Changed

The backend has been **completely rewritten in Node.js** to be compatible with Vercel's serverless platform:

- **Old Backend**: Python + FastAPI
- **New Backend**: Node.js + Fastify
- **ORM**: Prisma (instead of SQLAlchemy)
- **Same Functionality**: All game logic, authentication, and API endpoints are identical

## Prerequisites

- GitHub account with your code pushed to a repository
- Vercel account (sign up at https://vercel.com - free tier available)
- PostgreSQL database (we'll use Vercel Postgres)

## Project Structure

```
JetLag-Hide-And-Seek/
├── api/                    # Node.js backend (NEW)
│   ├── index.js           # Main server
│   ├── package.json       # Dependencies
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── utils/             # Helpers
├── frontend/              # React frontend
├── backend/               # OLD Python backend (can be deleted)
└── vercel.json            # Vercel configuration
```

## Step-by-Step Deployment

### Step 1: Setup Database (Vercel Postgres)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose a name: `jetlag-database`
6. Select region closest to you
7. Click **Create**
8. Copy the connection string (you'll need this later)

**Alternative**: You can also use external PostgreSQL providers like:
- Neon (https://neon.tech) - Free tier, excellent for serverless
- Supabase (https://supabase.com) - Free tier with additional features
- Railway (https://railway.app) - Free tier

### Step 2: Prepare Your Code

1. **Push changes to GitHub**:
   ```bash
   git add .
   git commit -m "Add Node.js backend for Vercel deployment"
   git push origin main
   ```

2. **Verify these files exist**:
   - `api/package.json` ✓
   - `api/index.js` ✓
   - `api/prisma/schema.prisma` ✓
   - `vercel.json` ✓
   - `frontend/package.json` ✓

### Step 3: Deploy to Vercel

#### Option A: Deploy from Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Vercel will detect the configuration automatically

5. **Configure Environment Variables**:
   Click on **Environment Variables** and add:

   ```
   DATABASE_URL = postgresql://user:password@host:5432/database
   ```
   (Use the connection string from Step 1)

   ```
   JWT_SECRET = your-secure-random-32-character-string
   ```
   (Generate a secure random string)

6. Click **Deploy**
7. Wait 2-5 minutes for deployment to complete

#### Option B: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts to link project and set environment variables

# Deploy to production
vercel --prod
```

### Step 4: Setup Database Tables

After deployment, you need to initialize your database:

1. **Local Development (Optional)**:
   ```bash
   cd api
   npm install

   # Create .env file with your DATABASE_URL
   echo "DATABASE_URL=your-database-url-here" > .env
   echo "JWT_SECRET=your-secret-here" >> .env

   # Generate Prisma Client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate
   ```

2. **For Vercel Deployment**:

   Vercel will automatically run `prisma generate` during build, but you need to push the schema:

   ```bash
   # Set DATABASE_URL environment variable
   export DATABASE_URL="your-vercel-postgres-url"

   # Push schema to database
   cd api
   npx prisma db push
   ```

   Or use Prisma Studio to verify:
   ```bash
   npx prisma studio
   ```

### Step 5: Verify Deployment

1. **Check Deployment Status**:
   - Go to your Vercel project dashboard
   - You should see "Deployment Ready"
   - Your app URL: `https://your-project-name.vercel.app`

2. **Test API Endpoints**:
   - Health Check: `https://your-project-name.vercel.app/api/health`
   - Should return: `{"status": "healthy"}`

3. **Test Frontend**:
   - Visit: `https://your-project-name.vercel.app`
   - Try registering a new user
   - Test game functionality

### Step 6: Environment Variables Reference

In Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | PostgreSQL connection string |
| `JWT_SECRET` | `random-32-char-string` | Secret for JWT token signing |

**Important**: Never commit `.env` files to Git!

---

## Vercel Configuration Explained

The `vercel.json` file configures how Vercel builds and serves your app:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/dist/$1"
    }
  ]
}
```

- **Builds**: Defines how to build backend (Node.js) and frontend (static)
- **Routes**: Routes API calls to backend, everything else to frontend

---

## Troubleshooting

### Build Fails - "Cannot find module '@prisma/client'"

**Solution**: Ensure `postinstall` script runs `prisma generate` in `api/package.json`:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Database Connection Error

**Error**: `Can't reach database server`

**Solution**:
- Verify `DATABASE_URL` is set correctly in Vercel environment variables
- Check database is accessible (whitelist Vercel IPs if needed)
- For Vercel Postgres, ensure it's in the same region

### API Returns 404

**Error**: All API calls return 404

**Solution**:
- Check `vercel.json` routes configuration
- Ensure `/api/*` routes point to `api/index.js`
- Redeploy after making changes

### Frontend Shows Blank Page

**Solution**:
- Check browser console (F12) for errors
- Verify frontend build completed successfully in Vercel logs
- Check that `frontend/dist` is being served correctly

### CORS Errors

**Solution**:
The backend already has CORS enabled. If issues persist:
- Check frontend is making requests to correct API URL
- API calls should use relative paths: `/api/...` (already configured)

### "Prisma Client Not Generated"

**Solution**:
```bash
cd api
npx prisma generate
git add .
git commit -m "Add generated Prisma client"
git push
```

---

## Local Development

### Backend (Node.js)

```bash
cd api
npm install

# Create .env file
echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/jetlag_card_game" > .env
echo "JWT_SECRET=your-secret-key" >> .env

# Setup database
npm run prisma:generate
npm run prisma:migrate

# Start server
npm run dev
```

Backend runs at `http://localhost:8000`

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Updating Your Application

### Deploy Updates

1. **Make changes to your code**
2. **Commit and push**:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```
3. **Automatic deployment**: Vercel detects changes and redeploys automatically

### Database Schema Changes

If you modify `api/prisma/schema.prisma`:

```bash
# Generate new Prisma Client
cd api
npx prisma generate

# Push schema changes
npx prisma db push

# Commit changes
git add .
git commit -m "Update database schema"
git push
```

---

## Costs and Limits

### Vercel Free Tier

- **Bandwidth**: 100GB/month
- **Serverless Function Execution**: 100GB-Hrs
- **Builds**: 100 hours/month
- **Perfect for**: Personal projects, small apps

### Vercel Postgres Free Tier

- **Storage**: 256MB
- **Compute Time**: 60 hours/month
- **Data Transfer**: 256MB
- **Good for**: Development, small apps

### When to Upgrade

- High traffic (>100GB bandwidth/month)
- Large database (>256MB)
- Need custom domains
- Team collaboration features

Paid plans start at $20/month.

---

## Production Best Practices

### 1. Security

- ✓ Use strong `JWT_SECRET` (32+ random characters)
- ✓ Never commit `.env` files
- ✓ Use environment variables for all secrets
- ✓ Enable CORS only for your domain in production:
  ```javascript
  // api/index.js
  await fastify.register(cors, {
    origin: 'https://your-domain.vercel.app',
    credentials: true,
  });
  ```

### 2. Database

- ✓ Enable connection pooling (Prisma handles this)
- ✓ Regular backups (Vercel Postgres includes this)
- ✓ Monitor database size
- ✓ Use database indexes (already configured in schema)

### 3. Monitoring

- ✓ Check Vercel Analytics dashboard
- ✓ Monitor function execution times
- ✓ Set up error tracking (Sentry, LogRocket)
- ✓ Review serverless function logs

### 4. Performance

- ✓ Frontend is already optimized (Vite build)
- ✓ Backend uses Fastify (high performance)
- ✓ Static assets cached by Vercel CDN
- ✓ API responses are fast (serverless)

---

## Migration from Python Backend

The new Node.js backend is **100% compatible** with the existing frontend:

| Feature | Python (FastAPI) | Node.js (Fastify) | Status |
|---------|------------------|-------------------|--------|
| Authentication | ✓ | ✓ | ✓ Identical |
| JWT Tokens | ✓ | ✓ | ✓ Identical |
| Game Logic | ✓ | ✓ | ✓ Identical |
| Card Drawing | ✓ | ✓ | ✓ Identical |
| Statistics | ✓ | ✓ | ✓ Identical |
| Database Schema | ✓ | ✓ | ✓ Identical |
| API Endpoints | ✓ | ✓ | ✓ Identical |

**No frontend changes required!** The API contracts are identical.

### Can I delete the Python backend?

Yes! Once Node.js backend is deployed and tested:

```bash
# Backup first (optional)
mv backend backend_python_backup

# Or delete
rm -rf backend
```

---

## Additional Resources

- Vercel Documentation: https://vercel.com/docs
- Prisma Documentation: https://www.prisma.io/docs
- Fastify Documentation: https://www.fastify.io/docs
- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres

---

## Getting Help

If you encounter issues:

1. Check Vercel deployment logs
2. Review browser console (F12) for frontend errors
3. Test API endpoints directly:
   - `curl https://your-app.vercel.app/api/health`
4. Check database connectivity:
   - Use Prisma Studio: `npx prisma studio`
5. Verify environment variables are set in Vercel dashboard

---

## Success Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] PostgreSQL database created
- [ ] Environment variables configured
- [ ] Project deployed to Vercel
- [ ] Database schema pushed with Prisma
- [ ] Can access frontend at Vercel URL
- [ ] Health check returns {"status": "healthy"}
- [ ] Can register new user
- [ ] Can draw and play cards
- [ ] No console errors in browser

**Congratulations! Your JetLag Hide and Seek Card Game is now live on Vercel!** 🎉

---

## Quick Commands Reference

```bash
# Deploy to Vercel
vercel --prod

# Setup database locally
cd api && npm run prisma:migrate

# Push schema to production database
export DATABASE_URL="your-prod-db-url"
npx prisma db push

# View database
npx prisma studio

# Local development
cd api && npm run dev          # Backend at :8000
cd frontend && npm run dev     # Frontend at :5173

# Build frontend
cd frontend && npm run build

# Check Vercel logs
vercel logs
```
