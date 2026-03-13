from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import (
    enhancement,
    restoration,
    segmentation,
    morphological,
    fundamentals,
    frequency,
    color_processing,
)

app = FastAPI(title="DIP Toolkit API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

app.include_router(fundamentals.router, prefix="/api/fundamentals")
app.include_router(enhancement.router, prefix="/api/enhance")
app.include_router(frequency.router, prefix="/api/frequency")
app.include_router(restoration.router, prefix="/api/restore")
app.include_router(color_processing.router, prefix="/api/color")
app.include_router(segmentation.router, prefix="/api/segment")
app.include_router(morphological.router, prefix="/api/morphological")
