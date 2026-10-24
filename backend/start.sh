#!/bin/bash
# SchemeSaathi AI - Backend startup for Render
set -e
cd "$(dirname "$0")"
echo "=== Seeding database ==="
python seed.py
echo "=== Starting uvicorn on port ${PORT:-8000} ==="
python -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
