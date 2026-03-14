from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, products, orders, admin

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Qmexai API", version="1.0.0")

# Configure CORS for frontend access
# Note: When allow_credentials=True, allow_origins cannot be ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https://.*\.onrender\.com", # Allow any Render app
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Qmexai E-commerce API"}
