from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('checker/', views.checker_view, name='checker'),
    
    # REST API endpoints
    path('api/analyze/', views.AnalyzeAPIView.as_view(), name='api_analyze'),
    path('api/history/<int:pk>/', views.DeleteRecordAPIView.as_view(), name='api_delete_history'),
    path('api/stats/', views.SystemStatsAPIView.as_view(), name='api_stats'),
]
