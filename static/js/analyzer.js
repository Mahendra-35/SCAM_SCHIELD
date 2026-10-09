/**
 * ScamShield Interactive Analyzer Module
 * Handles AJAX analysis requests, sample message presets, risk gauge rendering, and indicator UI updates.
 */

document.addEventListener('DOMContentLoaded', () => {
    const scamForm = document.getElementById('scamCheckerForm');
    const categorySelect = document.getElementById('categorySelect');
    const messageInput = document.getElementById('messageInput');
    const urlInput = document.getElementById('urlInput');
    const urlInputGroup = document.getElementById('urlInputGroup');
    const clearBtn = document.getElementById('clearBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loadingState = document.getElementById('loadingState');
    const resultsPanel = document.getElementById('resultsPanel');

    // Preset Sample Scam Messages
    const SAMPLES = {
        JOB: {
            category: 'JOB_INTERNSHIP',
            text: 'Dear Applicant, You have been selected for Data Entry Specialist role at Global Tech Services. Monthly Salary: $3,500. Work 2 hours daily from home. To receive your company laptop and starter kit, kindly pay refundable registration fee of $120 via Google Pay to HR Manager on WhatsApp +1 (555) 019-2834.',
            url: 'http://global-tech-jobs.xyz/onboard'
        },
        PHISHING: {
            category: 'EMAIL_PHISHING',
            text: 'URGENT SECURITY NOTICE: Your PayPal Account has been temporarily frozen due to suspicious login attempts. If you do not verify your login details within 12 hours, your balance will be permanently locked.',
            url: 'http://paypa1-security-verification.xyz/login'
        },
        BANKING: {
            category: 'SMS_CHAT',
            text: 'Dear Customer, Your SBI bank account will be blocked today at 9:00 PM due to pending PAN KYC verification. Click link immediately to enter OTP and update your documents.',
            url: 'http://sbi-kyc-update.online'
        },
        INVESTMENT: {
            category: 'INVESTMENT_SCHEME',
            text: 'Invest $200 today and receive guaranteed daily returns of $50 every 24 hours! 100% Risk-Free Automated AI Trading Bot. Withdraw profits anytime directly to your crypto wallet. Join our Telegram group now!',
            url: 'http://crypto-double-returns.site'
        }
    };

    // Toggle URL field visibility based on selected category
    if (categorySelect && urlInputGroup) {
        categorySelect.addEventListener('change', () => {
            if (categorySelect.value === 'WEBSITE_URL') {
                urlInputGroup.classList.remove('d-none');
                urlInput.focus();
            }
        });
    }

    // Sample Loader Buttons
    document.querySelectorAll('.btn-sample').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sampleType = e.target.getAttribute('data-sample');
            if (SAMPLES[sampleType]) {
                const sample = SAMPLES[sampleType];
                if (categorySelect) categorySelect.value = sample.category;
                if (messageInput) messageInput.value = sample.text;
                if (urlInput) urlInput.value = sample.url;
                if (urlInputGroup && sample.url) urlInputGroup.classList.remove('d-none');
                showToast('Sample scam data loaded. Click "Analyze for Scam Signs" to test!', 'info');
            }
        });
    });

    // Clear Button
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (messageInput) messageInput.value = '';
            if (urlInput) urlInput.value = '';
            if (resultsPanel) resultsPanel.classList.add('d-none');
        });
    }

    // Form Submission
    if (scamForm) {
        scamForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const text = messageInput ? messageInput.value.trim() : '';
            const url = urlInput ? urlInput.value.trim() : '';
            const category = categorySelect ? categorySelect.value : 'OTHER';

            if (!text && !url) {
                showToast('Please enter text message content or a URL to analyze.', 'danger');
                return;
            }

            // Show Loading State
            if (loadingState) loadingState.classList.remove('d-none');
            if (resultsPanel) resultsPanel.classList.add('d-none');
            if (analyzeBtn) analyzeBtn.disabled = true;

            try {
                const response = await fetch('/api/analyze/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({ text, url, category })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Analysis failed. Please check your input.');
                }

                renderResults(data);

            } catch (err) {
                showToast(err.message, 'danger');
            } finally {
                if (loadingState) loadingState.classList.add('d-none');
                if (analyzeBtn) analyzeBtn.disabled = false;
            }
        });
    }

    /**
     * Renders Analysis Payload into Results UI with Entrance Animation
     */
    function renderResults(data) {
        if (!resultsPanel) return;

        const assessment = data.risk_assessment;
        const indicators = data.indicators || [];
        const recommendations = data.recommendations || [];

        // Score & Level Badge
        const scoreVal = document.getElementById('resScoreVal');
        const levelBadge = document.getElementById('resLevelBadge');
        const levelSummary = document.getElementById('resLevelSummary');

        if (scoreVal) scoreVal.textContent = assessment.risk_score;
        if (levelBadge) {
            levelBadge.textContent = assessment.level_display;
            levelBadge.className = `badge badge-risk-${assessment.risk_level.toLowerCase()}`;
        }
        if (levelSummary) levelSummary.textContent = assessment.summary;

        // Render Gauge Progress Circle Color
        const gaugeCircle = document.getElementById('gaugeCircle');
        if (gaugeCircle) {
            const colorMap = {
                'HIGH': '#ef476f',
                'MODERATE': '#ffd166',
                'LOW': '#06d6a0'
            };
            const strokeColor = colorMap[assessment.risk_level] || '#00b4d8';
            gaugeCircle.style.stroke = strokeColor;
            
            // Calculate SVG stroke offset for 0-100 score (circumference ~ 502)
            const circumference = 502;
            const offset = circumference - (assessment.risk_score / 100) * circumference;
            gaugeCircle.style.strokeDashoffset = offset;
        }

        // Render Matched Indicators List
        const indicatorsContainer = document.getElementById('resIndicatorsList');
        if (indicatorsContainer) {
            if (indicators.length === 0) {
                indicatorsContainer.innerHTML = `
                    <div class="alert alert-success bg-dark text-success border-success">
                        <i class="bi bi-check-circle-fill me-2"></i> No high-risk scam patterns matched in our rule database.
                    </div>
                `;
            } else {
                indicatorsContainer.innerHTML = indicators.map(ind => {
                    const sevClass = ind.severity === 'HIGH' ? 'danger' : (ind.severity === 'MEDIUM' ? 'warning' : 'info');
                    return `
                        <div class="glass-card p-3 mb-3 border-start border-4 border-${sevClass}">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h6 class="mb-0 text-white font-weight-bold">
                                    <i class="bi bi-exclamation-triangle-fill text-${sevClass} me-2"></i> ${escapeHTML(ind.name)}
                                </h6>
                                <span class="badge bg-${sevClass} ms-2">${ind.severity} SEVERITY</span>
                            </div>
                            <p class="text-secondary small mb-2">${escapeHTML(ind.explanation)}</p>
                            ${ind.context_snippet ? `<div class="p-2 bg-dark rounded font-monospace small text-muted mb-2">Matched Context: "${escapeHTML(ind.context_snippet)}"</div>` : ''}
                            <div class="text-cyan small"><i class="bi bi-shield-check me-1"></i> <strong>Safe Action:</strong> ${escapeHTML(ind.recommendation)}</div>
                        </div>
                    `;
                }).join('');
            }
        }

        // Render Safe Next Actions
        const recList = document.getElementById('resRecommendationsList');
        if (recList) {
            recList.innerHTML = recommendations.map(rec => `
                <li class="mb-2 text-secondary">
                    <i class="bi bi-shield-fill-check text-cyan me-2"></i> ${escapeHTML(rec)}
                </li>
            `).join('');
        }

        // Display Results Panel with Smooth Entrance Animation
        resultsPanel.style.animation = 'fadeInUp 0.6s var(--ease-cyber)';
        resultsPanel.classList.remove('d-none');
        resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // CSRF Token Helper
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }
});
