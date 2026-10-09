from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from awareness.models import EducationalCategory, EducationalArticle
from reports.models import ScamReport
from analyzer.models import AnalysisRecord, AnalysisIndicator
from accounts.models import UserProfile

class Command(BaseCommand):
    help = 'Seeds ScamShield database with educational content, admin user, and demo data.'

    def handle(self, *args, **options):
        self.stdout.write("Seeding ScamShield database...")

        # 1. Create Admin Account if not exists
        if not User.objects.filter(username='admin').exists():
            admin_user = User.objects.create_superuser('admin', 'admin@scamshield.org', 'admin123')
            UserProfile.objects.get_or_create(user=admin_user)
            self.stdout.write(self.style.SUCCESS("Created admin user: admin / admin123"))
        else:
            admin_user = User.objects.get(username='admin')

        # 2. Create Demo User
        if not User.objects.filter(username='demo_user').exists():
            demo_user = User.objects.create_user('demo_user', 'demo@scamshield.org', 'demo123')
            UserProfile.objects.get_or_create(user=demo_user)
            self.stdout.write(self.style.SUCCESS("Created demo user: demo_user / demo123"))
        else:
            demo_user = User.objects.get(username='demo_user')

        # 3. Seed Educational Categories & Articles
        categories_data = [
            {
                'name': 'Job & Internship Scams',
                'slug': 'job-internship-scams',
                'icon_class': 'bi-briefcase-fill',
                'description': 'Fraudulent job offers, fake internships, and work-from-home schemes demanding upfront registration or equipment fees.',
                'articles': [
                    {
                        'title': 'Upfront Registration & Training Fee Job Fraud',
                        'slug': 'upfront-job-registration-fee',
                        'overview': 'Scammers post attractive remote job listings on social media or job boards. After a brief online interview over chat, candidates are asked to pay a refundable fee for background checks, laptops, or onboarding badges.',
                        'warning_signs': [
                            'Demand for payment before starting employment or receiving an offer letter.',
                            'Recruiter uses WhatsApp or Telegram for official recruitment communication.',
                            'Unrealistic salary (e.g., $1,000/week for 2 hours daily typing).',
                            'Email sender uses generic free accounts (@gmail.com, @yahoo.com) rather than corporate domain.'
                        ],
                        'simulated_example': 'SIMULATED EDUCATIONAL EXAMPLE:\n"Congratulations! You have been selected for the Data Entry Specialist role at Amazon Global. Weekly Salary: $850. To receive your laptop and employment kit, please transfer $120 registration fee to HR on Telegram @AmazonHR_Official. Fee will be refunded with your first paycheck!"',
                        'verification_steps': [
                            'Search the company official careers website directly to verify the job ID.',
                            'Verify the email domain matches the exact official corporate website domain.',
                            'Contact the corporate HR department through the phone number listed on their verified domain.'
                        ],
                        'protection_tips': [
                            'Legitimate employers will never ask candidates to pay money for a job.',
                            'Do not purchase gift cards, crypto, or send wire transfers for work equipment.'
                        ]
                    }
                ]
            },
            {
                'name': 'Phishing & Email Scams',
                'slug': 'phishing-email-scams',
                'icon_class': 'bi-envelope-exclamation-fill',
                'description': 'Deceptive emails and messages designed to steal login credentials, credit cards, or personal identification.',
                'articles': [
                    {
                        'title': 'Account Suspension Panic & Credential Theft',
                        'slug': 'account-suspension-phishing',
                        'overview': 'Phishing emails pretend to be from trusted companies (PayPal, Netflix, Microsoft, Google) claiming your account is suspended unless you immediately click a link and verify your credentials.',
                        'warning_signs': [
                            'Threats of immediate account closure within 24 hours.',
                            'Generic greetings like "Dear Customer" instead of your full name.',
                            'Suspicious domain name in the link (e.g., paypa1-security-verify.xyz).',
                            'Unencrypted HTTP link on a supposed login page.'
                        ],
                        'simulated_example': 'SIMULATED EDUCATIONAL EXAMPLE:\n"URGENT: Your PayPal account has been temporarily restricted due to unauthorized login attempts. Click http://paypa1-security-update.xyz/verify immediately to confirm your identity or your account will be permanently closed within 12 hours!"',
                        'verification_steps': [
                            'Hover over the button/link to inspect the true URL before clicking.',
                            'Check the sender email header for spoofed domain addresses.',
                            'Log in directly via your browser bookmark or official mobile app.'
                        ],
                        'protection_tips': [
                            'Enable Two-Factor Authentication (2FA) on all financial and email accounts.',
                            'Never enter passwords on links received via unsolicited email.'
                        ]
                    }
                ]
            },
            {
                'name': 'OTP & Banking Scams',
                'slug': 'otp-banking-scams',
                'icon_class': 'bi-bank2',
                'description': 'Social engineering calls and messages posing as bank officials demanding One-Time Passwords or debit card PINs.',
                'articles': [
                    {
                        'title': 'Fake Bank Manager & KYC Update Trap',
                        'slug': 'fake-bank-kyc-update',
                        'overview': 'Victims receive an SMS or call claiming their bank card or account is blocked due to pending KYC (Know Your Customer) updates, urging them to call a mobile number or share an OTP.',
                        'warning_signs': [
                            'Sender requests OTP, card PIN, CVV, or net banking password.',
                            'SMS sent from a standard 10-digit mobile number rather than official bank SMS header.',
                            'False urgency threatening account freeze.'
                        ],
                        'simulated_example': 'SIMULATED EDUCATIONAL EXAMPLE:\n"Dear Customer, Your SBI Bank account has been blocked today due to pending PAN KYC update. Kindly click http://sbi-kyc-update.online and share OTP to prevent permanent deactivation."',
                        'verification_steps': [
                            'Call your official bank branch or customer service number printed on the back of your debit card.',
                            'Remember that banks never ask for OTPs or PINs over phone or chat.'
                        ],
                        'protection_tips': [
                            'Treat your OTP as secret as your cash. Never share it with anyone.',
                            'Report suspicious banking SMS immediately to your bank fraud division.'
                        ]
                    }
                ]
            },
            {
                'name': 'Investment & Money Schemes',
                'slug': 'investment-crypto-scams',
                'icon_class': 'bi-graph-up-arrow',
                'description': 'Ponzi schemes, fake crypto trading platforms, and guaranteed high-return wealth offers.',
                'articles': [
                    {
                        'title': 'Guaranteed Daily Crypto Profit Schemes',
                        'slug': 'guaranteed-daily-crypto-profit',
                        'overview': 'Scammers lure investors with promises of double returns or guaranteed daily interest through automated crypto trading bots.',
                        'warning_signs': [
                            'Promises of guaranteed profit with zero risk of capital loss.',
                            'Pressure to recruit friends to earn high referral commissions.',
                            'Platform prohibits withdrawals unless additional "tax fees" are paid.'
                        ],
                        'simulated_example': 'SIMULATED EDUCATIONAL EXAMPLE:\n"Invest $500 today and receive guaranteed daily returns of $100 every 24 hours! 100% Risk Free Automated AI Trading Bot. Withdraw anytime. Join our VIP Telegram channel to double your Bitcoin!"',
                        'verification_steps': [
                            'Verify if the financial entity is registered with national regulatory bodies (SEC, SEBI, FCA).',
                            'Check independent domain registration history and user reviews.'
                        ],
                        'protection_tips': [
                            'Higher returns always mean higher risk. Guaranteed high returns are statistically impossible.'
                        ]
                    }
                ]
            }
        ]

        for cat_data in categories_data:
            articles_list = cat_data.pop('articles')
            category, _ = EducationalCategory.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            for art_data in articles_list:
                EducationalArticle.objects.get_or_create(
                    slug=art_data['slug'],
                    defaults={**art_data, 'category': category}
                )

        # 4. Seed Sample Scam Incident Reports
        sample_reports = [
            {
                'user': demo_user,
                'category': 'JOB_INTERNSHIP',
                'description': 'Received a WhatsApp message offering a remote content writer job. After a brief chat, they demanded ₹2,500 registration fee for employee ID creation.',
                'suspicious_url': 'http://remote-jobs-india.xyz',
                'explanation': 'They used a fake offer letter with stolen company logos.'
            },
            {
                'user': demo_user,
                'category': 'BANKING_OTP',
                'description': 'Received SMS stating my electricity connection will be disconnected by 9:30 PM due to pending bill. Provided a number to call.',
                'suspicious_url': 'http://power-bill-update.online',
                'explanation': 'I called the official power board office and confirmed my bills were fully paid.'
            }
        ]

        for rep in sample_reports:
            ScamReport.objects.get_or_create(
                description=rep['description'],
                defaults=rep
            )

        # 5. Seed Sample History Scans
        sample_scans = [
            {
                'user': demo_user,
                'category': 'JOB_INTERNSHIP',
                'input_snippet': 'Pay $150 registration fee upfront to receive your remote data entry laptop package...',
                'url': 'http://remote-data-jobs.xyz',
                'risk_score': 85,
                'risk_level': 'HIGH'
            },
            {
                'user': demo_user,
                'category': 'EMAIL_PHISHING',
                'input_snippet': 'Urgent: Your PayPal account has been blocked due to unauthorized access. Click here to verify...',
                'url': 'http://paypa1-security-verify.com',
                'risk_score': 90,
                'risk_level': 'HIGH'
            },
            {
                'user': demo_user,
                'category': 'OTHER',
                'input_snippet': 'Please find attached the project schedule and meeting notes for tomorrow morning...',
                'url': 'https://company.org/meeting-notes',
                'risk_score': 10,
                'risk_level': 'LOW'
            }
        ]

        for scan in sample_scans:
            rec, created = AnalysisRecord.objects.get_or_create(
                input_snippet=scan['input_snippet'],
                defaults=scan
            )
            if created and scan['risk_level'] == 'HIGH':
                AnalysisIndicator.objects.create(
                    record=rec,
                    rule_id='RULE_UPFRONT_FEE',
                    name='Advance Payment Request',
                    severity='HIGH',
                    weight=35,
                    explanation='Demands payment before job commencement.',
                    recommendation='Refuse upfront payments.',
                    context_snippet=scan['input_snippet']
                )

        self.stdout.write(self.style.SUCCESS("ScamShield database successfully seeded with awareness content, demo data, and admin user!"))
