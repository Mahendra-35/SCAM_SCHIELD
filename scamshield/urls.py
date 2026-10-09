from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('analyzer.urls')),
    path('', include('awareness.urls')),
    path('', include('reports.urls')),
    path('', include('accounts.urls')),
]
