/**
 * AI AQUA FARM MANAGEMENT SYSTEM - UI UTILITIES & INTERACTION MANAGER
 */

class UIManager {
    constructor() {
        this.initTheme();
    }

    initTheme() {
        const savedTheme = localStorage.getItem('aqua_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('aqua_theme', newTheme);
        this.updateThemeIcon(newTheme);
        
        // Re-render chart colors if active
        if (window.chartManager) {
            window.chartManager.updateThemeColors(newTheme);
        }
    }

    updateThemeIcon(theme) {
        const btnIcon = document.querySelector('.theme-toggle-btn i');
        if (btnIcon) {
            btnIcon.className = theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
        }
    }

    showToast(message, type = 'info', title = '') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconClass = 'ri-information-line';
        if (type === 'success') iconClass = 'ri-checkbox-circle-line';
        if (type === 'warning') iconClass = 'ri-error-warning-line';
        if (type === 'danger') iconClass = 'ri-alert-line';

        toast.innerHTML = `
            <div class="toast-icon"><i class="${iconClass}"></i></div>
            <div class="toast-content">
                ${title ? `<strong>${title}</strong><br>` : ''}
                ${message}
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()"><i class="ri-close-line"></i></button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'fadeOut 0.3s forwards';
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }

    openModal(modalId) {
        const backdrop = document.getElementById(modalId);
        if (backdrop) {
            backdrop.classList.add('active');
        }
    }

    closeModal(modalId) {
        const backdrop = document.getElementById(modalId);
        if (backdrop) {
            backdrop.classList.remove('active');
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal-backdrop').forEach(mb => mb.classList.remove('active'));
    }

    switchTab(moduleId) {
        // Update nav item active state
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.getAttribute('data-module') === moduleId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Hide all module views and show active
        document.querySelectorAll('.module-view').forEach(view => {
            if (view.id === `view-${moduleId}`) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });

        // Update Page Title in Topbar
        const titleMap = {
            'dashboard': 'Farm Analytics Dashboard',
            'ponds': 'Pond Management',
            'stock': 'Fish Stock Management',
            'water': 'Daily Water Quality Logs & AI Analysis',
            'feed': 'Smart Feed Calculator',
            'disease': 'Disease Management & Health Log',
            'harvest': 'Harvest & Financial Records',
            'reports': 'Farm Performance Reports',
            'notifications': 'System Notifications & Alerts',
            'profile': 'User Profile & Settings'
        };

        const titleElem = document.getElementById('page-title');
        if (titleElem && titleMap[moduleId]) {
            titleElem.textContent = titleMap[moduleId];
        }

        // Close mobile sidebar if open
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar && sidebar.classList.contains('mobile-open')) {
            sidebar.classList.remove('mobile-open');
            if (overlay) overlay.classList.remove('active');
        }
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
    }

    toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar) {
            sidebar.classList.toggle('mobile-open');
            if (overlay) overlay.classList.toggle('active');
        }
    }
}

window.uiManager = new UIManager();
