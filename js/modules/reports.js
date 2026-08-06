/**
 * AI AQUA FARM MANAGEMENT SYSTEM - REPORTS & EXPORT MODULE
 */

window.reportsModule = {
    init() {
        this.renderSummary();
        this.bindEvents();
    },

    bindEvents() {
        const typeSelect = document.getElementById('report-type-select');
        if (typeSelect) {
            typeSelect.onchange = () => this.renderSummary();
        }

        const exportBtn = document.getElementById('btn-export-csv');
        if (exportBtn) {
            exportBtn.onclick = () => this.exportCSV();
        }

        const printBtn = document.getElementById('btn-print-report');
        if (printBtn) {
            printBtn.onclick = () => window.print();
        }
    },

    renderSummary() {
        const type = document.getElementById('report-type-select') ? document.getElementById('report-type-select').value : 'all';

        const ponds = window.appState.getPonds();
        const stock = window.appState.getStock();
        const water = window.appState.getWaterLogs();
        const harvests = window.appState.getHarvests();
        const feed = window.appState.getFeedLogs();

        let totalBiomass = 0;
        stock.forEach(s => totalBiomass += (parseInt(s.quantity || 0) * parseFloat(s.avgWeightGrams || 0)) / 1000);

        let totalRevenue = 0;
        let totalExpenses = 0;
        harvests.forEach(h => {
            totalRevenue += parseFloat(h.grossRevenue || 0);
            totalExpenses += parseFloat(h.expenses || 0);
        });

        const netProfit = totalRevenue - totalExpenses;

        const summaryContainer = document.getElementById('report-summary-cards');
        if (summaryContainer) {
            summaryContainer.innerHTML = `
                <div class="stat-card">
                    <div>
                        <div class="stat-label">Total Biomass Produced</div>
                        <div class="stat-value">${Math.round(totalBiomass).toLocaleString()} kg</div>
                    </div>
                    <div class="stat-icon"><i class="ri-scales-3-line"></i></div>
                </div>
                <div class="stat-card stat-success">
                    <div>
                        <div class="stat-label">Gross Revenue</div>
                        <div class="stat-value">$${totalRevenue.toLocaleString()}</div>
                    </div>
                    <div class="stat-icon"><i class="ri-money-dollar-circle-line"></i></div>
                </div>
                <div class="stat-card stat-info">
                    <div>
                        <div class="stat-label">Net Profit</div>
                        <div class="stat-value">$${netProfit.toLocaleString()}</div>
                    </div>
                    <div class="stat-icon"><i class="ri-funds-box-line"></i></div>
                </div>
            `;
        }

        const detailsContainer = document.getElementById('report-table-body');
        if (!detailsContainer) return;

        if (type === 'water') {
            detailsContainer.innerHTML = water.map(w => `
                <tr>
                    <td>Water Log</td>
                    <td>${w.timestamp}</td>
                    <td>pH: ${w.ph}, DO: ${w.dissolvedOxygen}mg/L, Temp: ${w.temp}°C</td>
                    <td>Ammonia: ${w.ammonia} mg/L</td>
                </tr>
            `).join('');
        } else if (type === 'harvest') {
            detailsContainer.innerHTML = harvests.map(h => `
                <tr>
                    <td>Harvest Record</td>
                    <td>${h.harvestDate}</td>
                    <td>${h.weightKg} kg @ $${h.pricePerKg}/kg</td>
                    <td>Net Profit: $${h.netProfit}</td>
                </tr>
            `).join('');
        } else {
            // Consolidated All Report
            detailsContainer.innerHTML = `
                <tr><td>Active Ponds</td><td>${ponds.length} Registered</td><td>Total Capacity: ${(ponds.reduce((a,b)=>a+b.capacity,0)/1000).toLocaleString()} m³</td><td>System Operational</td></tr>
                <tr><td>Fish Stock</td><td>${stock.length} Batches</td><td>Biomass: ${Math.round(totalBiomass).toLocaleString()} kg</td><td>Good Growth</td></tr>
                <tr><td>Water Logs</td><td>${water.length} Recorded</td><td>Avg DO: ${(water.reduce((a,b)=>a+parseFloat(b.dissolvedOxygen),0)/(water.length||1)).toFixed(1)} mg/L</td><td>Stable</td></tr>
                <tr><td>Financial Yield</td><td>${harvests.length} Sales</td><td>Revenue: $${totalRevenue.toLocaleString()}</td><td>Profit: $${netProfit.toLocaleString()}</td></tr>
            `;
        }
    },

    exportCSV() {
        const water = window.appState.getWaterLogs();
        if (water.length === 0) {
            window.uiManager.showToast('No water quality log data to export', 'warning');
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,ID,Timestamp,PondID,pH,Temperature_C,Dissolved_Oxygen_mgL,Salinity_ppt,Ammonia_mgL,Remarks\n";
        
        water.forEach(w => {
            csvContent += `"${w.id}","${w.timestamp}","${w.pondId}",${w.ph},${w.temp},${w.dissolvedOxygen},${w.salinity},${w.ammonia},"${w.remarks || ''}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `aqua_farm_water_quality_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.uiManager.showToast('CSV report generated and downloaded', 'success');
    }
};
