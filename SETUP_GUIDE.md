# JetLag Hide and Seek Card Game - Setup Guide

## Prerequisites

### Required Software
- **Python 3.11+** - Backend runtime
- **Node.js 18+** - Frontend runtime and package manager
- **PostgreSQL 14+** - Database server
- **Git** - Version control

### Optional Tools
- **pgAdmin** or **DBeaver** - Database management GUI
- **Postman** or **Insomnia** - API testing
- **VS Code** - Recommended IDE

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd JetLag-Hide-And-Seek
```

### 2. Database Setup

#### Install PostgreSQL

**Windows:**
1. Download from [postgresql.org](https://www.postgresql.org/download/)
2. Run installer and remember the password you set
3. Add PostgreSQL bin directory to PATH

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE jetlag_card_game;

# Create user (optional, can use postgres user)
CREATE USER jetlag_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE jetlag_card_game TO jetlag_user;

# Exit psql
\q
```

### 3. Backend Setup

#### Navigate to Backend Directory
```bash
cd backend
```

#### Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

If `requirements.txt` doesn't exist, install manually:
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic python-jose passlib bcrypt python-multipart
```

#### Configure Environment Variables

Create `.env` file in `backend/` directory:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/jetlag_card_game
SECRET_KEY=your-secret-key-change-this-in-production-min-32-chars-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Important**: Change `your_password` to your PostgreSQL password and generate a secure SECRET_KEY.

#### Initialize Database

The database tables will be created automatically when you first run the backend.

#### Start Backend Server

```bash
python main.py
```

Server should start on `http://localhost:8000`

Visit `http://localhost:8000/docs` to see API documentation.

### 4. Frontend Setup

#### Navigate to Frontend Directory
```bash
# From root directory
cd frontend
```

#### Install Dependencies
```bash
npm install
```

If you encounter issues, try:
```bash
npm install --legacy-peer-deps
```

#### Configure API URL (if needed)

The frontend is configured to use `http://localhost:8000` for the backend API. If you need to change this, edit `frontend/src/api/client.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000';
```

#### Start Frontend Development Server

```bash
npm run dev
```

Frontend should start on `http://localhost:5173`

## Testing the Application

### 1. Access the Application
Open your browser and navigate to `http://localhost:5173`

### 2. Register a New User
1. Click "Register" or navigate to registration page
2. Choose a username (min 3 characters)
3. Enter a valid email
4. Create a password (min 6 characters)
5. Select game difficulty level (Small, Medium, or Large)
6. Click "Register"

### 3. Test Game Features
1. **Draw Cards**: Click on a question type to draw cards
2. **Select Cards**: Click on drawn cards to select them
3. **Add to Hand**: Add selected cards to your hand
4. **Play Cards**: Click "Play" on cards in your hand
5. **Special Cards**: Use Discard Draw cards to exchange cards
6. **Change Difficulty**: Use dropdown in top right to change difficulty level

## Common Issues and Solutions

### Backend Issues

#### Database Connection Error
```
sqlalchemy.exc.OperationalError: could not connect to server
```
**Solution**:
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env` file
- Verify database exists and credentials are correct

#### Port Already in Use
```
ERROR: [Errno 10048] error while attempting to bind on address
```
**Solution**:
- Change port in `main.py`: `uvicorn.run(app, host="0.0.0.0", port=8001)`
- Or kill process using port 8000

#### Module Not Found
```
ModuleNotFoundError: No module named 'fastapi'
```
**Solution**:
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### Frontend Issues

#### Port Already in Use
```
Port 5173 is in use, trying another one...
```
**Solution**: Vite will automatically try another port, or you can specify:
```bash
npm run dev -- --port 3000
```

#### API Connection Error
```
Network Error / CORS Error
```
**Solution**:
- Ensure backend is running on port 8000
- Check API_BASE_URL in `frontend/src/api/client.js`
- Verify CORS settings in backend `main.py`

#### Module Not Found
```
Error: Cannot find module 'react'
```
**Solution**:
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### Database Reset

If you need to reset the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Drop and recreate database
DROP DATABASE jetlag_card_game;
CREATE DATABASE jetlag_card_game;
\q
```

Then restart the backend to recreate tables.

## Development Workflow

### Making Changes

1. **Backend Changes**:
   - Modify Python files
   - Server auto-reloads (if using `--reload` flag)
   - Test changes via `/docs` or frontend

2. **Frontend Changes**:
   - Modify React components
   - Vite hot-reloads automatically
   - Check browser console for errors

### Adding New Features

1. Create database model in `backend/models/`
2. Create service functions in `backend/services/`
3. Create API schemas in `backend/schemas/`
4. Add routes in `backend/routes/`
5. Create React components in `frontend/src/components/`
6. Update context if needed in `frontend/src/context/`

## Production Deployment

### Backend
1. Set secure SECRET_KEY
2. Use production database
3. Enable HTTPS
4. Set DEBUG=False
5. Use gunicorn or similar WSGI server

### Frontend
1. Build production bundle: `npm run build`
2. Serve from `dist/` directory
3. Configure reverse proxy (nginx/Apache)
4. Enable gzip compression

### Database
1. Regular backups
2. Connection pooling
3. Read replicas for scaling
4. Monitoring and alerts

## Environment Variables Reference

### Backend `.env`
```env
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=<min-32-character-secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (if needed)
Create `.env` in `frontend/`:
```env
VITE_API_URL=http://localhost:8000
```

## Additional Resources

- FastAPI Documentation: https://fastapi.tiangolo.com/
- React Documentation: https://react.dev/
- SQLAlchemy Documentation: https://docs.sqlalchemy.org/
- PostgreSQL Documentation: https://www.postgresql.org/docs/

## Getting Help

If you encounter issues:
1. Check this guide for common solutions
2. Review error messages carefully
3. Check browser console (F12) for frontend errors
4. Check terminal for backend errors
5. Verify all services are running
6. Test API endpoints directly via `/docs`
