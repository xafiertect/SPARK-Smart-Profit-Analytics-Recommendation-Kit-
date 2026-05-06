from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import product, receipt, transaction, insight, auth, financial, consultant
from app.database import engine, Base
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup database tables on startup. 
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Clean up on shutdown
    await engine.dispose()

app = FastAPI(
    title="SPARK API",
    description="Smart Profit Analytics & Recommendation Kit API",
    version="0.1.0",
    lifespan=lifespan
)

# CORS Configuration
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173", # Vite default
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(product.router, prefix="/api/v1")
app.include_router(receipt.router, prefix="/api/v1")
app.include_router(transaction.router, prefix="/api/v1")
app.include_router(insight.router, prefix="/api/v1")
app.include_router(financial.router, prefix="/api/v1")
app.include_router(consultant.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to SPARK API"}
