"""
Input sanitization and validation helper functions for ScamShield analysis engine.
"""

import re
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from django.utils.html import escape

MAX_TEXT_LENGTH = 10000
MIN_TEXT_LENGTH = 5

def sanitize_text(text: str) -> str:
    """
    Sanitizes user input text to prevent XSS and normalizes whitespace.
    """
    if not text:
        return ""
    # Strip whitespace and normalize multiple spaces
    cleaned = re.sub(r'\s+', ' ', text.strip())
    # HTML escape content to prevent code injection
    return escape(cleaned)

def validate_analysis_input(text: str, url: str = None, category: str = "OTHER"):
    """
    Validates input parameters before processing analysis.
    Raises ValidationError if invalid.
    """
    if not text and not url:
        raise ValidationError("Please provide either text message content or a website URL to analyze.")

    if text:
        if len(text.strip()) < MIN_TEXT_LENGTH:
            raise ValidationError(f"Content is too short. Please enter at least {MIN_TEXT_LENGTH} characters.")
        if len(text) > MAX_TEXT_LENGTH:
            raise ValidationError(f"Content exceeds maximum length limit of {MAX_TEXT_LENGTH} characters.")

    if url and url.strip():
        url_clean = url.strip()
        # Add protocol if missing for validation test
        if not re.match(r'^(?:http|ftp)s?://', url_clean, re.IGNORECASE):
            url_clean = "http://" + url_clean
        
        val = URLValidator()
        try:
            val(url_clean)
        except ValidationError:
            raise ValidationError("Invalid URL format. Please enter a valid website link (e.g. example.com or https://example.com).")

    valid_categories = [
        "JOB_INTERNSHIP", "SMS_CHAT", "EMAIL_PHISHING", "WEBSITE_URL",
        "SHOPPING_OFFER", "INVESTMENT_SCHEME", "OTHER"
    ]
    if category and category not in valid_categories:
        raise ValidationError(f"Invalid category selected. Must be one of: {', '.join(valid_categories)}")
