"""Centralized System & Operational Logger Module"""

import os
import logging
import json
from datetime import datetime, timezone

LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "logs")
os.makedirs(LOG_DIR, exist_ok=True)

SYSTEM_LOG_FILE = os.path.join(LOG_DIR, "system.log")
AUDIT_LOG_FILE = os.path.join(LOG_DIR, "audit_events.log")
ERROR_LOG_FILE = os.path.join(LOG_DIR, "errors.log")

# Configure logger
logger = logging.getLogger("investigation_system")
logger.setLevel(logging.INFO)

# Formatter
formatter = logging.Formatter('[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s')

# System File Handler
sys_handler = logging.FileHandler(SYSTEM_LOG_FILE)
sys_handler.setFormatter(formatter)
logger.addHandler(sys_handler)

# Error File Handler
err_handler = logging.FileHandler(ERROR_LOG_FILE)
err_handler.setLevel(logging.ERROR)
err_handler.setFormatter(formatter)
logger.addHandler(err_handler)

# Console Handler
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

def log_event(event_type: str, details: dict, level: str = "INFO"):
    """Log structured events to audit log file."""
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event_type": event_type,
        "details": details
    }
    log_line = json.dumps(entry)
    
    with open(AUDIT_LOG_FILE, "a") as f:
        f.write(log_line + "\n")

    if level == "ERROR":
        logger.error(f"{event_type} - {json.dumps(details)}")
    else:
        logger.info(f"{event_type} - {json.dumps(details)}")
