/**
 * AI AQUA FARM MANAGEMENT SYSTEM - USER PROFILE & SETTINGS MODULE
 */

window.profileModule = {
    init() {
        this.renderProfile();
        this.bindEvents();
    },

    bindEvents() {
        const logoutBtn = document.getElementById('btn-profile-logout');
        if (logoutBtn) {
            logoutBtn.onclick = () => {
                if (confirm('Are you sure you want to log out?')) {
                    window.authService.logout();
                }
            };
        }

        const saveCfgBtn = document.getElementById('btn-save-fb-config');
        if (saveCfgBtn) {
            saveCfgBtn.onclick = () => this.saveFirebaseConfigFromUI();
        }
    },

    renderProfile() {
        const user = window.authService.getCurrentUser();
        if (!user) return;

        const nameElem = document.getElementById('profile-display-name');
        const emailElem = document.getElementById('profile-email');
        const roleElem = document.getElementById('profile-role-badge');
        const avatarElem = document.getElementById('profile-avatar');

        if (nameElem) nameElem.textContent = user.displayName || 'Aqua Farm User';
        if (emailElem) emailElem.textContent = user.email || 'user@aquafarm.ai';
        
        if (roleElem) {
            roleElem.textContent = user.role || 'Farmer';
            roleElem.className = `badge ${user.role === 'Admin' ? 'badge-danger' : 'badge-info'}`;
        }

        if (avatarElem) {
            const initial = (user.displayName || user.email || 'A').charAt(0).toUpperCase();
            avatarElem.textContent = initial;
        }

        // Render current Firebase Configuration Status
        const cfgStatusElem = document.getElementById('profile-fb-status');
        if (cfgStatusElem) {
            const isConfigured = window.isFirebaseConfigured();
            cfgStatusElem.innerHTML = isConfigured ? 
                `<span class="badge badge-success"><i class="ri-checkbox-circle-fill"></i> Firebase Connected</span>` :
                `<span class="badge badge-warning"><i class="ri-cloud-line"></i> Local Fallback Mode Active (GitHub Pages Ready)</span>`;
        }
    },

    saveFirebaseConfigFromUI() {
        const apiKey = document.getElementById('cfg-api-key').value.trim();
        const projectId = document.getElementById('cfg-project-id').value.trim();

        if (apiKey && projectId) {
            window.firebaseConfig.apiKey = apiKey;
            window.firebaseConfig.projectId = projectId;
            window.uiManager.showToast('Firebase credentials updated in local session.', 'success');
            window.uiManager.closeModal('fb-config-modal');
            this.renderProfile();
        } else {
            window.uiManager.showToast('Please provide both API Key and Project ID', 'warning');
        }
    }
};
