"""
GovLogic GovConAI - Main FastAPI Application
Production-ready with monitoring, security, and performance optimization
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.core.database import engine, Base
from app.middleware.monitoring import MonitoringMiddleware, get_metrics, sentry
from app.middleware.security import SecurityMiddleware, CSRFProtection, InputSanitizer
from app.middleware.performance import CachingMiddleware, DatabaseOptimization
import time
import os

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered government contracting and grants management platform"
)

# Initialize Sentry for error tracking
if os.getenv("SENTRY_DSN"):
    sentry.init_sentry(os.getenv("SENTRY_DSN"))

# CORS middleware (must be added first!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add production middleware (order matters!)
app.add_middleware(MonitoringMiddleware)
app.add_middleware(SecurityMiddleware)
app.add_middleware(CachingMiddleware)

# Initialize database optimization
db_optimizer = DatabaseOptimization()
if hasattr(settings, 'DATABASE_URL'):
    db_optimizer.setup_connection_pool(settings.DATABASE_URL)

# Request timing middleware (keep existing)
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Create database tables
@app.on_event("startup")
async def startup():
    """Create database tables on startup"""
    try:
        # Import all models to ensure they're registered
        from app.models import pipeline  # noqa
        
        Base.metadata.create_all(bind=engine)
        print(f"✅ {settings.APP_NAME} v{settings.APP_VERSION} started")
        db_url_safe = settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else 'configured'
        print(f"📊 Database: {db_url_safe}")
        print(f"🤖 AI Provider: {settings.DEFAULT_LLM_PROVIDER}")
        print(f"🔧 Debug Mode: {settings.DEBUG}")
        print(f"✅ Pipeline tables created/verified")
    except Exception as e:
        print(f"⚠️  Warning during startup: {str(e)}")
        print(f"✅ {settings.APP_NAME} v{settings.APP_VERSION} started (with warnings)")


@app.on_event("shutdown")
async def shutdown():
    """Cleanup on shutdown"""
    print(f"👋 {settings.APP_NAME} shutting down")


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }

# Metrics endpoint for Prometheus
@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    from fastapi.responses import Response
    metrics_data = get_metrics()
    return Response(metrics_data, media_type="text/plain")


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }


# API v1 routes
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.opportunities import router as opportunities_router
from app.api.proposals import router as proposals_router
from app.api.capture import router as capture_router
from app.api.grants import router as grants_router
from app.api import knowledge  # Import the new knowledge API
from app.api.competitors import router as competitors_router
from app.api.programs import router as programs_router
from app.api.ai_assistant import router as ai_assistant_router
from app.api.compliance import router as compliance_router
from app.api.pricing import router as pricing_router
from app.api.awards import router as awards_router
from app.api.content import router as content_router
from app.api.subscriptions import router as subscriptions_router
from app.api.analytics import router as analytics_router
from app.api.customer_portal import router as customer_portal_router
from app.api.websocket import router as websocket_router
from app.api.govbot import router as govbot_router
from app.api.qualification import router as qualification_router
from app.api.recommendations import router as recommendations_router
from app.api.advanced_features import router as advanced_features_router
from app.api.documents import router as documents_router
from app.api.proposals_data import router as proposals_data_router
from app.api.oauth import router as oauth_router
from app.api.realtime import router as realtime_router
from app.api.inztan import router as inztan_router
from app.api.continuous_learning import router as continuous_learning_router
from app.api.rich_editor import router as rich_editor_router
from app.api.enhanced_export import router as enhanced_export_router
from app.api.briefs import router as briefs_router
from app.api.pipeline import router as pipeline_router

# Auth routes (no prefix, already in router)
app.include_router(auth_router)

# Dashboard routes
app.include_router(
    dashboard_router,
    prefix=f"{settings.API_V1_PREFIX}/dashboard",
    tags=["dashboard"]
)

app.include_router(
    opportunities_router,
    prefix=f"{settings.API_V1_PREFIX}/opportunities",
    tags=["opportunities"]
)

app.include_router(
    proposals_router,
    prefix=f"{settings.API_V1_PREFIX}/proposals",
    tags=["proposals"]
)

app.include_router(
    capture_router,
    prefix=f"{settings.API_V1_PREFIX}/capture",
    tags=["capture"]
)

if settings.GRANTS_MODE:
    app.include_router(
        grants_router,
        prefix=f"{settings.API_V1_PREFIX}/grants",
        tags=["grants"]
    )

app.include_router(
    knowledge.router,
    prefix=f"{settings.API_V1_PREFIX}/knowledge",
    tags=["knowledge"]
)

# AI Assistant routes
app.include_router(
    ai_assistant_router,
    prefix=f"{settings.API_V1_PREFIX}/ai",
    tags=["ai"]
)

app.include_router(
    competitors_router,
    prefix=f"{settings.API_V1_PREFIX}/competitors",
    tags=["competitors"]
)

app.include_router(
    programs_router,
    prefix=f"{settings.API_V1_PREFIX}/programs",
    tags=["programs"]
)

app.include_router(
    compliance_router,
    tags=["compliance"]
)

app.include_router(
    pricing_router,
    tags=["pricing"]
)

app.include_router(
    awards_router,
    tags=["awards"]
)

app.include_router(
    content_router,
    tags=["content"]
)

app.include_router(
    subscriptions_router,
    tags=["subscriptions"]
)

app.include_router(
    analytics_router,
    tags=["analytics"]
)

app.include_router(
    customer_portal_router,
    tags=["customer_portal"]
)

app.include_router(
    websocket_router,
    tags=["websocket"]
)

app.include_router(
    govbot_router,
    tags=["govbot"]
)

app.include_router(
    qualification_router
)

app.include_router(
    recommendations_router
)

app.include_router(
    advanced_features_router,
    tags=["advanced"]
)

app.include_router(
    documents_router,
    tags=["documents"]
)

app.include_router(
    proposals_data_router,
    tags=["proposals-data"]
)

app.include_router(
    oauth_router,
    tags=["oauth"]
)

app.include_router(
    realtime_router,
    tags=["realtime"]
)

# InZTan Gov Supreme Overlord API
app.include_router(
    inztan_router,
    tags=["inztan"]
)

# Continuous Learning API
app.include_router(
    continuous_learning_router,
    tags=["continuous-learning"]
)

# Rich Editor API
app.include_router(
    rich_editor_router,
    tags=["rich-editor"]
)

# Enhanced Export API
app.include_router(
    enhanced_export_router,
    tags=["enhanced-export"]
)

# Briefs API
app.include_router(
    briefs_router,
    prefix=f"{settings.API_V1_PREFIX}/briefs",
    tags=["briefs"]
)

# Pipeline API
app.include_router(
    pipeline_router,
    tags=["pipeline"]
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )

