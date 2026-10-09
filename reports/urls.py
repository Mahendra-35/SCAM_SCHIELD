from django.urls import path
from . import views

urlpatterns = [
    path('report/', views.report_incident_view, name='report_incident'),
]
