/**
 * AI AQUA FARM MANAGEMENT SYSTEM - WATER QUALITY LOGS & AI ANALYSIS MODULE
 */

window.waterModule = {
    init() {
        this.renderTable();
        this.bindEvents();
    },

    bindEvents() {
        const addBtn = document.getElementById('btn-add-water');
        if (addBtn) {
            addBtn.onclick = () => this.openWaterModal();
        }

        const form = document.getElementById('water-form');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                this.saveWaterLog();
            };
        }

        const searchInput = document.getElementById('water-search');
        if (searchInput) {
            searchInput.oninput = (e) => this.renderTable(e.target.value);
        }
    },

    renderTable(filterText = '') {
        const container = document.getElementById('water-table-body');
        if (!container) return;

        let logs = window.appState.getWaterLogs();
        const ponds = window.appState.getPonds();

        if (filterText) {
            const term = filterText.toLowerCase();
            logs = logs.filter(l => l.timestamp.toLowerCase().includes(term) || (l.remarks && l.remarks.toLowerCase().includes(term)));
        }

        if (logs.length === 0) {
            container.innerHTML = `<tr><td colspan="8" class="empty-state"><i class="ri-drop-line"></i><br>No Water Quality Logs Found</td></tr>`;
            return;
        }

        const isAdmin = window.authService ? window.authService.isAdmin() : true;

        container.innerHTML = logs.map(l => {
            const pond = ponds.find(p => p.id === l.pondId);
            const pondName = pond ? pond.name : 'Pond';

            // AI Status evaluation for table tag
            const doVal = parseFloat(l.dissolvedOxygen);
            const ammonia = parseFloat(l.ammonia);
            let statusBadge = '<span class="badge badge-success">Optimal</span>';
            if (doVal < 4.0 || ammonia > 0.08) {
                statusBadge = '<span class="badge badge-danger">Critical Alert</span>';
            } else if (doVal < 5.0 || ammonia > 0.04) {
                statusBadge = '<span class="badge badge-warning">Attention</span>';
            }

            return `
                <tr>
                    <td>${l.timestamp}</td>
                    <td><strong>${pondName}</strong></td>
                    <td>${l.ph}</td>
                    <td>${l.temp} °C</td>
                    <td><strong style="color:${doVal < 5 ? 'var(--danger)' : 'inherit'}">${l.dissolvedOxygen} mg/L</strong></td>
                    <td>${l.salinity} ppt</td>
                    <td><strong style="color:${ammonia > 0.05 ? 'var(--danger)' : 'inherit'}">${l.ammonia} mg/L</strong></td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="waterModule.analyzeLog('${l.id}')" title="AI Diagnosis"><i class="ri-brain-line"></i> AI</button>
                        <button class="btn btn-sm btn-outline" onclick="waterModule.editWaterLog('${l.id}')"><i class="ri-edit-line"></i></button>
                        ${isAdmin ? `<button class="btn btn-sm btn-danger" onclick="waterModule.deleteWaterLog('${l.id}')"><i class="ri-delete-bin-line"></i></button>` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    },

    populatePondOptions() {
        const select = document.getElementById('water-pond-id');
        if (!select) return;
        const ponds = window.appState.getPonds();
        select.innerHTML = ponds.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    },

    openWaterModal(log = null) {
        this.populatePondOptions();

        const now = new Date();
        const timestampStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

        document.getElementById('water-id').value = log ? log.id : '';
        if (log) document.getElementById('water-pond-id').value = log.pondId;
        document.getElementById('water-timestamp').value = log ? log.timestamp : timestampStr;
        document.getElementById('water-ph').value = log ? log.ph : '7.5';
        document.getElementById('water-temp').value = log ? log.temp : '28.0';
        document.getElementById('water-do').value = log ? log.dissolvedOxygen : '6.5';
        document.getElementById('water-salinity').value = log ? log.salinity : '0.5';
        document.getElementById('water-ammonia').value = log ? log.ammonia : '0.02';
        document.getElementById('water-nitrite').value = log ? log.nitrite : '0.01';
        document.getElementById('water-remarks').value = log ? (log.remarks || '') : 'Routine morning reading';

        document.getElementById('water-modal-title').textContent = log ? 'Edit Water Quality Log' : 'Add Water Quality Observation';
        window.uiManager.openModal('water-modal');
    },

    saveWaterLog() {
        const id = document.getElementById('water-id').value;
        const pondId = document.getElementById('water-pond-id').value;
        const timestamp = document.getElementById('water-timestamp').value;
        const ph = parseFloat(document.getElementById('water-ph').value);
        const temp = parseFloat(document.getElementById('water-temp').value);
        const dissolvedOxygen = parseFloat(document.getElementById('water-do').value);
        const salinity = parseFloat(document.getElementById('water-salinity').value);
        const ammonia = parseFloat(document.getElementById('water-ammonia').value);
        const nitrite = parseFloat(document.getElementById('water-nitrite').value) || 0;
        const remarks = document.getElementById('water-remarks').value.trim();

        if (isNaN(ph) || isNaN(temp) || isNaN(dissolvedOxygen) || isNaN(ammonia)) {
            window.uiManager.showToast('Please fill in valid numerical parameter values', 'warning');
            return;
        }

        const logData = { id, pondId, timestamp, ph, temp, dissolvedOxygen, salinity, ammonia, nitrite, remarks };
        window.appState.saveWaterLog(logData);
        window.uiManager.closeModal('water-modal');

        // Check if AI generated warnings for instant user feedback toast
        const recs = window.aiEngine.analyzeWaterQuality(logData);
        if (recs.length > 0) {
            window.uiManager.showToast(`Water Log Saved. AI detected ${recs.length} actionable recommendation(s).`, 'warning', 'AI Diagnostic Alert');
        } else {
            window.uiManager.showToast('Water Quality Log recorded successfully.', 'success');
        }

        this.renderTable();
        if (window.dashboardModule) window.dashboardModule.init();
    },

    analyzeLog(id) {
        const logs = window.appState.getWaterLogs();
        const log = logs.find(l => l.id === id);
        if (!log) return;

        const recs = window.aiEngine.analyzeWaterQuality(log);
        const modalBody = document.getElementById('ai-dialog-content');
        if (!modalBody) return;

        if (recs.length === 0) {
            modalBody.innerHTML = `
                <div class="ai-rec-item good">
                    <i class="ri-checkbox-circle-fill" style="font-size:1.5rem; color:var(--success);"></i>
                    <div>
                        <h4>Water Quality Is Excellent</h4>
                        <p>All recorded metrics (pH: ${log.ph}, DO: ${log.dissolvedOxygen} mg/L, Temp: ${log.temp}°C, Ammonia: ${log.ammonia} mg/L) are well within optimal culture parameters.</p>
                    </div>
                </div>
            `;
        } else {
            modalBody.innerHTML = recs.map(r => `
                <div class="ai-rec-item ${r.severity}" style="margin-bottom:0.85rem;">
                    <div>
                        <h4 style="color:${r.severity === 'critical' ? 'var(--danger)' : 'var(--warning)'}; margin-bottom:0.2rem;">${r.title}</h4>
                        <p><strong>Parameter (${r.parameter}):</strong> ${r.value}</p>
                        <p style="margin-top:0.35rem;"><strong>Recommended Action:</strong> ${r.action}</p>
                    </div>
                </div>
            `).join('');
        }

        window.uiManager.openModal('ai-diagnosis-modal');
    },

    editWaterLog(id) {
        const logs = window.appState.getWaterLogs();
        const log = logs.find(l => l.id === id);
        if (log) this.openWaterModal(log);
    },

    deleteWaterLog(id) {
        if (confirm('Delete this water quality record?')) {
            window.appState.deleteWaterLog(id);
            window.uiManager.showToast('Log entry removed', 'info');
            this.renderTable();
            if (window.dashboardModule) window.dashboardModule.init();
        }
    }
};
