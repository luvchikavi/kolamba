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


def send_password_reset(to: str, reset_link: str) -> Optional[str]:
    """Send password reset email with a link containing the JWT token."""
    subject = "Reset Your Kolamba Password"
    html = f"""
    <h2>Password Reset Request</h2>
    <p>We received a request to reset your password. Click the link below to set a new password:</p>
    <p><a href="{reset_link}" style="display:inline-block;padding:12px 24px;background:#0f172a;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you did not request a password reset, you can safely ignore this email.</p>
    <p>— The Kolamba Team</p>
    """
    return _send(to, subject, html)


def send_new_booking_request(
    to: str, artist_name: str, community_name: str, location: str, date_str: str
) -> Optional[str]:
    """Notify talent of a new booking request."""
    subject = f"New Booking Request from {community_name}"
    html = f"""
    <h2>New Booking Request</h2>
    <p>Hi {artist_name},</p>
    <p><strong>{community_name}</strong> has sent you a booking request:</p>
    <ul>
      <li><strong>Location:</strong> {location}</li>
      <li><strong>Date:</strong> {date_str}</li>
    </ul>
    <p>Log in to your <a href="https://kolamba.vercel.app/dashboard/talent?tab=bookings">dashboard</a> to review and submit a quote.</p>
    <p>— The Kolamba Team</p>
    """
    return _send(to, subject, html)


def send_quote_submitted(
    to: str, community_name: str, artist_name: str, amount: float
) -> Optional[str]:
    """Notify host that a talent submitted a quote."""
    subject = f"Quote Received from {artist_name}"
    html = f"""
    <h2>Quote Received</h2>
    <p>Hi {community_name},</p>
    <p><strong>{artist_name}</strong> has submitted a quote of <strong>${amount:,.2f}</strong> for your booking.</p>
    <p>Log in to your <a href="https://kolamba.vercel.app/dashboard/host/messages">dashboard</a> to review and respond.</p>
    <p>— The Kolamba Team</p>
    """
    return _send(to, subject, html)


def send_quote_approved(
    to: str, artist_name: str, community_name: str, amount: float
) -> Optional[str]:
    """Notify talent that their quote was approved."""
    subject = f"Quote Approved by {community_name}!"
    html = f"""
    <h2>Your Quote Was Approved!</h2>
    <p>Hi {artist_name},</p>
    <p>Great news! <strong>{community_name}</strong> has approved your quote of <strong>${amount:,.2f}</strong>.</p>
    <p>Log in to your <a href="https://kolamba.vercel.app/dashboard/talent/messages">dashboard</a> to see the details.</p>
    <p>— The Kolamba Team</p>
    """
    return _send(to, subject, html)


def send_quote_declined(
    to: str, artist_name: str, community_name: str, reason: str
) -> Optional[str]:
    """Notify talent that their quote was declined."""
    subject = f"Quote Update from {community_name}"
    html = f"""
    <h2>Quote Declined</h2>
    <p>Hi {artist_name},</p>
    <p><strong>{community_name}</strong> has declined your quote.</p>
    <p><strong>Reason:</strong> {reason}</p>
    <p>You can reach out via the <a href="https://kolamba.vercel.app/dashboard/talent/messages">messaging dashboard</a> to discuss further.</p>
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
        <p>Your talent profile has been <strong>approved</strong> and is now live on Kolamba.</p>
        <p>Hosts can now discover and book you for performances.</p>
        <p>Visit <a href="https://kolamba.vercel.app/dashboard/talent">your dashboard</a> to manage your profile.</p>
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
