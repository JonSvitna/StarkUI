import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router
from app.schemas.schemas import HealthResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    version="2.0.0"
)

# CORS Configuration
logger.info(f"Configuring CORS with origins: {settings.cors_origins}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint for Railway"""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": "2.0.0"
    }

# Include API routes
app.include_router(router, prefix="/api")

# Root endpoint
@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": "2.0.0",
        "status": "online",
        "docs": "/docs"
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.APP_NAME}")
    logger.info(f"CORS origins: {settings.cors_origins}")
    logger.info(f"JWT protection enabled: {settings.ENABLE_JWT_PROTECTION}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
