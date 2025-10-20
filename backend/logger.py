import logging, os
from datetime import datetime

LOG_FILE = os.path.join(os.path.dirname(__file__), "intellicore.log")

logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

def log_event(actor: str, action: str, entity: str, payload: dict = None):
    entry = f"{actor} | {action} | {entity} | {payload or ''}"
    logging.info(entry)
    print(entry)

if __name__ == "__main__":
    log_event("system", "startup", "logger")
