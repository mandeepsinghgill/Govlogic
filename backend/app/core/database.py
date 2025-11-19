"""
Database connection and session management
"""
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
import time

# Create engine with retry logic
def create_db_engine():
    """Create database engine with connection retry"""
    max_retries = 5
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            # Fix deprecated postgres:// scheme
            db_url = settings.DATABASE_URL
            if db_url and db_url.startswith("postgres://"):
                db_url = db_url.replace("postgres://", "postgresql://", 1)
                
            engine = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                echo=settings.DEBUG
            )
            # Test connection
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print(f"✅ Database connection established")
            return engine
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"⚠️  Database connection attempt {attempt + 1} failed: {str(e)}")
                print(f"🔄 Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print(f"❌ Database connection failed after {max_retries} attempts: {str(e)}")
                raise

engine = create_db_engine()

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db():
    """Dependency for database sessions"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

