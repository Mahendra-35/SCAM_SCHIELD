/**
 * AI AQUA FARM MANAGEMENT SYSTEM - MAIN APPLICATION ROUTER & ENTRY POINT
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing AI Aqua Farm Management System...");

    // 1. Initialize Auth Listener & UI User Snippet
    window.authService.onAuthStateChanged(user => {
        if (!user) {
            // Show Auth Modal if user logged out
            window.uiManager.openModal('auth-modal');
        } else {
            window.uiManager.closeModal('auth-modal');
            updateUserUI(user);
        }
    });

    // 2. Setup Navigation Event Listeners
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const moduleId = item.getAttribute('data-module');
            if (moduleId) {
                window.uiManager.switchTab(moduleId);
                initModule(moduleId);
            }
        });
    });

    // 3. Topbar Action Handlers
    const themeBtn = document.querySelector('.theme-toggle-btn');
    if (themeBtn) {
        themeBtn.onclick = () => window.uiManager.toggleTheme();
    }

    const notifBtn = document.querySelector('.notifications-btn');
    if (notifBtn) {
        notifBtn.onclick = () => {
            window.uiManager.switchTab('notifications');
            if (window.notificationsModule) window.notificationsModule.init();
        };
    }

    const sidebarToggleBtn = document.querySelector('.sidebar-toggle-btn');
    if (sidebarToggleBtn) {
        sidebarToggleBtn.onclick = () => window.uiManager.toggleSidebar();
    }

    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.onclick = () => window.uiManager.toggleMobileSidebar();
    }

    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
        overlay.onclick = () => window.uiManager.toggleMobileSidebar();
    }

    // 4. Modal Close Listeners
    document.querySelectorAll('.modal-close-btn, [data-dismiss="modal"]').forEach(btn => {
        btn.addEventListener('click', () => window.uiManager.closeAllModals());
    });

    // 5. Auth Form Submissions
    setupAuthForms();

    // 6. Initialize Default Module (Dashboard)
    initModule('dashboard');
});

function updateUserUI(user) {
    if (!user) return;
    const nameElem = document.getElementById('user-snippet-name');
    const roleElem = document.getElementById('user-snippet-role');
    const avatarElem = document.getElementById('user-snippet-avatar');

    if (nameElem) nameElem.textContent = user.displayName || user.email;
    if (roleElem) roleElem.textContent = user.role || 'Farmer';
    if (avatarElem) avatarElem.textContent = (user.displayName || user.email || 'A').charAt(0).toUpperCase();

    // Enforce Role-Based Access Controls
    const isAdmin = window.authService.isAdmin();
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = isAdmin ? '' : 'none';
    });
}

function setupAuthForms() {
    const showView = (viewId) => {
        ['auth-login-view', 'auth-register-view', 'auth-forgot-view', 'auth-verify-view'].forEach(v => {
            const el = document.getElementById(v);
            if (el) el.style.display = (v === viewId) ? 'block' : 'none';
        });
    };

    const loginForm = document.getElementById('auth-login-form');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const pass = document.getElementById('login-password').value;

            const result = await window.authService.login(email, pass);
            if (result.success) {
                window.uiManager.showToast(`Welcome back, ${result.user.displayName}!`, 'success');
                window.uiManager.closeModal('auth-modal');
                updateUserUI(result.user);
                initModule('dashboard');
            } else {
                window.uiManager.showToast(result.message || 'Login failed', 'danger');
                if (result.code === 'auth/invalid-credential' || result.code === 'auth/user-not-found') {
                    document.getElementById('reg-email').value = email;
                }
            }
        };
    }

    const registerForm = document.getElementById('auth-register-form');
    if (registerForm) {
        registerForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('reg-email').value.trim();
            const pass = document.getElementById('reg-password').value;
            const confirmPass = document.getElementById('reg-confirm-password').value;
            const name = document.getElementById('reg-name').value.trim();
            const role = document.getElementById('reg-role').value;

            if (pass !== confirmPass) {
                window.uiManager.showToast('Passwords do not match. Please verify both fields.', 'danger');
                return;
            }

            const result = await window.authService.register(email, pass, name, role);
            if (result.success) {
                window.uiManager.showToast(result.message || 'Account created successfully!', 'success');
                if (result.verificationSent) {
                    showView('auth-verify-view');
                } else {
                    window.uiManager.closeModal('auth-modal');
                    updateUserUI(result.user);
                    initModule('dashboard');
                }
            } else {
                window.uiManager.showToast(result.message || 'Registration failed', 'danger');
            }
        };
    }

    const forgotForm = document.getElementById('auth-forgot-form');
    if (forgotForm) {
        forgotForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value.trim();
            const result = await window.authService.resetPassword(email);
            if (result.success) {
                window.uiManager.showToast(result.message, 'success');
                showView('auth-login-view');
            } else {
                window.uiManager.showToast(result.message || 'Reset failed', 'danger');
            }
        };
    }

    // Navigation Links inside Auth Modal
    const showRegLink = document.getElementById('link-show-register');
    const showLoginLink = document.getElementById('link-show-login');
    const showForgotLink = document.getElementById('link-show-forgot');
    const forgotToLoginLink = document.getElementById('link-forgot-to-login');

    if (showRegLink) showRegLink.onclick = (e) => { e.preventDefault(); showView('auth-register-view'); };
    if (showLoginLink) showLoginLink.onclick = (e) => { e.preventDefault(); showView('auth-login-view'); };
    if (showForgotLink) showForgotLink.onclick = (e) => { e.preventDefault(); showView('auth-forgot-view'); };
    if (forgotToLoginLink) forgotToLoginLink.onclick = (e) => { e.preventDefault(); showView('auth-login-view'); };

    // Verification View Actions
    const resendBtn = document.getElementById('btn-resend-verify');
    if (resendBtn) {
        resendBtn.onclick = async () => {
            const res = await window.authService.resendVerificationEmail();
            window.uiManager.showToast(res.message, res.success ? 'success' : 'danger');
        };
    }

    const verifyContinueBtn = document.getElementById('btn-verify-continue');
    if (verifyContinueBtn) {
        verifyContinueBtn.onclick = () => {
            window.uiManager.closeModal('auth-modal');
            const u = window.authService.getCurrentUser();
            if (u) updateUserUI(u);
            initModule('dashboard');
        };
    }

    // Quick Demo Account Auto-Logins
    const demoAdminBtn = document.getElementById('btn-demo-admin');
    if (demoAdminBtn) {
        demoAdminBtn.onclick = () => {
            document.getElementById('login-email').value = 'admin@aquafarm.ai';
            document.getElementById('login-password').value = 'password123';
            loginForm.dispatchEvent(new Event('submit'));
        };
    }

    const demoFarmerBtn = document.getElementById('btn-demo-farmer');
    if (demoFarmerBtn) {
        demoFarmerBtn.onclick = () => {
            document.getElementById('login-email').value = 'farmer@aquafarm.ai';
            document.getElementById('login-password').value = 'password123';
            loginForm.dispatchEvent(new Event('submit'));
        };
    }
}

function initModule(moduleId) {
    console.log("Loading module:", moduleId);
    switch(moduleId) {
        case 'dashboard':
            if (window.dashboardModule) window.dashboardModule.init();
            break;
        case 'ponds':
            if (window.pondsModule) window.pondsModule.init();
            break;
        case 'stock':
            if (window.stockModule) window.stockModule.init();
            break;
        case 'water':
            if (window.waterModule) window.waterModule.init();
            break;
        case 'feed':
            if (window.feedModule) window.feedModule.init();
            break;
        case 'disease':
            if (window.diseaseModule) window.diseaseModule.init();
            break;
        case 'harvest':
            if (window.harvestModule) window.harvestModule.init();
            break;
        case 'reports':
            if (window.reportsModule) window.reportsModule.init();
            break;
        case 'notifications':
            if (window.notificationsModule) window.notificationsModule.init();
            break;
        case 'profile':
            if (window.profileModule) window.profileModule.init();
            break;
    }
}
