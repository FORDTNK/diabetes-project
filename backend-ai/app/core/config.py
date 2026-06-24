from pathlib import Path

APP_DIR = Path(__file__).resolve().parents[1]
BACKEND_AI_DIR = APP_DIR.parent
PROJECT_DIR = BACKEND_AI_DIR.parent
UPLOADS_DIR = PROJECT_DIR / "uploads"
