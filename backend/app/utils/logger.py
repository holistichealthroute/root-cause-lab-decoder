import os
import logging
import logging.config
from pathlib import Path

try:
    import yaml  # PyYAML
except ImportError as e:
    raise RuntimeError("PyYAML is required: pip install pyyaml") from e


def setup_logging(
    default_path: str | os.PathLike = Path(__file__).with_name("Nlog.yaml"),
    default_level: int = logging.INFO,
    env_key: str = "LOG_CFG",
) -> None:
    """
    Loads logging config from YAML.
    - If env var LOG_CFG is set, uses that path instead.
    - Falls back to basicConfig if YAML missing.
    """
    path = os.getenv(env_key, str(default_path))
    if os.path.exists(path):
        # Optional: allow ${ENV_VAR} in YAML by expanding first
        with open(path, "r", encoding="utf-8") as f:
            content = os.path.expandvars(f.read())
            config = yaml.safe_load(content)
        # Ensure log directory exists if using file handlers
        _ensure_file_handler_dirs(config)
        logging.config.dictConfig(config)
    else:
        logging.basicConfig(level=default_level)
        logging.getLogger(__name__).warning("Logging config file not found: %s", path)


def _ensure_file_handler_dirs(config: dict) -> None:
    """Create directories for file handlers if needed."""
    handlers = config.get("handlers", {}) or {}
    for h in handlers.values():
        if h.get("class", "").endswith("FileHandler"):
            filename = h.get("filename")
            if filename:
                Path(filename).parent.mkdir(parents=True, exist_ok=True)
