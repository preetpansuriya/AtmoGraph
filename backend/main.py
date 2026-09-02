import sys
from pathlib import Path

# Ensure root directory and backend directory are in sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = Path(__file__).resolve().parent
for p in [str(ROOT_DIR), str(BACKEND_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from backend.config.settings import settings
    from backend.api.routes import router as api_router
    from backend.api.websocket import router as ws_router
except ModuleNotFoundError:
    from config.settings import settings
    from api.routes import router as api_router
    from api.websocket import router as ws_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    description="AtmoGraph AI Backend - Autonomous Supply Chain Shockwave & Chokepoint Engine"
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(ws_router)

@app.get("/")
def root():
    return {
        "engine": "AtmoGraph AI",
        "version": "3.0.0",
        "documentation": f"{settings.API_V1_STR}/docs",
        "status": "operational"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
