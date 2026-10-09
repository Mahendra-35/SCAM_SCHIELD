from django.shortcuts import render, get_object_or_404
from django.db.models import Q
from .models import EducationalCategory, EducationalArticle

def awareness_list_view(request):
    """
    Renders Educational Learning Center with search and category filters.
    """
    categories = EducationalCategory.objects.prefetch_related('articles').all()
    selected_category_slug = request.GET.get('category', '')
    query = request.GET.get('q', '').strip()

    articles = EducationalArticle.objects.select_related('category').all()

    if selected_category_slug:
        articles = articles.filter(category__slug=selected_category_slug)

    if query:
        articles = articles.filter(
            Q(title__icontains=query) |
            Q(overview__icontains=query) |
            Q(simulated_example__icontains=query)
        )

    context = {
        'categories': categories,
        'articles': articles,
        'selected_category_slug': selected_category_slug,
        'search_query': query
    }
    return render(request, 'awareness.html', context)

def article_detail_view(request, slug):
    """
    Renders detailed article guide for a specific scam category.
    """
    article = get_object_or_404(EducationalArticle, slug=slug)
    related_articles = EducationalArticle.objects.filter(category=article.category).exclude(id=article.id)[:3]
    return render(request, 'article_detail.html', {'article': article, 'related_articles': related_articles})
