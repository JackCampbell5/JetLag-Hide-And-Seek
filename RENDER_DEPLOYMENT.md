# Render Deployment Guide - JetLag Hide and Seek Card Game

This guide walks you through deploying your full-stack application (PostgreSQL + FastAPI + React) on Render.

## Prerequisites

- GitHub account with your code pushed to a repository
- Render account (sign up at https://render.com - free tier available)

## Deployment Options

### Option 1: One-Click Deploy with render.yaml (Recommended)

The project includes a `render.yaml` file that configures all services automatically.

#### Steps:

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Connect to Render**
   - Go to https://dashboard.render.com
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository containing your project
   - Render will detect `render.yaml` and show all services

3. **Review and Deploy**
   - Review the services that will be created:
     - **jetlag-database**: PostgreSQL database
     - **jetlag-backend**: FastAPI backend
     - **jetlag-frontend**: React frontend (static site)
   - Click "Apply" to create all services

4. **Wait for Deployment**
   - Database will be created first
   - Backend will build and deploy (may take 5-10 minutes)
   - Frontend will build and deploy
   - Monitor progress in the Render dashboard

5. **Access Your Application**
   - Once deployed, click on "jetlag-frontend" service
   - Your app URL will be: `https://jetlag-frontend.onrender.com`

---

### Option 2: Manual Service Creation

If you prefer to set up services manually:

#### Step 1: Create PostgreSQL Database

1. Go to Render Dashboard
2. Click "New" → "PostgreSQL"
3. Configure:
   - **Name**: `jetlag-database`
   - **Database**: `jetlag_card_game`
   - **User**: (auto-generated)
   - **Region**: Oregon (or closest to you)
   - **Plan**: Free
4. Click "Create Database"
5. Wait for database to be ready
6. Copy the "Internal Database URL" from the database dashboard

#### Step 2: Deploy Backend

1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `jetlag-backend`
   - **Region**: Oregon
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Environment**: `Python 3`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

4. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   - `DATABASE_URL`: Paste the Internal Database URL from Step 1
   - `SECRET_KEY`: Generate a secure 32+ character string (or use Render's "Generate" button)
   - `ALGORITHM`: `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `30`
   - `PYTHON_VERSION`: `3.11.0`

5. Set Health Check Path: `/api/health`
6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL: `https://jetlag-backend.onrender.com`

#### Step 3: Deploy Frontend

1. Click "New" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `jetlag-frontend`
   - **Region**: Oregon
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

4. Add Rewrite Rules (under "Redirects/Rewrites"):
   - **Source**: `/api/*`
   - **Destination**: `https://jetlag-backend.onrender.com/api/*`
   - **Type**: Rewrite

5. Click "Create Static Site"
6. Wait for deployment (3-5 minutes)
7. Your app will be available at: `https://jetlag-frontend.onrender.com`

---

## Post-Deployment

### Test Your Application

1. Visit your frontend URL: `https://jetlag-frontend.onrender.com`
2. Register a new user
3. Test game functionality:
   - Draw cards
   - Play cards
   - Check statistics

### Important Notes

#### Free Tier Limitations

- **Backend**: Spins down after 15 minutes of inactivity
  - First request after inactivity may take 30-60 seconds (cold start)
  - Consider upgrading to paid plan for always-on service

- **Database**:
  - 90 days of data retention
  - 1GB storage limit
  - Deleted after 90 days of inactivity

- **Frontend**: Always available (static sites don't spin down)

#### Security Recommendations

1. **Update CORS Settings** (Production):
   Edit `backend/main.py` and replace:
   ```python
   allow_origins=["*"]
   ```
   With your actual frontend domain:
   ```python
   allow_origins=["https://jetlag-frontend.onrender.com"]
   ```

2. **Secure SECRET_KEY**:
   - Never commit `.env` files
   - Use Render's environment variable feature
   - Regenerate if exposed

3. **HTTPS**:
   - Render provides free SSL certificates
   - All traffic is automatically encrypted

#### Monitoring

1. **View Logs**:
   - Go to your service in Render dashboard
   - Click "Logs" tab
   - Monitor for errors or issues

2. **Health Checks**:
   - Backend health endpoint: `https://jetlag-backend.onrender.com/api/health`
   - Should return: `{"status": "healthy"}`

3. **Database**:
   - Monitor storage usage in database dashboard
   - Set up alerts for high usage

---

## Troubleshooting

### Backend Won't Start

**Error**: `ModuleNotFoundError` or dependency issues
- Check that `requirements.txt` is up to date
- Verify build logs in Render dashboard
- Ensure Python version is 3.11+

**Error**: Database connection failed
- Verify `DATABASE_URL` environment variable is set correctly
- Check database is running and accessible
- Ensure you're using the "Internal Database URL"

### Frontend Shows 404 or API Errors

**Issue**: API calls failing
- Verify backend is deployed and running
- Check rewrite rules in frontend service
- Ensure backend URL in rewrite rule matches your backend service URL

**Issue**: Blank page
- Check browser console for errors (F12)
- Verify build completed successfully in Render logs
- Ensure `frontend/dist` directory is being published

### Cold Start Issues

**Issue**: First request takes 30-60 seconds
- This is expected on free tier after inactivity
- Consider upgrading to paid plan for always-on service
- Or implement a ping service to keep backend warm

---

## Updating Your Application

### Deploy Updates

1. **Push changes to GitHub**:
   ```bash
   git add .
   git commit -m "Update feature X"
   git push origin main
   ```

2. **Automatic Deployment**:
   - Render automatically detects changes
   - Rebuilds and redeploys affected services
   - Monitor deployment in dashboard

3. **Manual Deploy**:
   - Go to service in Render dashboard
   - Click "Manual Deploy" → "Deploy latest commit"

### Database Migrations

If you change database models:

1. Backup your database first (in Render dashboard)
2. Update your SQLAlchemy models
3. Push changes
4. Render will automatically recreate tables on next deploy
5. Or use Alembic for proper migrations (recommended for production)

---

## Costs

### Free Tier (What You Get)

- **PostgreSQL**: Free (1GB storage, 90 days retention)
- **Web Service (Backend)**: 750 hours/month free (spins down after 15 min)
- **Static Site (Frontend)**: Free (100GB bandwidth/month)

### Paid Plans (Optional)

- **Backend**: $7/month (always-on, no cold starts)
- **Database**: $7/month (10GB storage, continuous backups)

---

## Environment Variables Reference

### Backend Environment Variables

These are set automatically via `render.yaml` or manually in service settings:

```
DATABASE_URL=postgresql://user:pass@host:5432/database
SECRET_KEY=your-secure-random-32-char-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
PYTHON_VERSION=3.11.0
```

---

## Useful Commands

### View Backend Logs
```bash
# Install Render CLI (optional)
npm install -g @render/cli

# Login
render login

# View logs
render logs jetlag-backend --tail
```

### Database Access

1. Go to database in Render dashboard
2. Click "Connect" → "External Connection"
3. Use provided credentials with `psql`:
   ```bash
   psql postgresql://user:pass@host:5432/database
   ```

---

## Additional Resources

- Render Documentation: https://render.com/docs
- Render Status: https://status.render.com
- FastAPI on Render: https://render.com/docs/deploy-fastapi
- Static Sites on Render: https://render.com/docs/static-sites

## Getting Help

If you encounter issues:

1. Check Render dashboard logs
2. Review error messages in browser console (F12)
3. Verify all environment variables are set
4. Check Render status page for outages
5. Consult Render community forum: https://community.render.com

---

## Success Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Database deployed and running
- [ ] Backend deployed and health check passing
- [ ] Frontend deployed and accessible
- [ ] Can register new user
- [ ] Can draw and play cards
- [ ] API calls working correctly
- [ ] No console errors in browser

**Congratulations! Your JetLag Hide and Seek Card Game is now live!** 🎉
