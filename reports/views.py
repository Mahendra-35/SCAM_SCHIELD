from django.shortcuts import render, redirect
from django.contrib import messages
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from .models import ScamReport

def report_incident_view(request):
    """
    Renders incident reporting page and processes user submission.
    """
    if request.method == 'POST':
        category = request.POST.get('category', 'OTHER')
        description = request.POST.get('description', '').strip()
        suspicious_url = request.POST.get('suspicious_url', '').strip()
        explanation = request.POST.get('explanation', '').strip()

        # Validation
        if not description or len(description) < 10:
            messages.error(request, "Please provide a description of at least 10 characters.")
            return render(request, 'report.html', {
                'category': category,
                'description': description,
                'suspicious_url': suspicious_url,
                'explanation': explanation
            })

        if suspicious_url:
            val = URLValidator()
            try:
                val(suspicious_url if suspicious_url.startswith(('http://', 'https://')) else 'http://' + suspicious_url)
            except ValidationError:
                messages.error(request, "Please enter a valid suspicious URL format or leave it blank.")
                return render(request, 'report.html', {
                    'category': category,
                    'description': description,
                    'suspicious_url': suspicious_url,
                    'explanation': explanation
                })

        user = request.user if request.user.is_authenticated else None
        
        ScamReport.objects.create(
            user=user,
            category=category,
            description=description,
            suspicious_url=suspicious_url if suspicious_url else None,
            explanation=explanation
        )

        messages.success(request, "Thank you for submitting this report. Your report helps train our cybersecurity awareness system and protect the community!")
        return redirect('report_incident')

    return render(request, 'report.html')
