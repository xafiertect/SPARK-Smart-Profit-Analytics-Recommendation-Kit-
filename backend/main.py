from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers import auth, products, transactions, ocr, agent, dashboard, notifications, expenses

app = FastAPI(
    title="SPARK API",
    description="Smart Profit Analytics & Recommendation Kit — Backend",
    version="1.0.0",
)

# CORS — restrict in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # frontend dev server
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def envelope_response(request: Request, call_next):
    """Wrap successful JSON responses in {data, meta} envelope."""
    response = await call_next(request)

    # Skip non-JSON, errors, OpenAPI/docs, and health check
    content_type = response.headers.get("content-type", "")
    if (
        "application/json" not in content_type
        or response.status_code >= 400
        or request.url.path in ("/docs", "/redoc", "/openapi.json", "/health")
    ):
        return response

    # Read body, wrap in envelope
    body = b""
    async for chunk in response.body_iterator:
        body += chunk

    import json
    try:
        data = json.loads(body)
    except (json.JSONDecodeError, ValueError):
        return response

    envelope = {
        "data": data,
        "meta": {"timestamp": datetime.now(timezone.utc).isoformat()},
    }

    headers = dict(response.headers)
    if "content-length" in headers:
        del headers["content-length"]

    return JSONResponse(
        content=envelope,
        status_code=response.status_code,
        headers=headers,
    )


# Include routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(transactions.router)
app.include_router(ocr.router)
app.include_router(agent.router)
app.include_router(dashboard.router)
app.include_router(notifications.router)
app.include_router(expenses.router)


@app.get("/health", tags=["system"])
async def health_check():
    return {"status": "ok", "service": "spark-api"}
