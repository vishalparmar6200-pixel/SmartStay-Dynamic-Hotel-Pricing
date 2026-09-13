import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine, Base
from app.api.api_router import api_router

# Add backend, project root, and data folders to sys.path
APP_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(APP_DIR)
PROJECT_DIR = os.path.dirname(BACKEND_DIR)
DATA_DIR = os.path.join(PROJECT_DIR, "data")
for p in [BACKEND_DIR, PROJECT_DIR, DATA_DIR]:
    if os.path.exists(p) and p not in sys.path:
        sys.path.insert(0, p)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist
    Base.metadata.create_all(bind=engine)
    try:
        # Import and run auto-seeder if fresh DB
        from generate_dataset import seed_database
        seed_database()
    except Exception as e:
        print(f"Notice: Initial database check/seeding status: {e}")
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-style Hotel Revenue Management & Dynamic Pricing Platform powered by Explainable Rule-Based Analytics. ZERO ML / Black-box models.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Check if production frontend build is available
FRONTEND_DIST = os.path.join(PROJECT_DIR, "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Prevent intercepting unknown API or documentation routes
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="Resource not found")
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "system": "SmartStay – Dynamic Hotel Pricing & Revenue Optimization System",
            "category": "Revenue Management & Data Analytics",
            "pricing_engine": "Rule-Based Explainable Engine (No ML)",
            "api_docs": "/docs",
            "health": "/api/system/health"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
