/**
 * Chart.js Integration for ScamShield User & Admin Dashboards
 */

function initUserDashboardCharts(low, mod, high) {
    const ctx = document.getElementById('userRiskChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Low Risk', 'Moderate Risk', 'High Risk'],
            datasets: [{
                data: [low, mod, high],
                backgroundColor: ['#06d6a0', '#ffd166', '#ef476f'],
                borderColor: '#1c2541',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#a0aab8', font: { family: 'Inter', size: 12 } }
                }
            },
            cutout: '65%'
        }
    });
}

function initAdminDashboardCharts(riskData, topIndicators) {
    const ctxRisk = document.getElementById('adminRiskPieChart');
    if (ctxRisk) {
        new Chart(ctxRisk, {
            type: 'pie',
            data: {
                labels: ['Low Risk', 'Moderate Risk', 'High Risk'],
                datasets: [{
                    data: [riskData.low, riskData.moderate, riskData.high],
                    backgroundColor: ['#06d6a0', '#ffd166', '#ef476f'],
                    borderColor: '#1c2541',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#a0aab8' }
                    }
                }
            }
        });
    }

    const ctxBar = document.getElementById('adminTopIndicatorsChart');
    if (ctxBar && topIndicators) {
        const labels = topIndicators.map(i => i.name);
        const counts = topIndicators.map(i => i.count);

        new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Detection Frequency',
                    data: counts,
                    backgroundColor: '#00b4d8',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        ticks: { color: '#a0aab8' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    y: {
                        ticks: { color: '#a0aab8' },
                        grid: { display: false }
                    }
                }
            }
        });
    }
}
