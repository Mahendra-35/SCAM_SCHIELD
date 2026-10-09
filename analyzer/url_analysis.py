"""
URL Structural and Domain Reputation Analyzer for ScamShield.
Analyzes domain structure, TLDs, IP hosts, typosquatting patterns, and URL shorteners.
"""

import re
from urllib.parse import urlparse

# Common URL Shorteners used in SMS/Phishing scams
URL_SHORTENERS = {
    'bit.ly', 'tinyurl.com', 't.co', 'cutt.ly', 'is.gd',
    'rb.gy', 'shorturl.at', 'ow.ly', 'buff.ly', 's.id', 'v.gd'
}

# High-risk TLDs frequently associated with disposable phishing campaigns
HIGH_RISK_TLDS = {
    '.xyz', '.top', '.click', '.buzz', '.club', '.work',
    '.site', '.icu', '.gq', '.cf', '.ml', '.ga', '.tk',
    '.online', '.zip', '.mov', '.cc', '.fit', '.fun', '.rest'
}

# Famous targeted brands for typosquatting / lookalike domains
BRAND_PATTERNS = [
    (r'paypa[l1i]', 'PayPal'),
    (r'g[0o]{2}gle', 'Google'),
    (r'am[a4]z[0o]n', 'Amazon'),
    (r'm[i1]cr[0o]s[0o]ft', 'Microsoft'),
    (r'n[e3]tf[l1]ix', 'Netflix'),
    (r'b[a4]nk[0o]f[a4]mer[i1]c[a4]', 'Bank of America'),
    (r'w[e3]lls?f[a4]rg[0o]', 'Wells Fargo'),
    (r'ch[a4]s[e3]', 'Chase Bank'),
    (r'h[d1]fc', 'HDFC Bank'),
    (r's[b1]i[_-]?bank', 'SBI Bank'),
    (r'[i1]c[i1]c[i1]', 'ICICI Bank'),
    (r'w[h4]ats?app', 'WhatsApp'),
    (r't[e3]l[e3]gr[a4]m', 'Telegram'),
    (r'[i1]nst[a4]gr[a4]m', 'Instagram'),
    (r'f[a4]c[e3]b[0o]{2}k', 'Facebook'),
    (r'[a4]ppl[e3]', 'Apple'),
]

# Sensitive keywords in path or host that demand SSL & trusted domain
SENSITIVE_KEYWORDS = [
    'login', 'signin', 'verify', 'update', 'account', 'secure',
    'banking', 'password', 'credential', 'kyc', 'otp', 'wallet', 'claim'
]

def analyze_url_structure(url: str) -> dict:
    """
    Analyzes a given URL for structural warning indicators.
    Returns a dictionary with detected indicators, overall URL risk score (0-100),
    and normalized domain info.
    """
    if not url:
        return {'indicators': [], 'risk_contribution': 0, 'domain': ''}

    url_clean = url.strip()
    if not re.match(r'^(?:http|ftp)s?://', url_clean, re.IGNORECASE):
        url_clean = "http://" + url_clean

    try:
        parsed = urlparse(url_clean)
        hostname = (parsed.hostname or parsed.netloc or '').lower()
    except Exception:
        hostname = url_clean.lower()

    path = parsed.path.lower() if parsed.path else ''
    full_str = url_clean.lower()

    indicators = []
    risk_score = 0

    # 1. Check for IP Address host
    ip_pattern = r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$'
    if re.match(ip_pattern, hostname):
        indicators.append({
            'rule_id': 'URL_IP_HOST',
            'name': 'Raw IP Address Host',
            'severity': 'HIGH',
            'weight': 35,
            'explanation': f'The URL uses a raw IP address ({hostname}) instead of a registered domain name. Legitimate organizations rarely use bare IP addresses for public web pages.',
            'recommendation': 'Do not enter passwords or personal data on web pages served directly from raw IP addresses.'
        })
        risk_score += 35

    # 2. Check for URL Shortener
    if hostname in URL_SHORTENERS:
        indicators.append({
            'rule_id': 'URL_SHORTENER',
            'name': 'URL Shortening Service Detected',
            'severity': 'MEDIUM',
            'weight': 20,
            'explanation': f'The link uses a URL shortener service ({hostname}). URL shorteners hide the real destination address, making it impossible to see where the link leads.',
            'recommendation': 'Use a URL expander tool or hover over short links before clicking to reveal the target domain.'
        })
        risk_score += 20

    # 3. High-Risk TLD Check
    for tld in HIGH_RISK_TLDS:
        if hostname.endswith(tld):
            indicators.append({
                'rule_id': 'URL_HIGH_RISK_TLD',
                'name': f'Suspicious Domain Extension ({tld})',
                'severity': 'MEDIUM',
                'weight': 25,
                'explanation': f'The website ends with "{tld}", a top-level domain frequently used in temporary phishing and scam campaigns due to low registration costs.',
                'recommendation': 'Verify if the official organization typically uses a standard .com, .org, or official regional domain.'
            })
            risk_score += 25
            break

    # 4. Typosquatting / Brand Impersonation Check
    for pattern, brand in BRAND_PATTERNS:
        if re.search(pattern, hostname):
            official_domains = ['paypal.com', 'google.com', 'amazon.com', 'microsoft.com',
                                'netflix.com', 'bankofamerica.com', 'wellsfargo.com',
                                'chase.com', 'hdfcbank.com', 'onlinesbi.sbi', 'icicibank.com',
                                'whatsapp.com', 'telegram.org', 'instagram.com', 'facebook.com', 'apple.com']
            if not any(hostname == off or hostname.endswith('.' + off) for off in official_domains):
                indicators.append({
                    'rule_id': 'URL_TYPOSQUATTING',
                    'name': f'Potential Brand Impersonation ({brand})',
                    'severity': 'HIGH',
                    'weight': 40,
                    'explanation': f'The domain name "{hostname}" closely resembles "{brand}" but is not on the official domain. This is a common tactic called typosquatting.',
                    'recommendation': f'Navigate directly to {brand}\'s official web address rather than clicking this link.'
                })
                risk_score += 40
                break

    # 5. Excessive Subdomains Check
    subdomains = hostname.split('.')
    if len(subdomains) >= 4 and not re.match(ip_pattern, hostname):
        indicators.append({
            'rule_id': 'URL_EXCESSIVE_SUBDOMAINS',
            'name': 'Multiple Complex Subdomains',
            'severity': 'MEDIUM',
            'weight': 20,
            'explanation': f'The domain structure contains {len(subdomains)} levels of subdomains ({hostname}). Phishers often create nested subdomains to craft misleading links.',
            'recommendation': 'Inspect the main domain name (the portion right before the extension) to confirm identity.'
        })
        risk_score += 20

    # 6. Deceptive Hyphenated Domain
    if hostname.count('-') >= 2:
        indicators.append({
            'rule_id': 'URL_HYPHENATED_DOMAIN',
            'name': 'Suspicious Hyphenated Domain Name',
            'severity': 'LOW',
            'weight': 15,
            'explanation': f'The domain contains multiple hyphens ({hostname}), often used by fraudsters to construct fake trust names like "secure-bank-login-verify.com".',
            'recommendation': 'Ensure the domain matches the official corporate domain structure.'
        })
        risk_score += 15

    # 7. Unencrypted HTTP connection for sensitive paths
    if parsed.scheme.lower() == 'http' and any(kw in full_str for kw in SENSITIVE_KEYWORDS):
        indicators.append({
            'rule_id': 'URL_NO_HTTPS_SENSITIVE',
            'name': 'Unencrypted Connection (No HTTPS)',
            'severity': 'HIGH',
            'weight': 30,
            'explanation': 'The link requests sensitive actions (login/verification) over unencrypted HTTP protocol instead of secure HTTPS.',
            'recommendation': 'Never submit passwords, OTPs, or financial info over plain HTTP connections.'
        })
        risk_score += 30

    return {
        'indicators': indicators,
        'risk_contribution': min(risk_score, 100),
        'domain': hostname
    }
