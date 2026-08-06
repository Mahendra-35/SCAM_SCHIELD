/**
 * AI AQUA FARM MANAGEMENT SYSTEM - RULE-BASED AI ENGINE
 * Analyzes water parameters, fish health parameters, and yields rule-based actionable recommendations.
 */

class AquacultureAIEngine {
    constructor() {
        // Optimal Water Parameter Thresholds
        this.thresholds = {
            ph: { min: 6.5, max: 8.5, idealMin: 7.0, idealMax: 8.0 },
            temp: { min: 22.0, max: 32.0, idealMin: 26.0, idealMax: 30.0 },
            dissolvedOxygen: { min: 5.0, warning: 4.0, critical: 3.0 }, // mg/L
            ammonia: { maxWarning: 0.05, maxCritical: 0.10 }, // mg/L NH3
            salinity: { freshwaterMax: 5.0, brackishMax: 25.0 }, // ppt
            nitrite: { maxWarning: 0.1, maxCritical: 0.5 }
        };
    }

    /**
     * Analyze a single water quality log entry
     * @param {Object} log - { ph, temp, dissolvedOxygen, salinity, ammonia, nitrite }
     * @returns {Array} List of diagnostic recommendation objects
     */
    analyzeWaterQuality(log) {
        const recommendations = [];

        if (!log) return recommendations;

        const ph = parseFloat(log.ph);
        const temp = parseFloat(log.temp);
        const doVal = parseFloat(log.dissolvedOxygen);
        const ammonia = parseFloat(log.ammonia);
        const nitrite = parseFloat(log.nitrite || 0);

        // 1. Dissolved Oxygen Diagnosis
        if (doVal < this.thresholds.dissolvedOxygen.critical) {
            recommendations.push({
                severity: 'critical',
                parameter: 'Dissolved Oxygen',
                value: `${doVal} mg/L`,
                title: 'CRITICAL LOW OXYGEN EMERGENCY',
                action: 'Turn on all paddlewheel aerators & emergency oxygen diffusers immediately. Suspend feeding for 24 hours until DO rises above 5.0 mg/L.'
            });
        } else if (doVal < this.thresholds.dissolvedOxygen.min) {
            recommendations.push({
                severity: 'warning',
                parameter: 'Dissolved Oxygen',
                value: `${doVal} mg/L`,
                title: 'Sub-Optimal Oxygen Level',
                action: 'Increase mechanical aeration during late night and early morning hours. Reduce feeding ration by 30%.'
            });
        }

        // 2. Ammonia Diagnosis
        if (ammonia > this.thresholds.ammonia.maxCritical) {
            recommendations.push({
                severity: 'critical',
                parameter: 'Total Ammonia Nitrogen',
                value: `${ammonia} mg/L`,
                title: 'HAZARDOUS AMMONIA SPIKE',
                action: 'Execute 30% partial water replacement with clean fresh water immediately. Apply bio-probiotics (Nitrosomonas/Nitrobacter) and stop feeding.'
            });
        } else if (ammonia > this.thresholds.ammonia.maxWarning) {
            recommendations.push({
                severity: 'warning',
                parameter: 'Ammonia',
                value: `${ammonia} mg/L`,
                title: 'Elevated Ammonia Level',
                action: 'Schedule 15-20% water exchange. Reduce daily feed by 25% and verify pond bottom sludge accumulation.'
            });
        }

        // 3. pH Level Diagnosis
        if (ph < this.thresholds.ph.min) {
            recommendations.push({
                severity: 'warning',
                parameter: 'pH Level',
                value: `${ph}`,
                title: 'Acidic Water Condition (Low pH)',
                action: 'Apply agricultural lime (CaCO3 or Ca(OH)2) at 20-30 kg per 1000m³ to buffer alkalinity and raise pH.'
            });
        } else if (ph > this.thresholds.ph.max) {
            recommendations.push({
                severity: 'warning',
                parameter: 'pH Level',
                value: `${ph}`,
                title: 'Alkaline Water Spike (High pH)',
                action: 'Perform partial water renewal, add organic citric/acetic acid buffer, or introduce molasses/sugar source to promote beneficial bacteria.'
            });
        }

        // 4. Temperature Stress
        if (temp > this.thresholds.temp.max) {
            recommendations.push({
                severity: 'warning',
                parameter: 'Water Temperature',
                value: `${temp} °C`,
                title: 'High Thermal Stress',
                action: 'Increase pond water depth to provide cooler thermal bottom refuge. Shift feeding to early morning.'
            });
        } else if (temp < this.thresholds.temp.min) {
            recommendations.push({
                severity: 'info',
                parameter: 'Water Temperature',
                value: `${temp} °C`,
                title: 'Low Water Temperature',
                action: 'Fish metabolic digestion is slowed down. Decrease feeding ration by 40% to prevent unconsumed feed waste.'
            });
        }

        // 5. Nitrite Toxicity Check
        if (nitrite > this.thresholds.nitrite.maxCritical) {
            recommendations.push({
                severity: 'critical',
                parameter: 'Nitrite (NO2-)',
                value: `${nitrite} mg/L`,
                title: 'Brown Blood Nitrite Toxicity',
                action: 'Add non-iodized sodium chloride (salt) to maintain a Chloride to Nitrite ratio of at least 6:1.'
            });
        }

        return recommendations;
    }

    /**
     * Compute Farm Health Index (0 - 100 Score)
     */
    calculateFarmHealthScore(waterLogs) {
        if (!waterLogs || waterLogs.length === 0) return 92;

        const latest = waterLogs[0]; // Assuming sorted newest first
        let score = 100;

        const doVal = parseFloat(latest.dissolvedOxygen);
        const ammonia = parseFloat(latest.ammonia);
        const ph = parseFloat(latest.ph);

        if (doVal < 4.0) score -= 25;
        else if (doVal < 5.0) score -= 10;

        if (ammonia > 0.08) score -= 30;
        else if (ammonia > 0.04) score -= 15;

        if (ph < 6.5 || ph > 8.5) score -= 20;

        return Math.max(score, 10);
    }
}

window.aiEngine = new AquacultureAIEngine();
