from django.urls import path
from . import views

urlpatterns = [
    path('awareness/', views.awareness_list_view, name='awareness'),
    path('awareness/<slug:slug>/', views.article_detail_view, name='article_detail'),
]
