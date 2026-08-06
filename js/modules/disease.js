/**
 * AI AQUA FARM MANAGEMENT SYSTEM - DISEASE MANAGEMENT MODULE
 * CRUD operations for health observations, disease tracking, and treatment photos.
 */

window.diseaseModule = {
    init() {
        this.renderTable();
        this.bindEvents();
    },

    bindEvents() {
        const addBtn = document.getElementById('btn-add-disease');
        if (addBtn) {
            addBtn.onclick = () => this.openDiseaseModal();
        }

        const form = document.getElementById('disease-form');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                this.saveDisease();
            };
        }

        const searchInput = document.getElementById('disease-search');
        if (searchInput) {
            searchInput.oninput = (e) => this.renderTable(e.target.value);
        }

        // Image file preview listener
        const imageInput = document.getElementById('disease-image-file');
        if (imageInput) {
            imageInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                        document.getElementById('disease-image-preview').src = evt.target.result;
                        document.getElementById('disease-image-preview-container').style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            };
        }
    },

    renderTable(filterText = '') {
        const container = document.getElementById('disease-table-body');
        if (!container) return;

        let list = window.appState.getDiseases();
        const ponds = window.appState.getPonds();

        if (filterText) {
            const term = filterText.toLowerCase();
            list = list.filter(d => d.diseaseName.toLowerCase().includes(term) || d.symptoms.toLowerCase().includes(term));
        }

        if (list.length === 0) {
            container.innerHTML = `<tr><td colspan="7" class="empty-state"><i class="ri-health-book-line"></i><br>No Health / Disease Records Logged</td></tr>`;
            return;
        }

        const isAdmin = window.authService ? window.authService.isAdmin() : true;

        container.innerHTML = list.map(d => {
            const pond = ponds.find(p => p.id === d.pondId);
            const pondName = pond ? pond.name : 'Pond';

            let statusBadge = d.status === 'Resolved' ? 'badge-success' : 'badge-danger';
            let imgBtn = d.imageUrl ? `<button class="btn btn-sm btn-outline" onclick="diseaseModule.viewImage('${d.imageUrl}')"><i class="ri-image-line"></i> Photo</button>` : '';

            return `
                <tr>
                    <td>${d.dateObserved}</td>
                    <td><strong>${pondName}</strong></td>
                    <td><strong style="color:var(--danger);">${d.diseaseName}</strong></td>
                    <td>${d.symptoms}</td>
                    <td>${d.treatment}</td>
                    <td><span class="badge ${statusBadge}">${d.status}</span></td>
                    <td>
                        ${imgBtn}
                        <button class="btn btn-sm btn-outline" onclick="diseaseModule.editDisease('${d.id}')"><i class="ri-edit-line"></i></button>
                        ${isAdmin ? `<button class="btn btn-sm btn-danger" onclick="diseaseModule.deleteDisease('${d.id}')"><i class="ri-delete-bin-line"></i></button>` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    },

    populatePondOptions() {
        const select = document.getElementById('disease-pond-id');
        if (!select) return;
        const ponds = window.appState.getPonds();
        select.innerHTML = ponds.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    },

    openDiseaseModal(disease = null) {
        this.populatePondOptions();

        document.getElementById('disease-id').value = disease ? disease.id : '';
        if (disease) document.getElementById('disease-pond-id').value = disease.pondId;
        document.getElementById('disease-name').value = disease ? disease.diseaseName : '';
        document.getElementById('disease-symptoms').value = disease ? disease.symptoms : '';
        document.getElementById('disease-treatment').value = disease ? disease.treatment : '';
        document.getElementById('disease-status').value = disease ? disease.status : 'Active';
        document.getElementById('disease-date').value = disease ? disease.dateObserved : new Date().toISOString().split('T')[0];

        const previewContainer = document.getElementById('disease-image-preview-container');
        const previewImg = document.getElementById('disease-image-preview');
        if (disease && disease.imageUrl) {
            previewImg.src = disease.imageUrl;
            previewContainer.style.display = 'block';
        } else {
            previewContainer.style.display = 'none';
            previewImg.src = '';
        }

        document.getElementById('disease-modal-title').textContent = disease ? 'Edit Disease Record' : 'Report Fish Health Observation';
        window.uiManager.openModal('disease-modal');
    },

    saveDisease() {
        const id = document.getElementById('disease-id').value;
        const pondId = document.getElementById('disease-pond-id').value;
        const diseaseName = document.getElementById('disease-name').value.trim();
        const symptoms = document.getElementById('disease-symptoms').value.trim();
        const treatment = document.getElementById('disease-treatment').value.trim();
        const status = document.getElementById('disease-status').value;
        const dateObserved = document.getElementById('disease-date').value;
        const previewImg = document.getElementById('disease-image-preview');
        const imageUrl = previewImg ? previewImg.src : '';

        if (!diseaseName || !symptoms) {
            window.uiManager.showToast('Please provide Disease Name and Symptoms', 'warning');
            return;
        }

        const data = { id, pondId, diseaseName, symptoms, treatment, status, dateObserved, imageUrl };
        window.appState.saveDisease(data);
        window.uiManager.closeModal('disease-modal');
        window.uiManager.showToast('Disease record updated', 'success');

        this.renderTable();
        if (window.dashboardModule) window.dashboardModule.init();
    },

    viewImage(url) {
        if (!url) return;
        const imgModal = document.getElementById('image-viewer-modal');
        const img = document.getElementById('image-viewer-src');
        if (imgModal && img) {
            img.src = url;
            window.uiManager.openModal('image-viewer-modal');
        }
    },

    editDisease(id) {
        const list = window.appState.getDiseases();
        const item = list.find(d => d.id === id);
        if (item) this.openDiseaseModal(item);
    },

    deleteDisease(id) {
        if (confirm('Delete health record entry?')) {
            window.appState.deleteDisease(id);
            window.uiManager.showToast('Record deleted', 'info');
            this.renderTable();
            if (window.dashboardModule) window.dashboardModule.init();
        }
    }
};
