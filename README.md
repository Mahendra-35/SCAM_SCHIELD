# AI Aqua Farm Management System 🐟🌊

A complete, modern, production-ready, and responsive web application designed for aquaculture producers, fish farm managers, and environmental specialists. The system integrates **Firebase Authentication**, **Cloud Firestore**, and **Firebase Storage** with a rule-based **AI Water Quality Advisory Engine**, Chart.js visualizations, smart feeding calculators, disease logs, harvest profitability tracking, and role-based access control.

---

## 🌟 Key Features & Modules

1. **Firebase Authentication & RBAC**:
   - User registration, email/password login, role selection (**Admin** vs **Farmer**), and sign-out.
   - Admin role grants full system CRUD privileges; Farmer role provides daily operational logging and read/write capabilities.
   - Quick one-click demo login buttons included for instant evaluation.

2. **Isolated Firebase Configuration & GitHub Pages Ready**:
   - All credentials isolated in `js/firebase-config.js`.
   - Built-in fallback/demo mode automatically activates when live credentials are not present, allowing instant deployment on GitHub Pages or local web servers out of the box!

3. **Analytics Dashboard**:
   - Dynamic KPI summary cards (Active Ponds, Fish Biomass, Farm Health Index, Estimated Daily Feed, Net Profit YTD).
   - Real-time Chart.js graphs for water quality parameter trends and financial yields.
   - AI Advisory status banner and recent activity stream.

4. **Pond Management**:
   - Full CRUD operations with attributes: Pond Name, Surface Area ($m^2$), Depth ($m$), Water Capacity ($L$), Species Stocked, Operational Status, and Equipment Notes.

5. **Fish Stock Management**:
   - Full CRUD tracking fish species (Nile Tilapia, Pangasius Catfish, Whiteleg Shrimp, Asian Seabass), stocking quantity, stocking date, average weight ($g$), batch numbers, and auto-calculated biomass.

6. **Daily Water Quality Logs & Rule-Based AI Engine**:
   - Complete tracking for pH, Temperature (°C), Dissolved Oxygen ($mg/L$), Salinity ($ppt$), Ammonia ($mg/L$), Nitrite ($mg/L$).
   - **Automated AI Diagnostic Rules**:
     - **Low Dissolved Oxygen (< 5.0 mg/L)**: `CRITICAL ALERT` - Trigger aerators immediately, reduce feed by 50%.
     - **High Ammonia (> 0.05 mg/L)**: `WARNING` - Execute 25% water replacement, apply bio-probiotics, halt feeding.
     - **Abnormal pH (< 6.5 or > 8.5)**: `ACTION NEEDED` - Apply agricultural lime ($CaCO_3$) for low pH or partial water renewal for high pH.
     - **Temperature Extreme (< 22°C or > 32°C)**: `STRESS ALERT` - Fish metabolic rate decreased; adjust feeding ration.
   - Interactive modal diagnosis report for any individual water log entry.

7. **Smart Feed Calculator & Feed Logs**:
   - Computes daily feed requirements based on fish count, average weight, and feeding ration percentage:
     $$\text{Daily Feed (kg)} = \frac{\text{Fish Count} \times \text{Avg Weight (g)}}{1000} \times \left(\frac{\text{Feed Rate \%}}{100}\right)$$
   - Breaks down daily ration into Morning (40%), Afternoon (30%), and Evening (30%) feedings.

8. **Disease & Health Management**:
   - Track disease names, symptoms, treatments administered, observation dates, resolution status, and photo attachments with preview modal.

9. **Harvest & Financial Management**:
   - Log harvest date, harvested weight ($kg$), selling price per kg ($), gross revenue ($), total expenses ($), net profit ($), and buyer details.

10. **Reports & Data Export**:
    - Filterable summaries (Consolidated, Water Quality, Financial Yields).
    - One-click CSV Export functionality for water quality logs and printable report layouts.

11. **Responsive UI & Dark/Light Mode**:
    - Modern glassmorphic and clean oceanic aesthetic with custom CSS variables.
    - Persistent Light/Dark theme switcher.
    - Mobile-first collapsible sidebar navigation.

---

## 🚀 GitHub Pages & Firebase Deployment Guide

### Option 1: Direct GitHub Pages Deployment (Demo Mode)
1. Push this repository to GitHub.
2. In your GitHub repo settings, navigate to **Pages** -> Select `main` branch -> Save.
3. Your application is live immediately! The fallback store will populate realistic seed data for instant testing.

### Option 2: Live Firebase Integration
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Authentication** (Email/Password method).
3. Create a **Firestore Database** in production mode.
4. Enable **Firebase Storage**.
5. Copy your web app's configuration object and paste it into `js/firebase-config.js`:
   ```javascript
   window.firebaseConfig = {
       apiKey: "YOUR_ACTUAL_API_KEY",
       authDomain: "your-app.firebaseapp.com",
       projectId: "your-app-id",
       storageBucket: "your-app.appspot.com",
       messagingSenderId: "1234567890",
       appId: "1:1234567890:web:abcdef"
   };
   ```
6. Deploy to GitHub Pages or any static hosting (Vercel, Netlify, Firebase Hosting).

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom properties, Flexbox/Grid, Dark/Light mode, Glassmorphism), ES6 JavaScript Modules.
- **Charts**: [Chart.js](https://www.chartjs.org/) via CDN.
- **Icons**: [RemixIcon](https://remixicon.com/) via CDN.
- **Cloud Backend**: Firebase Authentication, Firestore DB, Firebase Storage (with local fallback).
