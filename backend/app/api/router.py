from fastapi import APIRouter
from .endpoints import auth, predict, stats, admin, users, billing, n8n

api_router = APIRouter()

# Register individual sub-routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(predict.router, prefix="/predict", tags=["Predictions"])
api_router.include_router(stats.router, prefix="/stats", tags=["Statistics & Analytics"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin & MLOps Operations"])
api_router.include_router(users.router, prefix="/users", tags=["User Profiles"])
api_router.include_router(billing.router, prefix="/billing", tags=["Billing & SaaS Subscriptions"])
api_router.include_router(n8n.router, prefix="/n8n", tags=["n8n Automation Public API"])


