# ScamShield 🛡️

An online scam awareness and risk-checking platform built with Django.

## 🚀 Live Demo

[Click here to visit ScamShield](https://scam-schield.onrender.com/)

## 🛠️ Technologies Used

* Python
* Django
* Django REST Framework
* HTML, CSS, JavaScript
* SQLite
* Render (Deployment)


# 🛡️ ScamShield — Online Scam Awareness & Risk Checker

**ScamShield** is a production-ready, full-stack cybersecurity web application built for online scam awareness, digital threat detection, and automated risk checking.

It empowers users to evaluate suspicious messages, fake job offers, email phishing attempts, banking SMS alerts, investment schemes, and deceptive website links before taking risky actions.

---

## 🌟 Key Features

1. **Interactive Scam Checker (Core Engine)**:
   - Evaluates suspicious content across 7 categories: Job Offers, SMS/Chat, Phishing Email, Website URLs, Online Shopping, Investment Schemes, and Other Suspicious Content.
   - Preset test samples ("Fake Job Offer", "Phishing Email", "Banking SMS", "Crypto Scam") for instant testing.
   - Animated SVG Risk Gauge Meter presenting a normalized risk score from 0 to 100 with risk category badges (`Low Risk Indicators`, `Moderate Risk Indicators`, `High Risk Indicators`).

2. **Contextual Rule & Structural Analysis Engine**:
   - **Text Pattern Matching**: Multi-indicator weighted rules detecting upfront registration fees, confidential credential/OTP requests, extreme urgency threats, unofficial Telegram/WhatsApp contact demands, and video-like task schemes.
   - **URL Structural Inspector**: Analyzes domain structure, raw IP address hosts, typosquatting brand lookalikes (`paypa1.com`, `g00gle.com`), high-risk TLDs (`.xyz`, `.top`, `.buzz`, `.click`), URL shorteners (`bit.ly`, `tinyurl`), multi-level subdomains, and missing HTTPS on sensitive pages.
   - **Contextual Normalization**: Dampens false positive scores on benign single keywords.

3. **Educational Awareness Hub**:
   - Searchable learning center with real-time keyword search and category filters.
   - Educational guides covering common scam tactics, common warning signs, **clearly labeled educational simulated examples**, step-by-step verification checklists, and protection tips.

4. **Community Incident Reporting**:
   - Privacy-focused submission form allowing users to submit suspicious incidents for research.
   - Does NOT request or collect passwords, OTPs, bank details, or sensitive personal data.

5. **User & Admin Dashboards**:
   - **User Dashboard**: Personal scan history table, risk level distribution doughnut chart (Chart.js), and history item deletion.
   - **Admin Panel**: Platform statistics (total users, total scans, total reports), top detected threat warning signs frequency bar chart (Chart.js), risk breakdown pie chart, and recent community incident reports oversight.

6. **Cybersecurity Dark-Navy UI**:
   - Premium glassmorphic interface with accessible contrast, responsive Bootstrap 5 grid layout, subtle hover effects, dynamic Bootstrap toast notifications, and loading indicators.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3, Bootstrap Icons, Chart.js.
- **Backend**: Python 3.13, Django 6.1, Django REST Framework (DRF).
- **Analysis Engine**: Python-based rule engine, regex pattern matcher, URL parser, multi-factor risk scoring algorithm.
- **Database**: SQLite (default zero-config setup) with MySQL support toggle.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure Python 3.10+ is installed on your system.

### 2. Run Database Migrations
```bash
python manage.py migrate
```

### 3. Seed Database with Educational Articles & Admin User
Run the automated seed command to populate the database with educational guides, demo data, and administrator accounts:
```bash
python manage.py seed_scam_data
```

> **Default Demo Credentials:**
> - **Admin User**: `admin` / Password: `admin123` (Access `/admin/` or `/admin-dashboard/`)
> - **Demo User**: `demo_user` / Password: `demo123` (Access `/dashboard/`)

### 4. Start Development Server
```bash
python manage.py runserver 8000
```
Open your browser and navigate to: **http://127.0.0.1:8000/**

---

## 🔄 Switching from SQLite to MySQL

ScamShield supports both SQLite and MySQL databases. By default, it operates on SQLite for zero-configuration local execution.

To switch to MySQL:

1. **Install MySQL Connector**:
   ```bash
   pip install mysql-connector-python
   ```
2. **Create MySQL Database**:
   Log into your MySQL server and create a database:
   ```sql
   CREATE DATABASE scamshield_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. **Update Database Settings in `scamshield/settings.py`**:
   Comment out the SQLite `DATABASES` dictionary and activate the MySQL configuration block:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.mysql',
           'NAME': 'scamshield_db',
           'USER': 'root',               # Your MySQL Username
           'PASSWORD': 'your_password',   # Your MySQL Password
           'HOST': '127.0.0.1',
           'PORT': '3306',
           'OPTIONS': {
               'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
           }
       }
   }
   ```
4. **Apply Migrations to MySQL**:
   ```bash
   python manage.py migrate
   python manage.py seed_scam_data
   ```

---

## 🧪 Running Automated Unit Tests

Execute Django's unit test suite to verify validators, URL inspection rules, risk scoring algorithms, and API endpoints:
```bash
python manage.py test
```

---

## 📡 REST API Documentation

### 1. Analyze Content
- **Endpoint**: `POST /api/analyze/`
- **Payload**:
  ```json
  {
    "text": "Pay $120 registration fee to receive remote laptop kit.",
    "url": "http://global-jobs.xyz",
    "category": "JOB_INTERNSHIP"
  }
  ```
- **Response**:
  ```json
  {
    "risk_assessment": {
      "risk_score": 85,
      "risk_level": "HIGH",
      "level_display": "High Risk Indicators",
      "summary": "Critical scam warning signs detected! High probability of fraudulent content."
    },
    "indicators": [
      {
        "rule_id": "RULE_UPFRONT_FEE",
        "name": "Advance Payment or Registration Fee Request",
        "severity": "HIGH",
        "weight": 35,
        "explanation": "The content requests payment before providing a job...",
        "recommendation": "Refuse to pay any advance fee."
      }
    ]
  }
  ```

---

## 📄 License & Disclaimer

*Disclaimer: Automated analysis provided by ScamShield consists of informational risk indicators based on pattern detection algorithms, not absolute proof of fraud or safety. Users must verify important information independently through official channels.*
