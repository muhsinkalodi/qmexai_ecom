from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import traceback
from database import engine, Base
from routers import auth, products, orders, admin

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Qmexai API", version="1.0.0")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://qmexai-ecom-aeevo5nj9-muhsins-projects-e8411fc9.vercel.app",
    ],
    allow_origin_regex="https://.*vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_msg = str(exc)
    stack_trace = traceback.format_exc()
    print(f"Global Error Catch: {error_msg}")
    print(stack_trace)
    
    # Manually build the JSON response with CORS headers to ensure the browser can see it
    headers = {
        "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
    }
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": error_msg,
            "error_type": type(exc).__name__,
            "traceback": stack_trace
        },
        headers=headers
    )

@app.get("/debug-db")
def debug_db(db: Session = Depends(get_db)):
    try:
        # Try a simple query
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        return {"status": "success", "message": "Database connection is working!"}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e), "traceback": traceback.format_exc()}
        )

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Qmexai E-commerce API"}
