// Configuration
// Change this to your deployed API URL (e.g., https://your-backend.onrender.com/api/data)
const API_BASE_URL = 'http://localhost:3000/api/data';
const REFRESH_INTERVAL = 3000; // 3 seconds

// DOM Elements
const elements = {
    phValue: document.getElementById('phValue'),
    tdsValue: document.getElementById('tdsValue'),
    turbidityValue: document.getElementById('turbidityValue'),
    tempValue: document.getElementById('tempValue'),
    phBadge: document.getElementById('phBadge'),
    tdsBadge: document.getElementById('tdsBadge'),
    turbidityBadge: document.getElementById('turbidityBadge'),
    statusBanner: document.getElementById('statusBanner'),
    overallStatus: document.getElementById('overallStatus'),
    statusMessage: document.getElementById('statusMessage'),
    statusIcon: document.getElementById('statusIcon')
};

// Chart Instance
let historyChart = null;

// Classification Logic
function classifyPH(ph) {
    if (ph >= 6.5 && ph <= 8.5) return 'safe';
    if ((ph >= 6.0 && ph < 6.5) || (ph > 8.5 && ph <= 9.0)) return 'moderate';
    return 'unsafe';
}

function classifyTDS(tds) {
    if (tds < 500) return 'safe';
    if (tds >= 500 && tds <= 1000) return 'moderate';
    return 'unsafe';
}

function classifyTurbidity(turbidity) {
    if (turbidity < 5) return 'safe';
    if (turbidity >= 5 && turbidity <= 10) return 'moderate';
    return 'unsafe';
}

function updateBadge(element, status, text) {
    if(!element) return;
    element.className = `badge ${status}`;
    element.textContent = text || status.toUpperCase();
}

function updateOverallStatus(phStatus, tdsStatus, turbStatus) {
    const statuses = [phStatus, tdsStatus, turbStatus];
    
    if (statuses.includes('unsafe')) {
        elements.statusBanner.className = 'status-banner unsafe';
        elements.overallStatus.textContent = 'Critical Alert: Water Unsafe';
        elements.statusMessage.textContent = 'Immediate action required. Water parameters exceed safe limits.';
        elements.statusIcon.className = 'fa-solid fa-triangle-exclamation';
    } else if (statuses.includes('moderate')) {
        elements.statusBanner.className = 'status-banner moderate';
        elements.overallStatus.textContent = 'Warning: Monitor Water Quality';
        elements.statusMessage.textContent = 'Some parameters are outside ideal ranges but not critically unsafe yet.';
        elements.statusIcon.className = 'fa-solid fa-circle-exclamation';
    } else {
        elements.statusBanner.className = 'status-banner safe';
        elements.overallStatus.textContent = 'Water Quality is Safe';
        elements.statusMessage.textContent = 'All parameters are well within standard safety guidelines.';
        elements.statusIcon.className = 'fa-solid fa-shield-check';
    }
}

// Mock Data Generator for Standalone Demo (fallback for Presentation if Backend is disconnected)
let useMockData = false;
let mockTime = new Date();
function getMockData() {
    mockTime = new Date();
    return {
        pH: (7.0 + (Math.random() * 0.4 - 0.2)).toFixed(2),
        tds: Math.floor(300 + Math.random() * 40 - 20),
        turbidity: (2.0 + (Math.random() - 0.5)).toFixed(2),
        temperature: (25.0 + (Math.random() * 0.6 - 0.3)).toFixed(1),
        timestamp: mockTime.toISOString()
    };
}

let mockHistory = [];
for(let i=15; i>=0; i--) {
    let t = new Date();
    t.setSeconds(t.getSeconds() - (i * 3));
    mockHistory.push({
        pH: (7.0 + (Math.random() * 0.4 - 0.2)).toFixed(2),
        tds: Math.floor(300 + Math.random() * 40 - 20),
        turbidity: (2.0 + (Math.random() - 0.5)).toFixed(2),
        temperature: (25.0 + (Math.random() * 0.6 - 0.3)).toFixed(1),
        timestamp: t.toISOString()
    });
}


// Fetch Latest Data
async function fetchLatestData() {
    try {
        const response = await fetch(`${API_BASE_URL}/latest`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        if (data.message === 'No data available') throw new Error('Empty Database');
        
        useMockData = false;
        updateUI(data);
    } catch (error) {
        if (!useMockData) {
            console.warn('Backend unreachable or empty. Serving simulated real-world fallback IoT Data for demonstration...');
        }
        useMockData = true;
        const data = getMockData();
        updateUI(data);
    }
}

// Update DOM
function updateUI(data) {
    elements.phValue.textContent = data.pH;
    elements.tdsValue.textContent = data.tds;
    elements.turbidityValue.textContent = data.turbidity;
    elements.tempValue.textContent = data.temperature;

    const phStatus = classifyPH(parseFloat(data.pH));
    const tdsStatus = classifyTDS(parseFloat(data.tds));
    const turbStatus = classifyTurbidity(parseFloat(data.turbidity));

    updateBadge(elements.phBadge, phStatus);
    updateBadge(elements.tdsBadge, tdsStatus);
    updateBadge(elements.turbidityBadge, turbStatus);

    updateOverallStatus(phStatus, tdsStatus, turbStatus);
}

// Fetch and Update Chart History
async function fetchHistoryData() {
    let history = [];
    try {
        if (useMockData) {
            const latest = getMockData();
            mockHistory.push(latest);
            if (mockHistory.length > 20) mockHistory.shift();
            history = [...mockHistory];
        } else {
            const response = await fetch(`${API_BASE_URL}/history`);
            if (response.ok) {
                history = await response.json();
            }
        }
        
        if (history.length > 0) {
            updateChart(history);
        }
    } catch (error) {
        console.error("Failed to load history data.");
    }
}

// Chart Initialization
function initChart() {
    const ctx = document.getElementById('historyChart').getContext('2d');
    
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = 'Outfit';

    historyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'pH Level',
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    data: [],
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'TDS (ppm / 100)',
                    borderColor: '#10b981',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    data: [],
                    tension: 0.4,
                    yAxisID: 'y'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#f8fafc',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    min: 0,
                    max: 14
                }
            },
            interaction: { mode: 'nearest', axis: 'x', intersect: false }
        }
    });
}

function updateChart(historyData) {
    if (!historyChart) return;

    const labels = historyData.map(d => {
        const date = new Date(d.timestamp);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    });
    
    const phData = historyData.map(d => parseFloat(d.pH));
    // Scale down TDS for better visual comparison on the same chart scale
    const tdsData = historyData.map(d => parseFloat(d.tds) / 100);

    historyChart.data.labels = labels;
    historyChart.data.datasets[0].data = phData;
    historyChart.data.datasets[1].data = tdsData;
    historyChart.update('none'); // Update without full animation to prevent jitter during polling
}

// App Initialization
function init() {
    initChart();
    fetchLatestData();
    fetchHistoryData();
    
    // Poll every 3 seconds for real-time vibe
    setInterval(() => {
        fetchLatestData();
        fetchHistoryData();
    }, REFRESH_INTERVAL);
}

// Document Ready
document.addEventListener('DOMContentLoaded', init);
