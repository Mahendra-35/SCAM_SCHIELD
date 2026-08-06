/**
 * AI AQUA FARM MANAGEMENT SYSTEM - CHART VISUALIZATIONS (CHART.JS)
 */

class ChartManager {
    constructor() {
        this.charts = {};
    }

    getThemeColors() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return {
            text: isDark ? '#cbd5e1' : '#475569',
            grid: isDark ? '#334155' : '#e2e8f0',
            primary: '#0284c7',
            secondary: '#0d9488',
            warning: '#f59e0b',
            danger: '#ef4444',
            success: '#10b981'
        };
    }

    renderWaterQualityChart(canvasId, waterLogs) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const colors = this.getThemeColors();
        const logs = (waterLogs || []).slice(0, 10).reverse();

        const labels = logs.map(l => l.timestamp ? l.timestamp.split(' ')[1] || l.timestamp : 'Log');
        const doData = logs.map(l => parseFloat(l.dissolvedOxygen));
        const tempData = logs.map(l => parseFloat(l.temp));
        const phData = logs.map(l => parseFloat(l.ph));
        const ammoniaData = logs.map(l => parseFloat(l.ammonia) * 10); // scale x10 for visibility

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.length ? labels : ['08:00', '12:00', '16:00', '20:00'],
                datasets: [
                    {
                        label: 'Dissolved Oxygen (mg/L)',
                        data: doData.length ? doData : [6.5, 6.0, 5.2, 4.8],
                        borderColor: colors.primary,
                        backgroundColor: 'rgba(2, 132, 199, 0.1)',
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Temperature (°C)',
                        data: tempData.length ? tempData : [27, 29, 31, 28],
                        borderColor: colors.warning,
                        tension: 0.3,
                        borderDash: [5, 5]
                    },
                    {
                        label: 'pH Level',
                        data: phData.length ? phData : [7.4, 7.5, 7.8, 7.6],
                        borderColor: colors.secondary,
                        tension: 0.3
                    },
                    {
                        label: 'Ammonia (x10 mg/L)',
                        data: ammoniaData.length ? ammoniaData : [0.2, 0.3, 0.5, 0.4],
                        borderColor: colors.danger,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: colors.text, font: { family: 'Plus Jakarta Sans' } } }
                },
                scales: {
                    x: { ticks: { color: colors.text }, grid: { color: colors.grid } },
                    y: { ticks: { color: colors.text }, grid: { color: colors.grid } }
                }
            }
        });
    }

    renderFinancialChart(canvasId, harvestLogs) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const colors = this.getThemeColors();
        const harvests = harvestLogs || [];

        const labels = harvests.map(h => h.harvestDate || 'Harvest');
        const revenue = harvests.map(h => parseFloat(h.grossRevenue));
        const profit = harvests.map(h => parseFloat(h.netProfit));

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.length ? labels : ['H1', 'H2', 'H3'],
                datasets: [
                    {
                        label: 'Gross Revenue ($)',
                        data: revenue.length ? revenue : [16250, 8640, 12000],
                        backgroundColor: 'rgba(2, 132, 199, 0.75)',
                        borderRadius: 6
                    },
                    {
                        label: 'Net Profit ($)',
                        data: profit.length ? profit : [8450, 4440, 6200],
                        backgroundColor: 'rgba(16, 185, 129, 0.75)',
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: colors.text, font: { family: 'Plus Jakarta Sans' } } }
                },
                scales: {
                    x: { ticks: { color: colors.text }, grid: { color: colors.grid } },
                    y: { ticks: { color: colors.text }, grid: { color: colors.grid } }
                }
            }
        });
    }

    updateThemeColors() {
        // Trigger re-render of active charts
        if (window.appState) {
            this.renderWaterQualityChart('dashboard-water-chart', window.appState.getWaterLogs());
            this.renderFinancialChart('dashboard-financial-chart', window.appState.getHarvests());
        }
    }
}

window.chartManager = new ChartManager();
