"""
Runtime patch to make fastapi-mail work with Pydantic v2.
This replaces the MessageSchema.__init__ to ignore the obsolete validator.
"""
from fastapi_mail import schemas
from functools import wraps

if not getattr(schemas.MessageSchema, "_patched_for_pydantic2", False):
    _orig_init = schemas.MessageSchema.__init__

    @wraps(_orig_init)
    def _safe_init(self, *args, **kwargs):
        # Skip the broken validation pipeline completely
        try:
            _orig_init(self, *args, **kwargs)
        except AttributeError as e:
            # silently ignore multipart_subtype issue
            if "multipart_subtype" not in str(e):
                raise
        return None

    schemas.MessageSchema.__init__ = _safe_init
    schemas.MessageSchema._patched_for_pydantic2 = True
    print("[Patch Applied] fastapi-mail __init__ overridden for Pydantic v2")
