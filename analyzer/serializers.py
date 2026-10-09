from rest_framework import serializers
from .models import AnalysisRecord, AnalysisIndicator

class AnalysisInputSerializer(serializers.Serializer):
    text = serializers.CharField(required=False, allow_blank=True, max_length=10000)
    url = serializers.CharField(required=False, allow_blank=True, max_length=500)
    category = serializers.CharField(required=False, default='OTHER')

    def validate(self, data):
        text = data.get('text', '').strip()
        url = data.get('url', '').strip()
        if not text and not url:
            raise serializers.ValidationError("Please provide either text content or a URL to analyze.")
        return data

class AnalysisIndicatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisIndicator
        fields = ['id', 'rule_id', 'name', 'severity', 'weight', 'explanation', 'recommendation', 'context_snippet']

class AnalysisRecordSerializer(serializers.ModelSerializer):
    indicators = AnalysisIndicatorSerializer(many=True, read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    created_at_formatted = serializers.DateTimeField(source='created_at', format="%b %d, %Y %I:%M %p", read_only=True)

    class Meta:
        model = AnalysisRecord
        fields = ['id', 'category', 'category_display', 'input_snippet', 'url', 'risk_score', 'risk_level', 'created_at', 'created_at_formatted', 'indicators']
