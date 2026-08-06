/**
 * AI AQUA FARM MANAGEMENT SYSTEM - CENTRAL STATE & DATA STORE
 * Handles persistent state, seed initial data for offline preview, and CRUD abstractions.
 */

const STORAGE_KEYS = {
    PONDS: 'aqua_ponds_v1',
    STOCK: 'aqua_stock_v1',
    WATER: 'aqua_water_v1',
    FEED: 'aqua_feed_v1',
    DISEASES: 'aqua_diseases_v1',
    HARVESTS: 'aqua_harvests_v1',
    NOTIFICATIONS: 'aqua_notifications_v1',
    USER: 'aqua_user_v1',
    THEME: 'aqua_theme_v1'
};

// Initial Seed Data for Instant Demonstration
const SEED_DATA = {
    ponds: [
        { id: 'pond_1', name: 'Alpha Bio-Pond 01', area: 1200, depth: 2.2, capacity: 2640000, species: 'Nile Tilapia', status: 'Active', notes: 'High density aerated pond' },
        { id: 'pond_2', name: 'Beta Growout 02', area: 850, depth: 1.8, capacity: 1530000, species: 'Pangasius Catfish', status: 'Active', notes: 'Automated feeder installed' },
        { id: 'pond_3', name: 'Nursery Tank 03', area: 300, depth: 1.5, capacity: 450000, species: 'Whiteleg Shrimp', status: 'Active', notes: 'Fingerling stage' },
        { id: 'pond_4', name: 'Gamma Harvest Pond 04', area: 1500, depth: 2.5, capacity: 3750000, species: 'Asian Seabass', status: 'Harvesting', notes: 'Partial harvest in progress' }
    ],
    stock: [
        { id: 'stock_1', pondId: 'pond_1', species: 'Nile Tilapia', quantity: 15000, stockingDate: '2026-03-15', avgWeightGrams: 280, batchNo: 'BATCH-2026-01' },
        { id: 'stock_2', pondId: 'pond_2', species: 'Pangasius Catfish', quantity: 12000, stockingDate: '2026-04-01', avgWeightGrams: 420, batchNo: 'BATCH-2026-02' },
        { id: 'stock_3', pondId: 'pond_3', species: 'Whiteleg Shrimp', quantity: 45000, stockingDate: '2026-05-10', avgWeightGrams: 18, batchNo: 'BATCH-2026-03' },
        { id: 'stock_4', pondId: 'pond_4', species: 'Asian Seabass', quantity: 8000, stockingDate: '2026-02-20', avgWeightGrams: 650, batchNo: 'BATCH-2026-04' }
    ],
    waterLogs: [
        { id: 'w_1', pondId: 'pond_1', timestamp: '2026-08-06 08:30', ph: 7.4, temp: 28.5, dissolvedOxygen: 6.2, salinity: 0.5, ammonia: 0.02, nitrite: 0.01, remarks: 'Optimal parameters recorded' },
        { id: 'w_2', pondId: 'pond_1', timestamp: '2026-08-05 17:00', ph: 7.6, temp: 29.1, dissolvedOxygen: 4.2, salinity: 0.5, ammonia: 0.08, nitrite: 0.04, remarks: 'Low DO detected in evening' },
        { id: 'w_3', pondId: 'pond_2', timestamp: '2026-08-06 09:00', ph: 8.8, temp: 31.0, dissolvedOxygen: 5.5, salinity: 1.0, ammonia: 0.04, nitrite: 0.02, remarks: 'Slight elevated pH' },
        { id: 'w_4', pondId: 'pond_3', timestamp: '2026-08-06 07:45', ph: 7.2, temp: 27.8, dissolvedOxygen: 6.8, salinity: 18.0, ammonia: 0.01, nitrite: 0.00, remarks: 'Brackish water stable' }
    ],
    feedLogs: [
        { id: 'f_1', pondId: 'pond_1', date: '2026-08-06', feedBrand: 'AquaGrow Premium 32%', quantityKg: 126, feedRatePercent: 3.0, notes: 'Morning & Evening split' },
        { id: 'f_2', pondId: 'pond_2', date: '2026-08-06', feedBrand: 'PangaMax Pellets', quantityKg: 151, feedRatePercent: 3.0, notes: 'Standard feed ration' }
    ],
    diseases: [
        { id: 'd_1', pondId: 'pond_2', diseaseName: 'Streptococcosis', symptoms: 'Lethargy, erratic swimming, cloudy eyes', treatment: 'Medicated feed with Oxytetracycline for 7 days', status: 'Active', dateObserved: '2026-08-02', imageUrl: '' },
        { id: 'd_2', pondId: 'pond_1', diseaseName: 'White Spot Syndrome', symptoms: 'White spots on carapace, reduced feeding', treatment: 'Probiotic boost and water exchange', status: 'Resolved', dateObserved: '2026-07-15', imageUrl: '' }
    ],
    harvests: [
        { id: 'h_1', pondId: 'pond_4', harvestDate: '2026-08-01', weightKg: 2500, pricePerKg: 6.50, grossRevenue: 16250, expenses: 7800, netProfit: 8450, buyerName: 'OceanFresh Traders Ltd' },
        { id: 'h_2', pondId: 'pond_1', harvestDate: '2026-06-20', weightKg: 1800, pricePerKg: 4.80, grossRevenue: 8640, expenses: 4200, netProfit: 4440, buyerName: 'AquaGlobal Logistics' }
    ],
    notifications: [
        { id: 'n_1', title: 'Low Oxygen Warning', message: 'Alpha Bio-Pond 01 recorded Dissolved Oxygen at 4.2 mg/L. Increase aeration!', type: 'danger', date: '2026-08-05 17:05', read: false },
        { id: 'n_2', title: 'Ammonia Threshold Alert', message: 'Ammonia level is 0.08 mg/L in Pond 1. Partial water replacement advised.', type: 'warning', date: '2026-08-05 17:10', read: false },
        { id: 'n_3', title: 'Harvest Milestone', message: 'Gamma Harvest Pond 04 generated $8,450 net profit.', type: 'success', date: '2026-08-01 14:00', read: true }
    ]
};

class AppState {
    constructor() {
        this.initLocalStore();
    }

    initLocalStore() {
        if (!localStorage.getItem(STORAGE_KEYS.PONDS)) {
            localStorage.setItem(STORAGE_KEYS.PONDS, JSON.stringify(SEED_DATA.ponds));
        }
        if (!localStorage.getItem(STORAGE_KEYS.STOCK)) {
            localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(SEED_DATA.stock));
        }
        if (!localStorage.getItem(STORAGE_KEYS.WATER)) {
            localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(SEED_DATA.waterLogs));
        }
        if (!localStorage.getItem(STORAGE_KEYS.FEED)) {
            localStorage.setItem(STORAGE_KEYS.FEED, JSON.stringify(SEED_DATA.feedLogs));
        }
        if (!localStorage.getItem(STORAGE_KEYS.DISEASES)) {
            localStorage.setItem(STORAGE_KEYS.DISEASES, JSON.stringify(SEED_DATA.diseases));
        }
        if (!localStorage.getItem(STORAGE_KEYS.HARVESTS)) {
            localStorage.setItem(STORAGE_KEYS.HARVESTS, JSON.stringify(SEED_DATA.harvests));
        }
        if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
            localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_DATA.notifications));
        }
    }

    // Generic Local CRUD Wrappers
    getCollection(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch (e) {
            console.error('Error reading collection:', key, e);
            return [];
        }
    }

    saveCollection(key, items) {
        localStorage.setItem(key, JSON.stringify(items));
    }

    addItem(key, item) {
        const items = this.getCollection(key);
        if (!item.id) item.id = 'item_' + Date.now();
        items.unshift(item);
        this.saveCollection(key, items);

        // Sync to Firebase Firestore if connected
        if (window.fbFirestore) {
            const collectionName = key.replace('aqua_', '').replace('_v1', '');
            window.fbFirestore.collection(collectionName).doc(item.id).set(item)
                .then(() => console.log(`[Firestore Sync] Item added to ${collectionName}:`, item.id))
                .catch(err => console.warn(`[Firestore Sync Warning]`, err.message));
        }

        return item;
    }

    updateItem(key, id, updatedData) {
        const items = this.getCollection(key);
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updatedData };
            this.saveCollection(key, items);

            // Sync to Firebase Firestore if connected
            if (window.fbFirestore) {
                const collectionName = key.replace('aqua_', '').replace('_v1', '');
                window.fbFirestore.collection(collectionName).doc(id).set(items[index], { merge: true })
                    .then(() => console.log(`[Firestore Sync] Item updated in ${collectionName}:`, id))
                    .catch(err => console.warn(`[Firestore Sync Warning]`, err.message));
            }

            return items[index];
        }
        return null;
    }

    deleteItem(key, id) {
        let items = this.getCollection(key);
        items = items.filter(i => i.id !== id);
        this.saveCollection(key, items);

        // Sync deletion to Firebase Firestore if connected
        if (window.fbFirestore) {
            const collectionName = key.replace('aqua_', '').replace('_v1', '');
            window.fbFirestore.collection(collectionName).doc(id).delete()
                .then(() => console.log(`[Firestore Sync] Item deleted from ${collectionName}:`, id))
                .catch(err => console.warn(`[Firestore Sync Warning]`, err.message));
        }
    }

    // Entity Specific Helpers
    getPonds() { return this.getCollection(STORAGE_KEYS.PONDS); }
    savePond(pond) { return pond.id ? this.updateItem(STORAGE_KEYS.PONDS, pond.id, pond) : this.addItem(STORAGE_KEYS.PONDS, pond); }
    deletePond(id) { this.deleteItem(STORAGE_KEYS.PONDS, id); }

    getStock() { return this.getCollection(STORAGE_KEYS.STOCK); }
    saveStock(stockItem) { return stockItem.id ? this.updateItem(STORAGE_KEYS.STOCK, stockItem.id, stockItem) : this.addItem(STORAGE_KEYS.STOCK, stockItem); }
    deleteStock(id) { this.deleteItem(STORAGE_KEYS.STOCK, id); }

    getWaterLogs() { return this.getCollection(STORAGE_KEYS.WATER); }
    saveWaterLog(log) { return log.id ? this.updateItem(STORAGE_KEYS.WATER, log.id, log) : this.addItem(STORAGE_KEYS.WATER, log); }
    deleteWaterLog(id) { this.deleteItem(STORAGE_KEYS.WATER, id); }

    getFeedLogs() { return this.getCollection(STORAGE_KEYS.FEED); }
    saveFeedLog(log) { return log.id ? this.updateItem(STORAGE_KEYS.FEED, log.id, log) : this.addItem(STORAGE_KEYS.FEED, log); }
    deleteFeedLog(id) { this.deleteItem(STORAGE_KEYS.FEED, id); }

    getDiseases() { return this.getCollection(STORAGE_KEYS.DISEASES); }
    saveDisease(disease) { return disease.id ? this.updateItem(STORAGE_KEYS.DISEASES, disease.id, disease) : this.addItem(STORAGE_KEYS.DISEASES, disease); }
    deleteDisease(id) { this.deleteItem(STORAGE_KEYS.DISEASES, id); }

    getHarvests() { return this.getCollection(STORAGE_KEYS.HARVESTS); }
    saveHarvest(harvest) { return harvest.id ? this.updateItem(STORAGE_KEYS.HARVESTS, harvest.id, harvest) : this.addItem(STORAGE_KEYS.HARVESTS, harvest); }
    deleteHarvest(id) { this.deleteItem(STORAGE_KEYS.HARVESTS, id); }

    getNotifications() { return this.getCollection(STORAGE_KEYS.NOTIFICATIONS); }
    addNotification(notif) { return this.addItem(STORAGE_KEYS.NOTIFICATIONS, notif); }
    markNotificationAsRead(id) {
        const notifs = this.getNotifications();
        const n = notifs.find(x => x.id === id);
        if (n) { n.read = true; this.saveCollection(STORAGE_KEYS.NOTIFICATIONS, notifs); }
    }
}

window.appState = new AppState();
