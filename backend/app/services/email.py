"""Email service using Resend for transactional emails."""

import logging
from typing import Optional

import resend

from app.config import get_settings

logger = logging.getLogger("kolamba.email")
settings = get_settings()

FROM_EMAIL = "Kolamba <noreply@kolamba.com>"


def is_configured() -> bool:
    """Check if email service is configured."""
    return bool(settings.resend_api_key)


def _send(to: str, subject: str, html: str) -> Optional[str]:
    """Send an email via Resend. Returns email ID or None on failure."""
    if not is_configured():
        logger.warning("Email not sent (Resend not configured): to=%s subject=%s", to, subject)
        return None

    resend.api_key = settings.resend_api_key
    try:
        result = resend.Emails.send({
            "from": FROM_EMAIL,
            "to": [to],
            "subject": subject,
            "html": html,
        })
        email_id = result.get("id") if isinstance(result, dict) else None
        logger.info("Email sent: to=%s subject=%s id=%s", to, subject, email_id)
        return email_id
    except Exception as e:
        logger.error("Email send failed: to=%s error=%s", to, str(e))
        return None


def send_welcome(to: str, name: str, role: str) -> Optional[str]:
    """Send welcome email after registration."""
    subject = "Welcome to Kolamba!"
    html = f"""
    <h2>Welcome to Kolamba, {name}!</h2>
    <p>Your account has been created as a <strong>{role}</strong>.</p>
    <p>
      {"You can now browse artists and book performances for your community." if role == "community" else ""}
      {"Your artist profile is pending review. We'll notify you once it's approved." if role == "artist" else ""}
      {"You can now manage artists through your agent dashboard." if role == "agent" else ""}
    </p>
    <p>Visit <a href="https://kolamba.vercel.app">Kolamba</a> to get started.</p>
    <p>— The Kolamba Team</p>
    """
    return _send(to, subject, html)


def send_booking_confirmation(
    to: str, community_name: str, artist_name: str, date_str: str, location: str
) -> Optional[str]:
    """Send booking request confirmation to community."""
    subject = f"Booking Request Sent — {artist_name}"
    html = f"""
    <h2>Booking Request Submitted</h2>
    <p>Hi {community_name},</p>
    <p>Your booking request has been sent:</p>
    <ul>
      <li><strong>Artist:</strong> {artist_name}</li>
      <li><strong>Date:</strong> {date_str}</li>
      <li><strong>Location:</strong> {location}</li>
    </ul>
    <p>The artist will review your request and respond soon.</p>
    <p>— The Kolamba Team</p>
    """
    return _send(to, subject, html)


def send_artist_status_change(
    to: str, artist_name: str, new_status: str, reason: Optional[str] = None
) -> Optional[str]:
    """Notify artist of status change (approved/rejected)."""
    if new_status == "active":
        subject = "Your Kolamba Profile is Approved!"
        html = f"""
        <h2>Congratulations, {artist_name}!</h2>
        <p>Your artist profile has been <strong>approved</strong> and is now live on Kolamba.</p>
        <p>Communities can now discover and book you for performances.</p>
        <p>Visit <a href="https://kolamba.vercel.app/dashboard/artist">your dashboard</a> to manage your profile.</p>
        <p>— The Kolamba Team</p>
        """
    elif new_status == "rejected":
        reason_text = f"<p><strong>Reason:</strong> {reason}</p>" if reason else ""
        subject = "Update on Your Kolamba Application"
        html = f"""
        <h2>Hi {artist_name},</h2>
        <p>Unfortunately, your artist profile was not approved at this time.</p>
        {reason_text}
        <p>You can update your profile and resubmit for review.</p>
        <p>— The Kolamba Team</p>
        """
    else:
        subject = f"Kolamba Profile Status Update: {new_status}"
        html = f"""
        <h2>Hi {artist_name},</h2>
        <p>Your profile status has been updated to <strong>{new_status}</strong>.</p>
        <p>— The Kolamba Team</p>
        """
    return _send(to, subject, html)
