"""
Contextual Warning Sign Rules Registry for ScamShield Analysis Engine.
Defines weighted rules, regex patterns, explanations, and safe next actions.
"""

import re
from typing import List, Dict, Any

SCAM_RULES = [
    # ----------------------------------------------------
    # 1. UPFRONT PAYMENT & REGISTRATION FEES
    # ----------------------------------------------------
    {
        'id': 'RULE_UPFRONT_FEE',
        'name': 'Advance Payment or Registration Fee Request',
        'category': 'JOB_INTERNSHIP',
        'severity': 'HIGH',
        'weight': 35,
        'patterns': [
            r'\b(?:pay|send|deposit|transfer|remit)\s+(?:a\s+)?(?:registration|processing|interview|training|security|document|laptop|badge|onboarding)\s+(?:fee|charge|amount|cost|deposit)\b',
            r'\b(?:registration|processing|security|refundable|upfront|advance)\s+(?:fee|deposit|charge|payment|amount)\b',
            r'\bpay\s+(?:\$\d+|\b₹\d+|\brs\.?\s*\d+)\s+before\s+(?:joining|interview|starting|getting|receiving)\b',
            r'\brefundable\s+security\s+deposit\b'
        ],
        'explanation': 'The content requests payment before providing a job, service, or prize. Legitimate employers, companies, and platforms never charge candidates or applicants registration, processing, or interview fees.',
        'recommendation': 'Refuse to pay any advance fee. Legitimate companies deduct costs from payroll if applicable, never upfront.'
    },

    # ----------------------------------------------------
    # 2. CONFIDENTIAL CREDENTIALS & OTP REQUESTS
    # ----------------------------------------------------
    {
        'id': 'RULE_CREDENTIAL_OTP',
        'name': 'Request for OTP, Password, or Banking Details',
        'category': 'SMS_CHAT',
        'severity': 'HIGH',
        'weight': 40,
        'patterns': [
            r'\b(?:share|send|provide|tell|enter|verify)\b.*?\b(?:otp|one\s*time\s*password|pin|cvv|password|passcode|secret\s*code|net\s*banking)\b',
            r'\b(?:6|4)[- ]*digit[- ]*(?:code|otp|pin|passcode)\b',
            r'\b(?:bank|card|account)\s+(?:details|number|password|pin|cvv)\b',
            r'\bverify\s+your\s+(?:account|identity|card|login)\s+by\s+sharing\b'
        ],
        'explanation': 'The message asks for an OTP (One-Time Password), login password, PIN, or confidential banking credential. Bank staff and official organizations will NEVER ask for your OTP or password.',
        'recommendation': 'NEVER share an OTP or password with anyone. Sharing an OTP allows unauthorized access to your funds or personal accounts.'
    },

    # ----------------------------------------------------
    # 3. UNREALISTIC SALARY & GUARANTEED RETURNS
    # ----------------------------------------------------
    {
        'id': 'RULE_UNREALISTIC_RETURNS',
        'name': 'Unrealistic Income or Guaranteed Investment Returns',
        'category': 'INVESTMENT_SCHEME',
        'severity': 'HIGH',
        'weight': 35,
        'patterns': [
            r'\b(?:guaranteed|100%|risk[- ]free)\s+(?:returns?|profit|income|payout|earnings?)\b',
            r'\bearn\s+(?:\$\d+|\b₹\d+|\brs\.?\s*\d+)\s+(?:per\s+day|daily|per\s+hour|hourly)\s+for\s+(?:10|15|30|1|2)\s+(?:mins?|minutes?|hours?)\b',
            r'\bdouble\s+your\s+(?:money|investment|crypto|bitcoin)\b',
            r'\bno\s+skill|no\s+experience|no\s+investment\s+needed\s+to\s+earn\b',
            r'\bpassive\s+daily\s+income\s+guaranteed\b'
        ],
        'explanation': 'The offer promises unnaturally high income for minimal work or guarantees risk-free financial returns. All investments carry risk, and high passive returns without effort are classic ponzi/scam hallmarks.',
        'recommendation': 'Be skeptical of promises that sound too good to be true. Research financial services on official regulatory registries.'
    },

    # ----------------------------------------------------
    # 4. EXTREME URGENCY & THREAT TACTICS
    # ----------------------------------------------------
    {
        'id': 'RULE_URGENT_TACTICS',
        'name': 'Urgent Pressure or Fear-Based Action',
        'category': 'EMAIL_PHISHING',
        'severity': 'MEDIUM',
        'weight': 25,
        'patterns': [
            r'\b(?:account|card|sim|service)\s+(?:will\s+be|has\s+been)\s+(?:suspended|blocked|deactivated|terminated|closed)\s+(?:within|today|immediately|in\s+\d+\s+hours?)\b',
            r'\b(?:urgent|immediate)\s+(?:action|verification|attention)\s+required\b',
            r'\bact\s+(?:now|today|immediately)\s+or\s+(?:lose|forfeit|penalty)\b',
            r'\b(?:legal\s+action|police|arrest|lawsuit)\s+will\s+be\s+taken\b'
        ],
        'explanation': 'The message creates artificial panic, claiming your account will be blocked or legal action taken unless you respond immediately. Scammers use panic so victims act without thinking.',
        'recommendation': 'Stay calm. Pause and contact the institution directly using their official website or customer support phone number on the back of your card.'
    },

    # ----------------------------------------------------
    # 5. UNAUTHORIZED CONTACT CHANNELS (WhatsApp / Telegram)
    # ----------------------------------------------------
    {
        'id': 'RULE_UNOFFICIAL_CHANNELS',
        'name': 'Communication Restricted to Unofficial Channels',
        'category': 'JOB_INTERNSHIP',
        'severity': 'MEDIUM',
        'weight': 25,
        'patterns': [
            r'\b(?:contact|message|reach)\s+(?:hr|recruiter|us|manager)\s+on\s+(?:whatsapp|telegram)\b',
            r'\b(?:send\s+message|chat\s+with)\s+on\s+telegram\s+@\w+\b',
            r'\binterview\s+will\s+be\s+conducted\s+(?:only\s+)?via\s+(?:whatsapp|telegram|chat)\b',
            r'\breply\s+to\s+personal\s+(?:gmail|yahoo|hotmail|outlook)\.com\b'
        ],
        'explanation': 'The hiring manager or representative refuses official company email and requests to communicate exclusively via WhatsApp, Telegram, or personal Gmail addresses.',
        'recommendation': 'Insist on corporate email correspondence. Check if the HR email domain exactly matches the company official website.'
    },

    # ----------------------------------------------------
    # 6. WORK-FROM-HOME TASK & LIKE SCAMS
    # ----------------------------------------------------
    {
        'id': 'RULE_WFH_TASK_SCAM',
        'name': 'Simple Task / Video Like Money Scheme',
        'category': 'SHOPPING_OFFER',
        'severity': 'HIGH',
        'weight': 35,
        'patterns': [
            r'\b(?:like|subscribe|review|rate)\s+(?:youtube|google\s+maps|tiktok|instagram)\s+(?:videos?|channels?|places?)\s+(?:to\s+earn|get\s+paid)\b',
            r'\bwork\s*from\s*home\s+(?:task|part[- ]time)\s+job\b',
            r'\bprepaid\s+task|commission\s+task|task\s+completion\s+deposit\b',
            r'\bearn\s+money\s+by\s+rating\s+(?:products|hotels|apps)\b'
        ],
        'explanation': 'Offers payment for doing simple tasks like liking videos or submitting reviews. After initial small payouts, victims are tricked into making large "prepaid deposits" to release locked earnings.',
        'recommendation': 'Do not transfer money to unlock "task job" profits. Once money is transferred to task platforms, it cannot be recovered.'
    },

    # ----------------------------------------------------
    # 7. LOTTERY, PRIZE & UNEXPECTED CLAIMS
    # ----------------------------------------------------
    {
        'id': 'RULE_LOTTERY_PRIZE',
        'name': 'Unsolicited Lottery, Prize, or Gift Card Claim',
        'category': 'OTHER',
        'severity': 'HIGH',
        'weight': 35,
        'patterns': [
            r'\b(?:congratulations|congrats)!?\s+you\s+(?:have\s+)?won\b',
            r'\b(?:selected|chosen)\s+for\s+(?:a\s+)?(?:lucky\s+draw|prize|cash\s+reward|lottery|grant)\b',
            r'\bclaim\s+your\s+(?:\$\d+|\b₹\d+|\brs\.?\s*\d+)\s+(?:gift\s+card|reward|voucher|prize)\b',
            r'\bpay\s+(?:customs|tax|handling|clearance)\s+fee\s+to\s+receive\s+prize\b'
        ],
        'explanation': 'Informs you that you won a competition or lottery that you never entered, demanding a tax or handling fee to collect the winnings.',
        'recommendation': 'If you did not buy a ticket or enter a contest, you cannot win it. Disregard unsolicited prize notifications.'
    },

    # ----------------------------------------------------
    # 8. IMPERSONATION OF BANKS, UTILITIES & GOVERNMENT
    # ----------------------------------------------------
    {
        'id': 'RULE_IMPERSONATION',
        'name': 'Potential Impersonation of Authority or Bank',
        'category': 'SMS_CHAT',
        'severity': 'HIGH',
        'weight': 35,
        'patterns': [
            r'\b(?:income\s+tax|tax\s+refund|electricity\s+bill|courier|customs|fedex|dhl)\s+(?:pending|notice|overdue|update|held)\b',
            r'\b(?:sbi|hdfc|icici|axis|bank)\s+(?:kyc|account|pan\s+card)\s+(?:update|expired|block)\b',
            r'\bclick\s+(?:link|here)\s+to\s+(?:update|verify|avoid\s+disconnection)\b',
            r'\bpackage\s+(?:cannot\s+be\s+delivered|held\s+at\s+warehouse)\b'
        ],
        'explanation': 'Poses as a bank, utility company, tax authority, or courier service notifying you of expired KYC, pending electricity cut-off, or held packages.',
        'recommendation': 'Cross-check with the official customer care hotline or portal. Do not click links provided in unexpected SMS messages.'
    }
]

def evaluate_text_rules(text: str) -> List[Dict[str, Any]]:
    """
    Evaluates text against all registered contextual scam rules.
    Returns a list of matched indicators with rule details and context snippet.
    """
    if not text:
        return []

    text_lower = text.lower()
    matched_indicators = []

    for rule in SCAM_RULES:
        is_match = False
        matched_snippet = ""

        for pattern in rule['patterns']:
            match = re.search(pattern, text_lower, re.IGNORECASE)
            if match:
                is_match = True
                # Extract surrounding snippet for context
                start = max(0, match.start() - 25)
                end = min(len(text), match.end() + 25)
                matched_snippet = text[start:end].strip()
                if start > 0:
                    matched_snippet = "..." + matched_snippet
                if end < len(text):
                    matched_snippet = matched_snippet + "..."
                break

        if is_match:
            matched_indicators.append({
                'rule_id': rule['id'],
                'name': rule['name'],
                'category': rule['category'],
                'severity': rule['severity'],
                'weight': rule['weight'],
                'explanation': rule['explanation'],
                'recommendation': rule['recommendation'],
                'context_snippet': matched_snippet
            })

    return matched_indicators
