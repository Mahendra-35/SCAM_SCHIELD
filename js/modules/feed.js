/**
 * AI AQUA FARM MANAGEMENT SYSTEM - FEED CALCULATOR & FEED LOGS MODULE
 */

window.feedModule = {
    init() {
        this.populatePondSelect();
        this.renderFeedLogsTable();
        this.bindEvents();
        this.calculateFeed(); // Run initial calc
    },

    bindEvents() {
        const pondSelect = document.getElementById('calc-pond-select');
        if (pondSelect) {
            pondSelect.onchange = () => this.autoFillFromStock();
        }

        const countInput = document.getElementById('calc-fish-count');
        const weightInput = document.getElementById('calc-avg-weight');
        const rateInput = document.getElementById('calc-feed-rate');

        [countInput, weightInput, rateInput].forEach(inp => {
            if (inp) inp.oninput = () => this.calculateFeed();
        });

        const logFeedBtn = document.getElementById('btn-log-feed-calc');
        if (logFeedBtn) {
            logFeedBtn.onclick = () => this.saveCalculatedFeedLog();
        }
    },

    populatePondSelect() {
        const select = document.getElementById('calc-pond-select');
        if (!select) return;
        const ponds = window.appState.getPonds();
        select.innerHTML = '<option value="">-- Select Pond --</option>' + ponds.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    },

    autoFillFromStock() {
        const pondId = document.getElementById('calc-pond-select').value;
        if (!pondId) return;

        const stocks = window.appState.getStock().filter(s => s.pondId === pondId);
        if (stocks.length > 0) {
            let totalQty = 0;
            let weightedSum = 0;
            stocks.forEach(s => {
                const qty = parseInt(s.quantity) || 0;
                const weight = parseFloat(s.avgWeightGrams) || 0;
                totalQty += qty;
                weightedSum += qty * weight;
            });

            const avgWeight = totalQty > 0 ? (weightedSum / totalQty).toFixed(1) : 150;

            document.getElementById('calc-fish-count').value = totalQty;
            document.getElementById('calc-avg-weight').value = avgWeight;

            // Species specific feeding rate heuristic
            let defaultRate = 3.0;
            if (avgWeight < 20) defaultRate = 6.0;
            else if (avgWeight < 100) defaultRate = 4.5;
            else if (avgWeight > 500) defaultRate = 2.0;

            document.getElementById('calc-feed-rate').value = defaultRate;
            this.calculateFeed();
        }
    },

    calculateFeed() {
        const count = parseFloat(document.getElementById('calc-fish-count').value) || 0;
        const weightGrams = parseFloat(document.getElementById('calc-avg-weight').value) || 0;
        const feedRatePct = parseFloat(document.getElementById('calc-feed-rate').value) || 0;

        const totalBiomassKg = (count * weightGrams) / 1000;
        const dailyFeedKg = totalBiomassKg * (feedRatePct / 100);

        // Meal breakdown (Morning 40%, Afternoon 30%, Evening 30%)
        const morningKg = (dailyFeedKg * 0.40).toFixed(1);
        const afternoonKg = (dailyFeedKg * 0.30).toFixed(1);
        const eveningKg = (dailyFeedKg * 0.30).toFixed(1);

        document.getElementById('calc-result-biomass').textContent = `${Math.round(totalBiomassKg).toLocaleString()} kg`;
        document.getElementById('calc-result-daily').textContent = `${dailyFeedKg.toFixed(1)} kg`;
        document.getElementById('calc-result-morning').textContent = `${morningKg} kg`;
        document.getElementById('calc-result-afternoon').textContent = `${afternoonKg} kg`;
        document.getElementById('calc-result-evening').textContent = `${eveningKg} kg`;
    },

    saveCalculatedFeedLog() {
        const pondId = document.getElementById('calc-pond-select').value;
        const dailyFeedKg = parseFloat(document.getElementById('calc-result-daily').textContent) || 0;
        const feedRatePercent = parseFloat(document.getElementById('calc-feed-rate').value) || 3.0;

        if (!pondId || dailyFeedKg <= 0) {
            window.uiManager.showToast('Please select a pond and calculate a valid feed ration', 'warning');
            return;
        }

        const dateStr = new Date().toISOString().split('T')[0];

        const log = {
            pondId,
            date: dateStr,
            feedBrand: 'AquaGrow Floating Pellets (30% Protein)',
            quantityKg: dailyFeedKg,
            feedRatePercent,
            notes: 'Calculated via AI Feed Optimization Engine'
        };

        window.appState.saveFeedLog(log);
        window.uiManager.showToast(`Logged ${dailyFeedKg} kg daily feed ration successfully`, 'success');
        this.renderFeedLogsTable();
        if (window.dashboardModule) window.dashboardModule.init();
    },

    renderFeedLogsTable() {
        const container = document.getElementById('feed-logs-table-body');
        if (!container) return;

        const logs = window.appState.getFeedLogs();
        const ponds = window.appState.getPonds();

        if (logs.length === 0) {
            container.innerHTML = `<tr><td colspan="6" class="empty-state"><i class="ri-restaurant-line"></i><br>No Feed Logs Recorded</td></tr>`;
            return;
        }

        const isAdmin = window.authService ? window.authService.isAdmin() : true;

        container.innerHTML = logs.map(l => {
            const pond = ponds.find(p => p.id === l.pondId);
            const pondName = pond ? pond.name : 'Pond';

            return `
                <tr>
                    <td>${l.date}</td>
                    <td><strong>${pondName}</strong></td>
                    <td>${l.feedBrand || 'Standard Pellets'}</td>
                    <td><strong>${l.quantityKg} kg</strong></td>
                    <td>${l.feedRatePercent}%</td>
                    <td>
                        ${isAdmin ? `<button class="btn btn-sm btn-danger" onclick="feedModule.deleteFeedLog('${l.id}')"><i class="ri-delete-bin-line"></i></button>` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    },

    deleteFeedLog(id) {
        if (confirm('Delete feed log entry?')) {
            window.appState.deleteItem('aqua_feed_v1', id);
            window.uiManager.showToast('Feed log entry deleted', 'info');
            this.renderFeedLogsTable();
            if (window.dashboardModule) window.dashboardModule.init();
        }
    }
};
