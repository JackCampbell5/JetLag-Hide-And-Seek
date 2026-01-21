from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from database import engine, Base
from routes import auth_router, game_router, stats_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="JetLag Hide-And-Seek Card Game API",
    description="API for card game with user authentication and game state management",
    version="1.0.0"
)

# Include API routers
app.include_router(auth_router)
app.include_router(game_router)
app.include_router(stats_router)

# Path to frontend build directory
FRONTEND_DIR = Path(__file__).parent.parent / "frontend" / "dist"

# Check if frontend build exists
if FRONTEND_DIR.exists():
    # Mount static files
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR / "assets")), name="assets")

    # Serve index.html for all non-API routes (SPA routing)
    @app.get("/{full_path:path}")
    async def serve_frontend(request: Request, full_path: str):
        # Don't serve frontend for API routes
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return {"detail": "Not Found"}

        # Serve index.html for all other routes
        return FileResponse(str(FRONTEND_DIR / "index.html"))
else:
    @app.get("/")
    async def root():
        return {
            "message": "JetLag Card Game API",
            "docs": "/docs",
            "frontend": "Not built yet. Run 'cd frontend && npm run build' to build the frontend."
        }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
