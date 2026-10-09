from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

from .validators import validate_analysis_input, sanitize_text
from .url_analysis import analyze_url_structure
from .rules import evaluate_text_rules
from .scoring import calculate_risk_score
from .engine import ScamAnalyzer
from .models import AnalysisRecord, AnalysisIndicator

class ScamShieldAnalyzerTestCase(TestCase):

    def test_text_sanitization(self):
        raw_text = "  <script>alert('xss')</script>  Pay  registration   fee   "
        clean = sanitize_text(raw_text)
        self.assertNotIn("<script>", clean)
        self.assertIn("&lt;script&gt;", clean)

    def test_input_validation(self):
        # Empty text and empty URL should raise ValidationError
        with self.assertRaises(ValidationError):
            validate_analysis_input(text="", url="")

        # Very short text should raise ValidationError
        with self.assertRaises(ValidationError):
            validate_analysis_input(text="hi", url="")

        # Invalid URL format should raise ValidationError
        with self.assertRaises(ValidationError):
            validate_analysis_input(text="valid text content", url="ht!tp://invalid domain")

    def test_url_structural_analysis(self):
        # Test IP Host URL
        res_ip = analyze_url_structure("http://192.168.1.1/login.php")
        rule_ids = [ind['rule_id'] for ind in res_ip['indicators']]
        self.assertIn('URL_IP_HOST', rule_ids)
        self.assertGreaterEqual(res_ip['risk_contribution'], 35)

        # Test URL Shortener
        res_short = analyze_url_structure("https://bit.ly/3xYz90")
        rule_ids = [ind['rule_id'] for ind in res_short['indicators']]
        self.assertIn('URL_SHORTENER', rule_ids)

        # Test Typosquatting
        res_typo = analyze_url_structure("http://paypa1-secure-login.xyz/update")
        rule_ids = [ind['rule_id'] for ind in res_typo['indicators']]
        self.assertIn('URL_TYPOSQUATTING', rule_ids)
        self.assertIn('URL_HIGH_RISK_TLD', rule_ids)

    def test_contextual_text_rules(self):
        # Test Upfront Fee Rule
        text_upfront = "You must pay a refundable registration fee of $150 before joining the company."
        indicators = evaluate_text_rules(text_upfront)
        rule_ids = [ind['rule_id'] for ind in indicators]
        self.assertIn('RULE_UPFRONT_FEE', rule_ids)

        # Test Credential OTP Rule
        text_otp = "Please share your 6-digit OTP code to verify your bank account."
        indicators_otp = evaluate_text_rules(text_otp)
        rule_ids_otp = [ind['rule_id'] for ind in indicators_otp]
        self.assertIn('RULE_CREDENTIAL_OTP', rule_ids_otp)

    def test_composite_risk_scoring(self):
        # High Risk content combination
        text = "Pay $200 processing fee upfront and contact HR on Telegram @Jobs2026."
        url_res = analyze_url_structure("http://fake-job-portal.xyz")
        text_inds = evaluate_text_rules(text)

        score_res = calculate_risk_score(text_inds, url_res)
        self.assertEqual(score_res['risk_level'], 'HIGH')
        self.assertGreaterEqual(score_res['risk_score'], 70)

    def test_full_engine_analyze(self):
        res = ScamAnalyzer.analyze(
            text="Congratulations! You won $10,000 lottery. Pay $50 clearance tax fee to claim.",
            url="http://claim-lottery-tax.online",
            category="OTHER"
        )
        self.assertIn('risk_assessment', res)
        self.assertIn('indicators', res)
        self.assertIn('recommendations', res)
        self.assertEqual(res['risk_assessment']['risk_level'], 'HIGH')

class ScamShieldAPITestCase(TestCase):

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='password123')

    def test_analyze_api_endpoint(self):
        url = reverse('api_analyze')
        payload = {
            'text': 'Please transfer $100 registration fee to get your job kit.',
            'url': 'http://job-verify.xyz',
            'category': 'JOB_INTERNSHIP'
        }
        response = self.client.post(url, payload, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('risk_assessment', data)
        self.assertIn('record_id', data)

        # Verify record created in DB
        self.assertTrue(AnalysisRecord.objects.filter(id=data['record_id']).exists())

    def test_delete_history_endpoint(self):
        rec = AnalysisRecord.objects.create(
            user=self.user,
            category='JOB_INTERNSHIP',
            input_snippet='Test snippet',
            risk_score=80,
            risk_level='HIGH'
        )
        url = reverse('api_delete_history', kwargs={'pk': rec.id})

        # Unauthorized request should fail
        res_unauth = self.client.delete(url)
        self.assertEqual(res_unauth.status_code, 403)

        # Authorized request should succeed
        self.client.login(username='testuser', password='password123')
        res_auth = self.client.delete(url)
        self.assertEqual(res_auth.status_code, 200)
        self.assertFalse(AnalysisRecord.objects.filter(id=rec.id).exists())
