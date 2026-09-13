from fastapi import APIRouter
from app.api.endpoints import (
    auth, hotels, rooms, bookings, occupancy,
    weather, events, demand, pricing, analytics,
    competitor, system
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(hotels.router)
api_router.include_router(rooms.router)
api_router.include_router(bookings.router)
api_router.include_router(occupancy.router)
api_router.include_router(weather.router)
api_router.include_router(events.router)
api_router.include_router(demand.router)
api_router.include_router(pricing.router)
api_router.include_router(analytics.router)
api_router.include_router(competitor.router)
api_router.include_router(system.router)
