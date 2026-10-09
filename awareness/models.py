from django.db import models

class EducationalCategory(models.Model):
    """
    Category for educational awareness topics (e.g., Job Scams, Phishing, Banking).
    """
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    icon_class = models.CharField(max_length=50, default='bi-shield-exclamation', help_text="Bootstrap Icon class e.g. bi-briefcase")
    description = models.TextField()

    class Meta:
        verbose_name_plural = "Educational Categories"
        ordering = ['name']

    def __str__(self):
        return self.name

class EducationalArticle(models.Model):
    """
    Detailed guide for a specific scam type.
    """
    category = models.ForeignKey(EducationalCategory, on_delete=models.CASCADE, related_name='articles')
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    overview = models.TextField(help_text="What the scam looks like")
    warning_signs = models.JSONField(default=list, help_text="List of common warning signs strings")
    simulated_example = models.TextField(help_text="Realistic educational example message clearly labeled")
    verification_steps = models.JSONField(default=list, help_text="Step-by-step verification checklist")
    protection_tips = models.JSONField(default=list, help_text="Best practices to protect yourself")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return f"{self.category.name} - {self.title}"
