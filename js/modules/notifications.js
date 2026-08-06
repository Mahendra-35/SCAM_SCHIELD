/**
 * AI AQUA FARM MANAGEMENT SYSTEM - NOTIFICATIONS MODULE
 */

window.notificationsModule = {
    init() {
        this.renderNotificationsList();
        this.updateBadgeCount();
        this.bindEvents();
    },

    bindEvents() {
        const markAllBtn = document.getElementById('btn-mark-all-read');
        if (markAllBtn) {
            markAllBtn.onclick = () => this.markAllAsRead();
        }
    },

    updateBadgeCount() {
        const notifs = window.appState.getNotifications();
        const unread = notifs.filter(n => !n.read).length;
        const badge = document.getElementById('topbar-notif-badge');
        if (badge) {
            if (unread > 0) {
                badge.style.display = 'flex';
                badge.textContent = unread;
            } else {
                badge.style.display = 'none';
            }
        }
    },

    renderNotificationsList() {
        const container = document.getElementById('notifications-list-container');
        if (!container) return;

        const notifs = window.appState.getNotifications();

        if (notifs.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="ri-notification-3-line"></i><br>No Notifications</div>`;
            return;
        }

        container.innerHTML = notifs.map(n => `
            <div class="card" style="margin-bottom:0.85rem; border-left:4px solid var(--${n.type === 'danger' ? 'danger' : n.type === 'warning' ? 'warning' : 'success'}); opacity:${n.read ? '0.75' : '1'};">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <h4 style="font-size:0.95rem; margin-bottom:0.25rem;">${n.title}</h4>
                        <p style="font-size:0.85rem; color:var(--text-secondary);">${n.message}</p>
                        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.35rem;">${n.date}</div>
                    </div>
                    ${!n.read ? `<button class="btn btn-sm btn-outline" onclick="notificationsModule.markAsRead('${n.id}')">Mark Read</button>` : ''}
                </div>
            </div>
        `).join('');
    },

    markAsRead(id) {
        window.appState.markNotificationAsRead(id);
        this.renderNotificationsList();
        this.updateBadgeCount();
    },

    markAllAsRead() {
        const notifs = window.appState.getNotifications();
        notifs.forEach(n => window.appState.markNotificationAsRead(n.id));
        this.renderNotificationsList();
        this.updateBadgeCount();
        window.uiManager.showToast('All notifications marked as read', 'info');
    }
};
