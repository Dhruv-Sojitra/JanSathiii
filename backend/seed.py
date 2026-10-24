"""
SchemeSaathi AI — Database Seed Script
Populates the database with demo scheme data from data/schemes.json

Usage: python seed.py
Note: This creates DEMO data clearly marked as such. Do not use as official government information.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.database.connection import init_db, SessionLocal
from app.database.models import Scheme, EligibilityRule, RequiredDocument, SchemeSource
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATAFILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'schemes.json')

def seed():
    init_db()
    db = SessionLocal()
    try:
        existing = db.query(Scheme).count()
        if existing > 0:
            logger.info(f"Database already has {existing} schemes. Skipping seed. Use --force to reseed.")
            if '--force' not in sys.argv:
                return
            logger.info("--force flag detected. Clearing existing schemes...")
            db.query(EligibilityRule).delete()
            db.query(RequiredDocument).delete()
            db.query(SchemeSource).delete()
            db.query(Scheme).delete()
            db.commit()

        with open(DATAFILE, 'r', encoding='utf-8') as f:
            data = json.load(f)

        schemes_data = data.get('schemes', [])
        logger.info(f"Loading {len(schemes_data)} demo schemes...")

        for s in schemes_data:
            rules = s.pop('eligibility_rules', [])
            docs = s.pop('required_documents', [])
            sources = s.pop('sources', [])

            scheme = Scheme(**{k: v for k, v in s.items() if k not in ('eligibility_rules', 'required_documents', 'sources')})
            db.add(scheme)
            db.flush()

            for r in rules:
                db.add(EligibilityRule(scheme_id=scheme.id, **r))
            for d in docs:
                db.add(RequiredDocument(scheme_id=scheme.id, **d))
            for src in sources:
                db.add(SchemeSource(scheme_id=scheme.id, **src))

            logger.info(f"  ✓ {scheme.name} (ID: {scheme.id})")

        db.commit()
        logger.info(f"\n✅ Seed complete. {len(schemes_data)} DEMO schemes loaded.")
        logger.info("⚠  This is DEMO data for development purposes. Do not treat as official government information.")
    except FileNotFoundError:
        logger.error(f"schemes.json not found at {DATAFILE}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Seed failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == '__main__':
    seed()
