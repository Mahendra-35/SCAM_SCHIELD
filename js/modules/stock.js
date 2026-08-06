/**
 * AI AQUA FARM MANAGEMENT SYSTEM - FISH STOCK MANAGEMENT MODULE
 * Full CRUD operations for Fish Stock and Biomass Tracking.
 */

window.stockModule = {
    init() {
        this.renderTable();
        this.bindEvents();
    },

    bindEvents() {
        const addBtn = document.getElementById('btn-add-stock');
        if (addBtn) {
            addBtn.onclick = () => this.openStockModal();
        }

        const form = document.getElementById('stock-form');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                this.saveStock();
            };
        }

        const searchInput = document.getElementById('stock-search');
        if (searchInput) {
            searchInput.oninput = (e) => this.renderTable(e.target.value);
        }
    },

    renderTable(filterText = '') {
        const container = document.getElementById('stock-table-body');
        if (!container) return;

        let stocks = window.appState.getStock();
        const ponds = window.appState.getPonds();

        if (filterText) {
            const term = filterText.toLowerCase();
            stocks = stocks.filter(s => s.species.toLowerCase().includes(term) || (s.batchNo && s.batchNo.toLowerCase().includes(term)));
        }

        if (stocks.length === 0) {
            container.innerHTML = `<tr><td colspan="7" class="empty-state"><i class="ri-pulse-line"></i><br>No Fish Stock Records Found</td></tr>`;
            return;
        }

        const isAdmin = window.authService ? window.authService.isAdmin() : true;

        container.innerHTML = stocks.map(s => {
            const pond = ponds.find(p => p.id === s.pondId);
            const pondName = pond ? pond.name : 'Unassigned';
            const qty = parseInt(s.quantity) || 0;
            const avgGrams = parseFloat(s.avgWeightGrams) || 0;
            const biomassKg = Math.round((qty * avgGrams) / 1000);

            return `
                <tr>
                    <td><strong>${pondName}</strong></td>
                    <td><span class="badge badge-info">${s.species}</span></td>
                    <td>${qty.toLocaleString()}</td>
                    <td>${avgGrams} g</td>
                    <td><strong>${biomassKg.toLocaleString()} kg</strong></td>
                    <td>${s.stockingDate}</td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="stockModule.editStock('${s.id}')"><i class="ri-edit-line"></i></button>
                        ${isAdmin ? `<button class="btn btn-sm btn-danger" onclick="stockModule.deleteStock('${s.id}')"><i class="ri-delete-bin-line"></i></button>` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    },

    populatePondOptions() {
        const select = document.getElementById('stock-pond-id');
        if (!select) return;
        const ponds = window.appState.getPonds();
        select.innerHTML = ponds.map(p => `<option value="${p.id}">${p.name} (${p.species})</option>`).join('');
    },

    openStockModal(stock = null) {
        this.populatePondOptions();

        document.getElementById('stock-id').value = stock ? stock.id : '';
        if (stock) document.getElementById('stock-pond-id').value = stock.pondId;
        document.getElementById('stock-species').value = stock ? stock.species : 'Nile Tilapia';
        document.getElementById('stock-quantity').value = stock ? stock.quantity : '10000';
        document.getElementById('stock-avg-weight').value = stock ? stock.avgWeightGrams : '150';
        document.getElementById('stock-date').value = stock ? stock.stockingDate : new Date().toISOString().split('T')[0];
        document.getElementById('stock-batch').value = stock ? (stock.batchNo || '') : `BATCH-${new Date().getFullYear()}-0${Math.floor(Math.random() * 9 + 1)}`;

        document.getElementById('stock-modal-title').textContent = stock ? 'Edit Stock Batch' : 'Add New Fish Stock Batch';
        window.uiManager.openModal('stock-modal');
    },

    saveStock() {
        const id = document.getElementById('stock-id').value;
        const pondId = document.getElementById('stock-pond-id').value;
        const species = document.getElementById('stock-species').value;
        const quantity = parseInt(document.getElementById('stock-quantity').value) || 0;
        const avgWeightGrams = parseFloat(document.getElementById('stock-avg-weight').value) || 0;
        const stockingDate = document.getElementById('stock-date').value;
        const batchNo = document.getElementById('stock-batch').value.trim();

        if (quantity <= 0 || avgWeightGrams <= 0) {
            window.uiManager.showToast('Please provide valid stock quantity and average weight', 'warning');
            return;
        }

        const stockData = { id, pondId, species, quantity, avgWeightGrams, stockingDate, batchNo };
        window.appState.saveStock(stockData);
        window.uiManager.closeModal('stock-modal');
        window.uiManager.showToast('Fish stock record updated successfully', 'success');

        this.renderTable();
        if (window.dashboardModule) window.dashboardModule.init();
    },

    editStock(id) {
        const stockList = window.appState.getStock();
        const item = stockList.find(s => s.id === id);
        if (item) this.openStockModal(item);
    },

    deleteStock(id) {
        if (confirm('Are you sure you want to delete this stock entry?')) {
            window.appState.deleteStock(id);
            window.uiManager.showToast('Stock batch removed', 'info');
            this.renderTable();
            if (window.dashboardModule) window.dashboardModule.init();
        }
    }
};
