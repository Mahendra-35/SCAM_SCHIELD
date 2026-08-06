/**
 * AI AQUA FARM MANAGEMENT SYSTEM - FIREBASE CONFIGURATION
 * 
 * Instructions:
 * Replace the placeholder object below with your actual Firebase web project configuration.
 * Find your credentials in Firebase Console -> Project Settings -> General -> Your apps.
 * 
 * If credentials are not provided or if offline, the application will automatically
 * fall back to a local storage data store for full demonstration capabilities.
 */

window.firebaseConfig = {
    apiKey: "AIzaSyD8F8IV3EMro8_BHQGhIFKacceDyQgd7z8",
    authDomain: "ai-aqua-form-management-system.firebaseapp.com",
    projectId: "ai-aqua-form-management-system",
    storageBucket: "ai-aqua-form-management-system.firebasestorage.app",
    messagingSenderId: "194972413152",
    appId: "1:194972413152:web:f0f4f809817457a9b87485",
    measurementId: "G-993D2F7FFE"
};

// Check if configuration is using placeholder values
window.isFirebaseConfigured = function() {
    const cfg = window.firebaseConfig;
    return cfg && 
           cfg.apiKey && 
           !cfg.apiKey.includes("YOUR_FIREBASE_API_KEY") && 
           cfg.projectId && 
           !cfg.projectId.includes("your-aqua-farm");
};

// Global Firebase Reference Holders
window.fbApp = null;
window.fbAuth = null;
window.fbFirestore = null;
window.fbStorage = null;

if (window.isFirebaseConfigured() && typeof firebase !== 'undefined') {
    try {
        window.fbApp = firebase.initializeApp(window.firebaseConfig);
        window.fbAuth = firebase.auth();
        window.fbFirestore = firebase.firestore();
        window.fbStorage = firebase.storage();
        console.log("[Firebase Config] Firebase initialized successfully with project ID:", window.firebaseConfig.projectId);
    } catch (e) {
        console.warn("[Firebase Config] Could not initialize Firebase SDK:", e.message);
    }
} else {
    console.log("[Firebase Config] Running in offline / local fallback store mode.");
}

