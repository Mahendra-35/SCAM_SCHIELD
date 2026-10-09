from django.db import models
from django.contrib.auth.models import User

class ScamReport(models.Model):
    """
    Stores community scam incident reports submitted for research and awareness.
    Note: Does not request or store passwords, OTPs, or financial credentials.
    """
    CATEGORY_CHOICES = [
        ('JOB_INTERNSHIP', 'Job or Internship Scam'),
        ('PHISHING_EMAIL', 'Phishing & Email Scam'),
        ('BANKING_OTP', 'OTP & Banking Impersonation'),
        ('FAKE_SHOPPING', 'Fake Shopping Website'),
        ('INVESTMENT_CRYPTO', 'Investment & Crypto Scheme'),
        ('WFH_TASK', 'Work-From-Home Task Scam'),
        ('SOCIAL_LOTTERY', 'Social Media & Prize Scam'),
        ('OTHER', 'Other Suspicious Incident'),
    ]

    STATUS_CHOICES = [
        ('NEW', 'New Submission'),
        ('REVIEWED', 'Reviewed by Admin'),
        ('ARCHIVED', 'Archived'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='scam_reports')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField(help_text="Detailed description of what happened or suspicious message content.")
    suspicious_url = models.URLField(max_length=500, blank=True, null=True)
    explanation = models.TextField(blank=True, help_text="Additional context or how you encountered it.")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Report #{self.id} [{self.get_category_display()}] - {self.created_at.strftime('%Y-%m-%d')}"
