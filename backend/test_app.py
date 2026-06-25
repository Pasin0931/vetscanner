from fastapi import FastAPI
from auth.auth_router import router

app = FastAPI()

# mount only auth router for testing auth flows without loading full app
app.include_router(router, prefix="/auth")

__all__ = ("app",)
