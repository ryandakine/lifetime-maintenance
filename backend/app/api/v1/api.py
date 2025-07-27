from fastapi import APIRouter
from app.api.v1.endpoints import maintenance

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(maintenance.router, prefix="/maintenance", tags=["maintenance"]) 