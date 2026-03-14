from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    secret_key: str = "yoursecretkeyhere_keepitasecret"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    database_url: str = "sqlite:///./qmexai_dev.db"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Render.com injects postgres:// but SQLAlchemy strictly requires postgresql://
SQLALCHEMY_DATABASE_URL = settings.database_url
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Ensure SSL is used for remote Postgres (Render requirement)
if "postgresql" in SQLALCHEMY_DATABASE_URL and "localhost" not in SQLALCHEMY_DATABASE_URL and "127.0.0.1" not in SQLALCHEMY_DATABASE_URL:
    if "sslmode" not in SQLALCHEMY_DATABASE_URL:
        separator = "&" if "?" in SQLALCHEMY_DATABASE_URL else "?"
        SQLALCHEMY_DATABASE_URL += f"{separator}sslmode=require"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
