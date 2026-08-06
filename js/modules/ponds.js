/**
 * AI AQUA FARM MANAGEMENT SYSTEM - POND MANAGEMENT MODULE
 * Full CRUD operations for Ponds.
 */

window.pondsModule = {
    init() {
        this.renderTable();
        this.bindEvents();
    },

    bindEvents() {
        const addBtn = document.getElementById('btn-add-pond');
        if (addBtn) {
            addBtn.onclick = () => this.openPondModal();
        }

        const form = document.getElementById('pond-form');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                this.savePond();
            };
        }

        const searchInput = document.getElementById('pond-search');
        if (searchInput) {
            searchInput.oninput = (e) => this.renderTable(e.target.value);
        }
    },

    renderTable(filterText = '') {
        const container = document.getElementById('ponds-table-body');
        if (!container) return;

        let ponds = window.appState.getPonds();

        if (filterText) {
            const term = filterText.toLowerCase();
            ponds = ponds.filter(p => p.name.toLowerCase().includes(term) || p.species.toLowerCase().includes(term));
        }

        if (ponds.length === 0) {
            container.innerHTML = `<tr><td colspan="7" class="empty-state"><i class="ri-water-flash-line"></i><br>No Ponds Found</td></tr>`;
            return;
        }

        const isAdmin = window.authService ? window.authService.isAdmin() : true;

        container.innerHTML = ponds.map(p => {
            let statusBadge = 'badge-success';
            if (p.status === 'Harvesting') statusBadge = 'badge-warning';
            if (p.status === 'Maintenance') statusBadge = 'badge-info';
            if (p.status === 'Fallow') statusBadge = 'badge-secondary';

            return `
                <tr>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.area} m²</td>
                    <td>${p.depth} m</td>
                    <td>${(p.capacity / 1000).toLocaleString()} m³ (${p.capacity.toLocaleString()} L)</td>
                    <td><span class="badge badge-info">${p.species}</span></td>
                    <td><span class="badge ${statusBadge}">${p.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="pondsModule.editPond('${p.id}')"><i class="ri-edit-line"></i></button>
                        ${isAdmin ? `<button class="btn btn-sm btn-danger" onclick="pondsModule.deletePond('${p.id}')"><i class="ri-delete-bin-line"></i></button>` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    },

    openPondModal(pond = null) {
        document.getElementById('pond-id').value = pond ? pond.id : '';
        document.getElementById('pond-name').value = pond ? pond.name : '';
        document.getElementById('pond-area').value = pond ? pond.area : '';
        document.getElementById('pond-depth').value = pond ? pond.depth : '2.0';
        document.getElementById('pond-capacity').value = pond ? pond.capacity : '';
        document.getElementById('pond-species').value = pond ? pond.species : 'Nile Tilapia';
        document.getElementById('pond-status').value = pond ? pond.status : 'Active';
        document.getElementById('pond-notes').value = pond ? (pond.notes || '') : '';

        document.getElementById('pond-modal-title').textContent = pond ? 'Edit Pond Details' : 'Add New Aqua Pond';
        window.uiManager.openModal('pond-modal');
    },

    autoCalcCapacity() {
        const area = parseFloat(document.getElementById('pond-area').value) || 0;
        const depth = parseFloat(document.getElementById('pond-depth').value) || 0;
        if (area && depth) {
            const liters = area * depth * 1000;
            document.getElementById('pond-capacity').value = liters;
        }
    },

    savePond() {
        const id = document.getElementById('pond-id').value;
        const name = document.getElementById('pond-name').value.trim();
        const area = parseFloat(document.getElementById('pond-area').value) || 0;
        const depth = parseFloat(document.getElementById('pond-depth').value) || 0;
        let capacity = parseFloat(document.getElementById('pond-capacity').value) || 0;
        const species = document.getElementById('pond-species').value;
        const status = document.getElementById('pond-status').value;
        const notes = document.getElementById('pond-notes').value.trim();

        if (!name || area <= 0) {
            window.uiManager.showToast('Please provide valid Pond Name and Surface Area', 'warning');
            return;
        }

        if (!capacity) {
            capacity = area * depth * 1000;
        }

        const pondData = { id, name, area, depth, capacity, species, status, notes };
        window.appState.savePond(pondData);
        window.uiManager.closeModal('pond-modal');
        window.uiManager.showToast(`Pond ${name} saved successfully!`, 'success');

        this.renderTable();
        if (window.dashboardModule) window.dashboardModule.init();
    },

    editPond(id) {
        const ponds = window.appState.getPonds();
        const pond = ponds.find(p => p.id === id);
        if (pond) {
            this.openPondModal(pond);
        }
    },

    deletePond(id) {
        if (confirm('Are you sure you want to delete this pond? All linked stock and logs will remain.')) {
            window.appState.deletePond(id);
            window.uiManager.showToast('Pond removed successfully', 'info');
            this.renderTable();
            if (window.dashboardModule) window.dashboardModule.init();
        }
    }
};
