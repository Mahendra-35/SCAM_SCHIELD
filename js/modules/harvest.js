/**
 * AI AQUA FARM MANAGEMENT SYSTEM - HARVEST MANAGEMENT & FINANCIALS MODULE
 */

window.harvestModule = {
    init() {
        this.renderTable();
        this.bindEvents();
    },

    bindEvents() {
        const addBtn = document.getElementById('btn-add-harvest');
        if (addBtn) {
            addBtn.onclick = () => this.openHarvestModal();
        }

        const form = document.getElementById('harvest-form');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                this.saveHarvest();
            };
        }

        // Live revenue & profit calculation in modal
        const weightInp = document.getElementById('harvest-weight');
        const priceInp = document.getElementById('harvest-price');
        const expInp = document.getElementById('harvest-expenses');

        [weightInp, priceInp, expInp].forEach(inp => {
            if (inp) inp.oninput = () => this.autoCalcFinancials();
        });

        const searchInput = document.getElementById('harvest-search');
        if (searchInput) {
            searchInput.oninput = (e) => this.renderTable(e.target.value);
        }
    },

    autoCalcFinancials() {
        const weight = parseFloat(document.getElementById('harvest-weight').value) || 0;
        const price = parseFloat(document.getElementById('harvest-price').value) || 0;
        const exp = parseFloat(document.getElementById('harvest-expenses').value) || 0;

        const gross = weight * price;
        const profit = gross - exp;

        document.getElementById('harvest-revenue').value = gross.toFixed(2);
        document.getElementById('harvest-profit').value = profit.toFixed(2);
    },

    renderTable(filterText = '') {
        const container = document.getElementById('harvest-table-body');
        if (!container) return;

        let list = window.appState.getHarvests();
        const ponds = window.appState.getPonds();

        if (filterText) {
            const term = filterText.toLowerCase();
            list = list.filter(h => (h.buyerName && h.buyerName.toLowerCase().includes(term)) || h.harvestDate.includes(term));
        }

        if (list.length === 0) {
            container.innerHTML = `<tr><td colspan="8" class="empty-state"><i class="ri-shopping-basket-2-line"></i><br>No Harvest Records Found</td></tr>`;
            return;
        }

        const isAdmin = window.authService ? window.authService.isAdmin() : true;

        container.innerHTML = list.map(h => {
            const pond = ponds.find(p => p.id === h.pondId);
            const pondName = pond ? pond.name : 'Pond';

            const gross = parseFloat(h.grossRevenue) || 0;
            const profit = parseFloat(h.netProfit) || 0;

            return `
                <tr>
                    <td>${h.harvestDate}</td>
                    <td><strong>${pondName}</strong></td>
                    <td><strong>${parseFloat(h.weightKg).toLocaleString()} kg</strong></td>
                    <td>$${parseFloat(h.pricePerKg).toFixed(2)}</td>
                    <td>$${gross.toLocaleString()}</td>
                    <td>$${parseFloat(h.expenses).toLocaleString()}</td>
                    <td><strong style="color:var(--success);">$${profit.toLocaleString()}</strong></td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="harvestModule.editHarvest('${h.id}')"><i class="ri-edit-line"></i></button>
                        ${isAdmin ? `<button class="btn btn-sm btn-danger" onclick="harvestModule.deleteHarvest('${h.id}')"><i class="ri-delete-bin-line"></i></button>` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    },

    populatePondOptions() {
        const select = document.getElementById('harvest-pond-id');
        if (!select) return;
        const ponds = window.appState.getPonds();
        select.innerHTML = ponds.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    },

    openHarvestModal(harvest = null) {
        this.populatePondOptions();

        document.getElementById('harvest-id').value = harvest ? harvest.id : '';
        if (harvest) document.getElementById('harvest-pond-id').value = harvest.pondId;
        document.getElementById('harvest-date').value = harvest ? harvest.harvestDate : new Date().toISOString().split('T')[0];
        document.getElementById('harvest-weight').value = harvest ? harvest.weightKg : '1000';
        document.getElementById('harvest-price').value = harvest ? harvest.pricePerKg : '5.50';
        document.getElementById('harvest-expenses').value = harvest ? harvest.expenses : '1500';
        document.getElementById('harvest-buyer').value = harvest ? (harvest.buyerName || '') : 'Local Aqua Distributor';

        this.autoCalcFinancials();

        document.getElementById('harvest-modal-title').textContent = harvest ? 'Edit Harvest Record' : 'Record New Fish Harvest';
        window.uiManager.openModal('harvest-modal');
    },

    saveHarvest() {
        const id = document.getElementById('harvest-id').value;
        const pondId = document.getElementById('harvest-pond-id').value;
        const harvestDate = document.getElementById('harvest-date').value;
        const weightKg = parseFloat(document.getElementById('harvest-weight').value) || 0;
        const pricePerKg = parseFloat(document.getElementById('harvest-price').value) || 0;
        const grossRevenue = parseFloat(document.getElementById('harvest-revenue').value) || 0;
        const expenses = parseFloat(document.getElementById('harvest-expenses').value) || 0;
        const netProfit = parseFloat(document.getElementById('harvest-profit').value) || 0;
        const buyerName = document.getElementById('harvest-buyer').value.trim();

        if (weightKg <= 0 || pricePerKg <= 0) {
            window.uiManager.showToast('Please specify valid weight and selling price', 'warning');
            return;
        }

        const data = { id, pondId, harvestDate, weightKg, pricePerKg, grossRevenue, expenses, netProfit, buyerName };
        window.appState.saveHarvest(data);
        window.uiManager.closeModal('harvest-modal');
        window.uiManager.showToast('Harvest record logged successfully', 'success');

        this.renderTable();
        if (window.dashboardModule) window.dashboardModule.init();
    },

    editHarvest(id) {
        const list = window.appState.getHarvests();
        const item = list.find(h => h.id === id);
        if (item) this.openHarvestModal(item);
    },

    deleteHarvest(id) {
        if (confirm('Delete harvest entry?')) {
            window.appState.deleteHarvest(id);
            window.uiManager.showToast('Harvest entry removed', 'info');
            this.renderTable();
            if (window.dashboardModule) window.dashboardModule.init();
        }
    }
};
