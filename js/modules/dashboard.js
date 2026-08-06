/**
 * AI AQUA FARM MANAGEMENT SYSTEM - DASHBOARD MODULE
 * Calculates summary cards, AI recommendations, recent activities, and charts.
 */

window.dashboardModule = {
    init() {
        this.renderStats();
        this.renderAIAdvisorBanner();
        this.renderRecentActivities();
        this.renderCharts();
    },

    renderStats() {
        const ponds = window.appState.getPonds();
        const stock = window.appState.getStock();
        const waterLogs = window.appState.getWaterLogs();
        const harvests = window.appState.getHarvests();

        // 1. Total Ponds & Active count
        const totalPonds = ponds.length;
        const activePonds = ponds.filter(p => p.status === 'Active' || p.status === 'Harvesting').length;
        const pondsElem = document.getElementById('dash-stat-ponds');
        if (pondsElem) pondsElem.textContent = `${activePonds} / ${totalPonds}`;

        // 2. Total Fish Count & Biomass
        let totalFishCount = 0;
        let totalBiomassKg = 0;
        stock.forEach(s => {
            const qty = parseInt(s.quantity) || 0;
            const weightGrams = parseFloat(s.avgWeightGrams) || 0;
            totalFishCount += qty;
            totalBiomassKg += (qty * weightGrams) / 1000;
        });

        const fishElem = document.getElementById('dash-stat-fish');
        if (fishElem) fishElem.textContent = totalFishCount.toLocaleString();

        const biomassElem = document.getElementById('dash-stat-biomass');
        if (biomassElem) biomassElem.textContent = `${Math.round(totalBiomassKg).toLocaleString()} kg`;

        // 3. Farm Health Score (AI calculated)
        const healthScore = window.aiEngine ? window.aiEngine.calculateFarmHealthScore(waterLogs) : 92;
        const healthElem = document.getElementById('dash-stat-health');
        if (healthElem) {
            healthElem.textContent = `${healthScore} / 100`;
            const badge = document.getElementById('dash-health-badge');
            if (badge) {
                if (healthScore >= 85) {
                    badge.className = 'badge badge-success';
                    badge.textContent = 'Optimal Status';
                } else if (healthScore >= 70) {
                    badge.className = 'badge badge-warning';
                    badge.textContent = 'Attention Needed';
                } else {
                    badge.className = 'badge badge-danger';
                    badge.textContent = 'Critical Warning';
                }
            }
        }

        // 4. Daily Feed Requirement Estimate (Biomass * ~3.0% avg feed rate)
        const dailyFeedKg = (totalBiomassKg * 0.03).toFixed(1);
        const feedElem = document.getElementById('dash-stat-feed');
        if (feedElem) feedElem.textContent = `${dailyFeedKg} kg / day`;

        // 5. Financial Net Profit
        let totalProfit = 0;
        harvests.forEach(h => totalProfit += parseFloat(h.netProfit || 0));
        const profitElem = document.getElementById('dash-stat-profit');
        if (profitElem) profitElem.textContent = `$${totalProfit.toLocaleString()}`;
    },

    renderAIAdvisorBanner() {
        const waterLogs = window.appState.getWaterLogs();
        const latestLog = waterLogs.length > 0 ? waterLogs[0] : null;

        const recs = window.aiEngine ? window.aiEngine.analyzeWaterQuality(latestLog) : [];
        const container = document.getElementById('dash-ai-recs-container');
        
        if (!container) return;

        if (recs.length === 0) {
            container.innerHTML = `
                <div class="ai-rec-item good">
                    <div>
                        <strong>Optimal Aqua Conditions:</strong> All water parameters (pH, DO, Temp, Ammonia) are currently within ideal species tolerance ranges.
                    </div>
                    <span class="badge badge-success"><i class="ri-check-line"></i> All Clear</span>
                </div>
            `;
        } else {
            container.innerHTML = recs.map(r => `
                <div class="ai-rec-item ${r.severity}">
                    <div>
                        <strong>${r.title} (${r.parameter}: ${r.value}):</strong> ${r.action}
                    </div>
                    <span class="badge badge-${r.severity === 'critical' ? 'danger' : 'warning'}">
                        ${r.severity.toUpperCase()}
                    </span>
                </div>
            `).join('');
        }
    },

    renderRecentActivities() {
        const container = document.getElementById('dash-activities-list');
        if (!container) return;

        const waterLogs = window.appState.getWaterLogs().slice(0, 3);
        const harvests = window.appState.getHarvests().slice(0, 2);

        const activities = [];

        waterLogs.forEach(w => {
            activities.push({
                icon: 'ri-drop-line',
                iconColor: 'var(--brand-primary)',
                title: `Water log recorded for Pond`,
                desc: `pH: ${w.ph}, DO: ${w.dissolvedOxygen} mg/L, Temp: ${w.temp}°C`,
                time: w.timestamp
            });
        });

        harvests.forEach(h => {
            activities.push({
                icon: 'ri-shopping-basket-2-line',
                iconColor: 'var(--success)',
                title: `Harvest record completed`,
                desc: `${h.weightKg} kg sold at $${h.pricePerKg}/kg (Net Profit: $${h.netProfit})`,
                time: h.harvestDate
            });
        });

        container.innerHTML = activities.map(act => `
            <div style="display:flex; align-items:flex-start; gap:0.85rem; padding:0.6rem 0; border-bottom:1px solid var(--border-light);">
                <div style="width:34px; height:34px; border-radius:var(--radius-full); background:var(--bg-tertiary); color:${act.iconColor}; display:flex; align-items:center; justify-content:center; font-size:1.1rem; flex-shrink:0;">
                    <i class="${act.icon}"></i>
                </div>
                <div style="flex:1;">
                    <div style="font-size:0.88rem; font-weight:600;">${act.title}</div>
                    <div style="font-size:0.8rem; color:var(--text-muted);">${act.desc}</div>
                </div>
                <div style="font-size:0.75rem; color:var(--text-muted); white-space:nowrap;">${act.time}</div>
            </div>
        `).join('');
    },

    renderCharts() {
        if (window.chartManager) {
            window.chartManager.renderWaterQualityChart('dashboard-water-chart', window.appState.getWaterLogs());
            window.chartManager.renderFinancialChart('dashboard-financial-chart', window.appState.getHarvests());
        }
    }
};
