"""
NewsShield_AI - FastAPI Main Application Entrypoint
Registers all endpoints for health, prediction, deep verification, URL scraping,
history, feedback, analytics, and PDF reporting.
Complies with PRD Section 14, 31, 32.
"""

import os
import sys
import time
import types
import uuid

# Ensure project root and backend directory are in sys.path for standalone or monorepo deployments
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(CURRENT_DIR)

if PARENT_DIR not in sys.path:
    sys.path.insert(0, PARENT_DIR)
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

# Virtual package alias in case deployed with backend as root
if "backend" not in sys.modules:
    backend_pkg = types.ModuleType("backend")
    backend_pkg.__path__ = [CURRENT_DIR]
    sys.modules["backend"] = backend_pkg

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.api.health import router as health_router
from backend.api.predict import router as predict_router
from backend.api.model_info import router as model_info_router
from backend.api.verification import router as verification_router
from backend.api.url_analysis import router as url_router
from backend.api.history import router as history_router
from backend.api.feedback import router as feedback_router
from backend.api.report import router as report_router

app = FastAPI(
    title="NewsShield_AI Platform API",
    description="AI-Powered News Credibility & Evidence Analysis Platform Backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_and_request_id(request: Request, call_next):
    """Adds unique request ID and execution latency headers."""
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response


# Include all standard routers
app.include_router(health_router)
app.include_router(predict_router)
app.include_router(model_info_router)
app.include_router(verification_router)
app.include_router(url_router)
app.include_router(history_router)
app.include_router(feedback_router)
app.include_router(report_router)

# Also include with /api prefix for Vercel rewrites compatibility
app.include_router(health_router, prefix="/api")
app.include_router(predict_router, prefix="/api")
app.include_router(model_info_router, prefix="/api")
app.include_router(verification_router, prefix="/api")
app.include_router(url_router, prefix="/api")
app.include_router(history_router, prefix="/api")
app.include_router(feedback_router, prefix="/api")
app.include_router(report_router, prefix="/api")


@app.get("/")
@app.get("/api")
def root():
    return {
        "service": "NewsShield_AI Platform API",
        "tagline": "Analyze. Verify. Stay Informed.",
        "status": "operational",
        "docs_url": "/docs",
        "health_check": "/health",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
