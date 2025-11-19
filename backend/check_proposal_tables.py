#!/usr/bin/env python3
"""
Check if proposal tables exist in the database
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base
from app.models.proposal import Proposal, ProposalSection, ProposalReview
from sqlalchemy import inspect, text

def check_tables():
    """Check if proposal tables exist"""
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    required_tables = ['proposals', 'proposal_sections', 'proposal_reviews']
    
    print("=" * 60)
    print("DATABASE TABLE CHECK FOR PROPOSALS")
    print("=" * 60)
    print()
    
    all_exist = True
    for table_name in required_tables:
        exists = table_name in existing_tables
        status = "✅ EXISTS" if exists else "❌ MISSING"
        print(f"{status}: {table_name}")
        if not exists:
            all_exist = False
    
    print()
    
    if all_exist:
        print("✅ All proposal tables exist!")
        print()
        print("Checking table columns...")
        print()
        
        # Check proposals table columns
        if 'proposals' in existing_tables:
            columns = inspector.get_columns('proposals')
            print("PROPOSALS TABLE COLUMNS:")
            for col in columns:
                nullable = "NULL" if col['nullable'] else "NOT NULL"
                print(f"  - {col['name']}: {col['type']} ({nullable})")
            print()
    else:
        print("❌ Some tables are missing!")
        print()
        print("To create tables, run:")
        print("  python -c 'from app.core.database import Base; from app.models.proposal import *; Base.metadata.create_all(bind=engine)'")
        print()
        print("Or restart the backend server (tables are auto-created on startup)")
    
    print("=" * 60)

if __name__ == "__main__":
    try:
        check_tables()
    except Exception as e:
        print(f"❌ Error checking tables: {str(e)}")
        sys.exit(1)

