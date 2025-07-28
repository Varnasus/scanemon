"""
Database configuration and connection management
"""

import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
import logging

logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:password@localhost:5432/scanemon"
)

# Fallback to SQLite for development if PostgreSQL is not available
if DATABASE_URL.startswith("postgresql://"):
    try:
        # Test PostgreSQL connection
        engine = create_engine(
            DATABASE_URL,
            poolclass=QueuePool,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            pool_recycle=3600,
        )
        # Test connection
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        logger.info("PostgreSQL connection successful")
        USE_POSTGRESQL = True
    except Exception as e:
        logger.warning(f"PostgreSQL connection failed: {e}, falling back to SQLite")
        DATABASE_URL = "sqlite:///./scanemon.db"
        USE_POSTGRESQL = False
else:
    USE_POSTGRESQL = False

# Create engine with appropriate configuration
if USE_POSTGRESQL:
    engine = create_engine(
        DATABASE_URL,
        poolclass=QueuePool,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=os.getenv("DEBUG", "false").lower() == "true"
    )
else:
    # SQLite configuration
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=os.getenv("DEBUG", "false").lower() == "true"
    )

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Metadata for migrations
metadata = MetaData()

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    try:
        # Import all models to ensure they're registered
        from app.models import user, card, collection, scan_analytics, moderation
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        # Create indexes for PostgreSQL
        if USE_POSTGRESQL:
            create_indexes()
            
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

def create_indexes():
    """Create database indexes for performance"""
    try:
        with engine.connect() as conn:
            # User indexes
            conn.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid)")
            
            # Card indexes
            conn.execute("CREATE INDEX IF NOT EXISTS idx_cards_name ON cards(name)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_cards_set ON cards(set_name)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_cards_rarity ON cards(rarity)")
            
            # Collection indexes
            conn.execute("CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_collections_card_id ON collections(card_id)")
            
            # Analytics indexes
            conn.execute("CREATE INDEX IF NOT EXISTS idx_scan_analytics_user_id ON scan_analytics(user_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_scan_analytics_created_at ON scan_analytics(created_at)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_scan_analytics_model_version ON scan_analytics(model_version)")
            
            # Moderation indexes
            conn.execute("CREATE INDEX IF NOT EXISTS idx_moderation_reports_user_id ON moderation_reports(user_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_moderation_reports_status ON moderation_reports(status)")
            
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Failed to create indexes: {e}")

def get_database_info():
    """Get database information"""
    return {
        "database_type": "PostgreSQL" if USE_POSTGRESQL else "SQLite",
        "database_url": DATABASE_URL.replace(DATABASE_URL.split("@")[0].split(":")[-1], "***") if "@" in DATABASE_URL else DATABASE_URL,
        "pool_size": engine.pool.size() if hasattr(engine.pool, 'size') else "N/A",
        "max_overflow": engine.pool.overflow() if hasattr(engine.pool, 'overflow') else "N/A"
    }

def health_check():
    """Check database health"""
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False 