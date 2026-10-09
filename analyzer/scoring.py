"""
Composite Risk Scoring Engine for ScamShield.
Calculates transparent, contextual risk scores (0-100) and maps risk levels.
"""

from typing import List, Dict, Any

def calculate_risk_score(text_indicators: List[Dict[str, Any]], url_results: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes a composite risk score (0-100) based on weighted text indicators and URL analysis.
    Implements contextual normalization to prevent false alarms on single benign keywords.
    """
    url_indicators = url_results.get('indicators', [])
    all_indicators = text_indicators + url_indicators

    if not all_indicators:
        return {
            'risk_score': 5,
            'risk_level': 'LOW',
            'level_display': 'Low Risk Indicators',
            'badge_color': 'success',
            'summary': 'No obvious suspicious patterns or known scam indicators were detected in the provided content.'
        }

    raw_score = 0
    high_count = 0
    medium_count = 0
    low_count = 0

    for ind in all_indicators:
        weight = ind.get('weight', 10)
        severity = ind.get('severity', 'LOW')
        raw_score += weight

        if severity == 'HIGH':
            high_count += 1
        elif severity == 'MEDIUM':
            medium_count += 1
        else:
            low_count += 1

    # Multi-indicator synergy bonus (if multiple distinct red flags align)
    total_indicators = len(all_indicators)
    if total_indicators >= 3:
        raw_score += 15
    elif total_indicators == 2:
        raw_score += 5

    # Single-keyword dampening to prevent false alarms (e.g., mention of 'payment' in a normal invoice)
    if total_indicators == 1 and high_count == 0:
        raw_score = min(raw_score, 25)

    # Bound final score between 0 and 98 (Automated system does not claim 100% absolute proof)
    final_score = max(5, min(raw_score, 98))

    # Categorize Risk Level
    if final_score < 30:
        risk_level = 'LOW'
        level_display = 'Low Risk Indicators'
        badge_color = 'success'
        summary = 'A few minor flags or common words were detected, but no critical scam indicators were found.'
    elif final_score < 70:
        risk_level = 'MODERATE'
        level_display = 'Moderate Risk Indicators'
        badge_color = 'warning'
        summary = 'Multiple suspicious indicators detected. Exercise caution and verify details before proceeding.'
    else:
        risk_level = 'HIGH'
        level_display = 'High Risk Indicators'
        badge_color = 'danger'
        summary = 'Critical scam warning signs detected! High probability of fraudulent content or phishing attempt.'

    return {
        'risk_score': final_score,
        'risk_level': risk_level,
        'level_display': level_display,
        'badge_color': badge_color,
        'summary': summary,
        'total_indicators_count': total_indicators,
        'high_severity_count': high_count,
        'medium_severity_count': medium_count,
        'low_severity_count': low_count
    }
