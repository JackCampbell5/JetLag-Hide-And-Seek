@echo off
echo ========================================
echo JetLag Card Game - Backend Setup
echo ========================================
echo.

cd api

echo [1/4] Checking if .env file exists...
if exist .env (
    echo    ✓ .env file found
) else (
    echo    Creating .env file...
    (
        echo DATABASE_URL=postgresql://postgres:password@localhost:5432/jetlag_card_game
        echo JWT_SECRET=change-this-to-a-random-32-character-string-for-production
        echo PORT=8000
        echo NODE_ENV=development
    ) > .env
    echo    ✓ .env file created
    echo    ⚠ IMPORTANT: Edit .env and set your PostgreSQL password!
)
echo.

echo [2/4] Generating Prisma Client...
call npm run prisma:generate
if errorlevel 1 (
    echo    ✗ Failed to generate Prisma Client
    echo    Make sure you ran: npm install
    pause
    exit /b 1
)
echo    ✓ Prisma Client generated
echo.

echo [3/4] Setting up database...
echo    This will create tables in your database
echo    Make sure PostgreSQL is running!
pause
call npx prisma db push
if errorlevel 1 (
    echo    ✗ Failed to setup database
    echo    Check your DATABASE_URL in .env
    pause
    exit /b 1
)
echo    ✓ Database setup complete
echo.

echo [4/4] Testing setup...
call node test-setup.js
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Start backend:  npm run dev
echo   2. Start frontend: cd ../frontend && npm run dev
echo.
echo Or deploy to Vercel:
echo   vercel --prod
echo.
pause
