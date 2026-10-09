from django.db import models
from django.contrib.auth.models import User

class AnalysisRecord(models.Model):
    """
    Stores summary metadata for each scam analysis scan.
    Privacy note: Does not retain full sensitive messages by default; stores truncated snippets & score metrics.
    """
    CATEGORY_CHOICES = [
        ('JOB_INTERNSHIP', 'Job or Internship Offer'),
        ('SMS_CHAT', 'SMS or Chat Message'),
        ('EMAIL_PHISHING', 'Email Phishing'),
        ('WEBSITE_URL', 'Website URL'),
        ('SHOPPING_OFFER', 'Online Shopping Offer'),
        ('INVESTMENT_SCHEME', 'Investment or Money-Making Scheme'),
        ('OTHER', 'Other Suspicious Content'),
    ]

    RISK_LEVEL_CHOICES = [
        ('LOW', 'Low Risk Indicators'),
        ('MODERATE', 'Moderate Risk Indicators'),
        ('HIGH', 'High Risk Indicators'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='analysis_records')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='OTHER')
    input_snippet = models.CharField(max_length=300, blank=True, help_text="Truncated sanitized preview of submitted content.")
    url = models.URLField(max_length=500, blank=True, null=True)
    risk_score = models.IntegerField(default=0, help_text="Risk score from 0 to 100")
    risk_level = models.CharField(max_length=20, choices=RISK_LEVEL_CHOICES, default='LOW')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Scan #{self.id} - {self.get_category_display()} - {self.risk_level} ({self.risk_score})"

class AnalysisIndicator(models.Model):
    """
    Stores individual matched warning signs for an analysis record.
    """
    record = models.ForeignKey(AnalysisRecord, on_delete=models.CASCADE, related_name='indicators')
    rule_id = models.CharField(max_length=100)
    name = models.CharField(max_length=200)
    severity = models.CharField(max_length=20)
    weight = models.IntegerField(default=10)
    explanation = models.TextField()
    recommendation = models.TextField()
    context_snippet = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.severity})"
