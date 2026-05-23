import os
import sys
import logging
from pathlib import Path

# Add project root and backend to python path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def main():
    logger.info("Initializing offline Model Training runner...")
    
    # Check if raw data exists
    matches_path = ROOT_DIR / "backend" / "app" / "datasets" / "matches_raw.csv"
    if not matches_path.exists():
        logger.error("Raw datasets not found. Please run the backend data pipeline first:")
        logger.error("python -m backend.app.ml.data_pipeline")
        sys.exit(1)
        
    try:
        from backend.app.ml.train import train_and_evaluate_models
        train_and_evaluate_models()
        logger.info("Model training runner completed successfully.")
    except Exception as e:
        logger.error(f"Error executing offline training pipeline: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
