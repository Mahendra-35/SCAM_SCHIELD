"""
Main ScamShield Analysis Engine Interface.
Orchestrates text sanitization, rule evaluation, URL structural checks, and risk scoring.
"""

from typing import Dict, Any
from .validators import sanitize_text, validate_analysis_input
from .rules import evaluate_text_rules
from .url_analysis import analyze_url_structure
from .scoring import calculate_risk_score

class ScamAnalyzer:
    """
    Unified analyzer class for ScamShield content inspection.
    """

    @staticmethod
    def analyze(text: str = "", url: str = "", category: str = "OTHER") -> Dict[str, Any]:
        """
        Runs comprehensive analysis on text and/or URL.
        Returns a dictionary containing risk score, level, matched indicators, and safe next steps.
        """
        # 1. Validate Input
        validate_analysis_input(text=text, url=url, category=category)

        # 2. Sanitize Text
        clean_text = sanitize_text(text) if text else ""
        clean_url = url.strip() if url else ""

        # 3. Text Analysis via Contextual Rules
        text_indicators = evaluate_text_rules(clean_text)

        # 4. URL Analysis
        url_results = analyze_url_structure(clean_url) if clean_url else {'indicators': [], 'risk_contribution': 0, 'domain': ''}

        # 5. Composite Risk Scoring
        score_data = calculate_risk_score(text_indicators, url_results)

        # 6. Build Consolidated Indicators List
        all_indicators = text_indicators + url_results.get('indicators', [])

        # 7. Collect Unique Recommendations & Verification Steps
        recommendations = []
        for ind in all_indicators:
            rec = ind.get('recommendation')
            if rec and rec not in recommendations:
                recommendations.append(rec)

        # Default fallback recommendations if none specifically triggered
        if not recommendations:
            recommendations = [
                'Verify the sender identity through official customer service channels.',
                'Never transfer money or share credentials based on unsolicited messages.',
                'Search for company reviews or official website domain names directly in your browser.'
            ]

        # 8. Construct Final Response Payload
        return {
            'input_summary': {
                'category': category,
                'has_text': bool(clean_text),
                'has_url': bool(clean_url),
                'analyzed_domain': url_results.get('domain', ''),
                'text_length': len(clean_text)
            },
            'risk_assessment': score_data,
            'indicators': all_indicators,
            'recommendations': recommendations,
            'disclaimer': 'This result is an automated risk assessment based on pattern detection, not definitive proof that content is fraudulent or safe. Always verify important information independently through official channels.'
        }
