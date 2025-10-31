import logging
from pathlib import Path
from typing import Optional
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from jinja2 import Environment, FileSystemLoader, select_autoescape
from app.utils import constants

from app.config import settings  # <-- your Settings above



class EmailService:
    """
    Loads templates once and sends emails using settings-based SMTP config.
    """
    def __init__(self, template_root: Optional[Path] = None):
        conf = self._build_connection_config()
        self.fm = FastMail(conf)
        self.logger = logging.getLogger(__name__)
        base = template_root or (Path(__file__).resolve().parents[1] / "templates")
        self.env = Environment(
            loader=FileSystemLoader(str(base)),
            autoescape=select_autoescape(["html", "xml"]),
        )
        # preload templates
        self.t_reset_html = self.env.get_template(constants.RESET_HTML_TEMPLATE)
        self.t_reset_text = self.env.get_template(constants.RESET_TEXT_TEMPLATE)

        self.sender_name = settings.MAIL_FROM_NAME
        self.support_email = settings.SUPPORT_EMAIL

    def _build_connection_config(self) -> ConnectionConfig:
        use_credentials = bool(settings.MAIL_USERNAME and settings.MAIL_PASSWORD) and not settings.MAIL_SUPPRESS_SEND
        # fastapi-mail >= 1.4.1 uses MAIL_STARTTLS / MAIL_SSL_TLS
        return ConnectionConfig(
            MAIL_USERNAME=settings.MAIL_USERNAME or "",
            MAIL_PASSWORD=settings.MAIL_PASSWORD or "",
            MAIL_FROM=settings.MAIL_FROM,
            MAIL_PORT=settings.MAIL_PORT,
            MAIL_SERVER=settings.MAIL_SERVER,
            MAIL_STARTTLS=settings.MAIL_TLS,
            MAIL_SSL_TLS=settings.MAIL_SSL,
            USE_CREDENTIALS=use_credentials,
            VALIDATE_CERTS=settings.MAIL_VALIDATE_CERTS,
            SUPPRESS_SEND=settings.MAIL_SUPPRESS_SEND,
        )

    async def send_password_reset(self, to_email: str, reset_url: str, *, ttl_minutes: int = 30) -> None:
        html_body = self.t_reset_html.render(
            reset_url=reset_url,
            ttl_minutes=ttl_minutes,
            support_email=self.support_email,
            app_name=settings.APP_NAME,
            logo_url=settings.LOGO_URL,
        )

        msg = MessageSchema(
            subject="Reset your password",
            recipients=[to_email],
            body=html_body,
            subtype=MessageType.html,
        )

        try:
            await self.fm.send_message(msg)
            if self.fm.config.SUPPRESS_SEND:
                self.logger.info("[SUPPRESS_SEND] Password reset for %s: %s", to_email, reset_url)
            else:
                self.logger.info("Password reset email sent to %s", to_email)
        except Exception as exc:
            self.logger.exception("Failed to send password reset email to %s: %s", to_email, exc)
            # optionally raise to fail the API:
            # from fastapi import HTTPException
            # raise HTTPException(status_code=502, detail="Email service unavailable")
