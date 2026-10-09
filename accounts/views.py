import json
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.db.models import Count, Avg

from analyzer.models import AnalysisRecord, AnalysisIndicator
from reports.models import ScamReport
from .models import UserProfile

def register_view(request):
    """
    Handles new user registration.
    """
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            UserProfile.objects.get_or_create(user=user)
            login(request, user)
            messages.success(request, f"Welcome to ScamShield, {user.username}! Your account has been created.")
            return redirect('dashboard')
        else:
            for error in form.errors.values():
                messages.error(request, error)
    else:
        form = UserCreationForm()

    return render(request, 'registration/register.html', {'form': form})

def login_view(request):
    """
    Handles user authentication login.
    """
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, f"Welcome back, {user.username}!")
            next_url = request.GET.get('next', 'dashboard')
            return redirect(next_url)
        else:
            messages.error(request, "Invalid username or password. Please try again.")
    else:
        form = AuthenticationForm()

    return render(request, 'registration/login.html', {'form': form})

def logout_view(request):
    """
    Logs out current user.
    """
    logout(request)
    messages.info(request, "You have been logged out successfully.")
    return redirect('home')

@login_required
def user_dashboard_view(request):
    """
    Personal analysis history dashboard for authenticated users.
    """
    user_scans = AnalysisRecord.objects.filter(user=request.user).prefetch_related('indicators')
    total_count = user_scans.count()
    low_count = user_scans.filter(risk_level='LOW').count()
    mod_count = user_scans.filter(risk_level='MODERATE').count()
    high_count = user_scans.filter(risk_level='HIGH').count()

    context = {
        'scans': user_scans,
        'total_scans': total_count,
        'low_count': low_count,
        'mod_count': mod_count,
        'high_count': high_count,
    }
    return render(request, 'dashboard.html', context)

@user_passes_test(lambda u: u.is_staff or u.is_superuser, login_url='login')
def admin_dashboard_view(request):
    """
    System Administrative Analytics and Incident Management Panel.
    """
    from django.contrib.auth.models import User

    total_users = User.objects.count()
    total_scans = AnalysisRecord.objects.count()
    total_reports = ScamReport.objects.count()

    risk_stats = {
        'low': AnalysisRecord.objects.filter(risk_level='LOW').count(),
        'moderate': AnalysisRecord.objects.filter(risk_level='MODERATE').count(),
        'high': AnalysisRecord.objects.filter(risk_level='HIGH').count(),
    }

    top_indicators = list(
        AnalysisIndicator.objects.values('name', 'severity')
        .annotate(count=Count('id'))
        .order_by('-count')[:6]
    )

    recent_reports = ScamReport.objects.select_related('user').all()[:10]
    recent_scans = AnalysisRecord.objects.select_related('user').all()[:10]

    context = {
        'total_users': total_users,
        'total_scans': total_scans,
        'total_reports': total_reports,
        'risk_stats': risk_stats,
        'top_indicators': top_indicators,
        'top_indicators_json': json.dumps(top_indicators),
        'recent_reports': recent_reports,
        'recent_scans': recent_scans
    }
    return render(request, 'admin_dashboard.html', context)

def privacy_view(request):
    return render(request, 'pages/privacy.html')

def terms_view(request):
    return render(request, 'pages/terms.html')

def about_view(request):
    return render(request, 'pages/about.html')
