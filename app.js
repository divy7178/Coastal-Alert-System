// Application Data and State Management
const appData = {
  coastalLocations: [
    {
      id: "miami",
      name: "Miami Beach, FL",
      coordinates: [-80.1918, 25.7617],
      threatLevel: "WARNING",
      seaLevel: 2.3,
      windSpeed: 25,
      pollution: 68,
      stormProbability: 35
    },
    {
      id: "boston",
      name: "Boston Harbor, MA", 
      coordinates: [-71.0275, 42.3398],
      threatLevel: "SAFE",
      seaLevel: 1.2,
      windSpeed: 12,
      pollution: 42,
      stormProbability: 15
    },
    {
      id: "sanfrancisco",
      name: "San Francisco Bay, CA",
      coordinates: [-122.4194, 37.7749],
      threatLevel: "CRITICAL",
      seaLevel: 3.1,
      windSpeed: 45,
      pollution: 85,
      stormProbability: 78
    }
  ],
  tideData: [
    {time: "00:00", level: 1.2},
    {time: "03:00", level: 1.8},
    {time: "06:00", level: 2.1},
    {time: "09:00", level: 1.9},
    {time: "12:00", level: 1.5},
    {time: "15:00", level: 1.7},
    {time: "18:00", level: 2.3},
    {time: "21:00", level: 2.0}
  ],
  pollutionData: [
    {location: "Industrial Zone", level: 85},
    {location: "Beach Area", level: 42},
    {location: "Harbor", level: 68},
    {location: "Residential", level: 35}
  ],
  windData: [
    {time: "00:00", speed: 12},
    {time: "04:00", speed: 15},
    {time: "08:00", speed: 18},
    {time: "12:00", speed: 25},
    {time: "16:00", speed: 32},
    {time: "20:00", speed: 28}
  ],
  stormData: [
    {category: "Low Risk", probability: 45},
    {category: "Moderate Risk", probability: 30},
    {category: "High Risk", probability: 20},
    {category: "Critical Risk", probability: 5}
  ],
  alerts: [
    {
      id: "alert1",
      timestamp: "2025-08-30T17:30:00Z",
      severity: "CRITICAL",
      location: "San Francisco Bay",
      title: "Storm Surge Warning",
      description: "High winds and elevated sea levels detected. Coastal flooding expected.",
      acknowledged: false
    },
    {
      id: "alert2", 
      timestamp: "2025-08-30T15:15:00Z",
      severity: "WARNING",
      location: "Miami Beach",
      title: "Pollution Spike Detected",
      description: "Industrial runoff causing elevated pollution levels in coastal waters.",
      acknowledged: true
    },
    {
      id: "alert3",
      timestamp: "2025-08-30T12:45:00Z", 
      severity: "SAFE",
      location: "Boston Harbor",
      title: "Normal Conditions",
      description: "All monitoring systems show normal parameters.",
      acknowledged: true
    }
  ],
  weatherMetrics: {
    temperature: 24,
    humidity: 65,
    pressure: 1013,
    visibility: 8.5,
    uvIndex: 6
  },
  systemStatus: {
    overallStatus: "WARNING",
    lastUpdated: "2025-08-30T17:00:00Z",
    activeAlerts: 2,
    monitoredLocations: 12,
    systemUptime: "99.8%"
  }
};

// Application State
let currentUser = null;
let currentSection = 'overview';
let charts = {};
let updateInterval = null;
let notificationPermission = false;

// Global functions for HTML onclick handlers
window.showLandingPage = showLandingPage;
window.showLoginPage = showLoginPage;
window.showSignupPage = showSignupPage;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleGoogleLogin = handleGoogleLogin;
window.logout = logout;
window.switchToSection = switchToSection;
window.acknowledgeAlert = acknowledgeAlert;
window.createAlert = createAlert;
window.showNotification = showNotification;
window.hideNotification = hideNotification;
window.toggleNotifications = toggleNotifications;
window.toggleUserMenu = toggleUserMenu;
window.hideLocationDetails = hideLocationDetails;
window.showForgotPassword = showForgotPassword;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeApp();
    setupEventListeners();
    requestNotificationPermission();
    
    // Check for existing session
    const savedUser = localStorage.getItem('coastalUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showDashboard();
        } catch (e) {
            console.error('Error parsing saved user:', e);
            showLandingPage();
        }
    } else {
        showLandingPage();
    }
});

// App Initialization
function initializeApp() {
    console.log('Initializing app...');
    // Setup scroll animations observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Handle counter animations
                if (entry.target.classList.contains('animate-count-up')) {
                    animateCounter(entry.target);
                }
            }
        });
    }, { threshold: 0.1 });

    // Observe animated elements
    document.querySelectorAll('.animate-fade-in, .animate-slide-up, .animate-slide-in-left, .animate-slide-in-right, .animate-count-up').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        observer.observe(el);
    });
}

// Event Listeners Setup
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Navigation smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Dashboard navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            if (section) {
                switchToSection(section);
            }
        });
    });

    // Alert filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterAlerts(this.dataset.filter);
        });
    });

    // Window resize handler for charts
    window.addEventListener('resize', () => {
        Object.values(charts).forEach(chart => {
            if (chart && chart.resize) chart.resize();
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const userMenu = document.querySelector('.user-menu');
        const dropdown = document.getElementById('userDropdown');
        
        if (dropdown && userMenu && !userMenu.contains(event.target)) {
            dropdown.classList.remove('active');
        }
    });
}

// Authentication Functions
function handleLogin(event) {
    event.preventDefault();
    console.log('Handling login...');
    
    showLoading();
    
    setTimeout(() => {
        const email = event.target.querySelector('input[type="email"]').value;
        
        // Simulate authentication
        currentUser = {
            id: 'user_' + Date.now(),
            email: email,
            name: email.split('@')[0],
            role: email.includes('admin') ? 'admin' : 'public',
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('coastalUser', JSON.stringify(currentUser));
        hideLoading();
        showDashboard();
    }, 1500);
}

function handleSignup(event) {
    event.preventDefault();
    console.log('Handling signup...');
    
    showLoading();
    
    setTimeout(() => {
        const email = event.target.querySelector('input[type="email"]').value;
        const name = event.target.querySelector('input[type="text"]').value;
        const role = document.getElementById('userRole').value;
        
        currentUser = {
            id: 'user_' + Date.now(),
            email: email,
            name: name,
            role: role,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('coastalUser', JSON.stringify(currentUser));
        hideLoading();
        showDashboard();
    }, 1500);
}

function handleGoogleLogin() {
    console.log('Handling Google login...');
    showLoading();
    
    setTimeout(() => {
        currentUser = {
            id: 'google_user_' + Date.now(),
            email: 'user@gmail.com',
            name: 'Google User',
            role: 'public',
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('coastalUser', JSON.stringify(currentUser));
        hideLoading();
        showDashboard();
    }, 1000);
}

function logout() {
    console.log('Logging out...');
    localStorage.removeItem('coastalUser');
    currentUser = null;
    if (updateInterval) clearInterval(updateInterval);
    showLandingPage();
}

// Page Navigation Functions
function showLandingPage() {
    console.log('Showing landing page...');
    hideAllPages();
    document.getElementById('landingPage').classList.add('active');
}

function showLoginPage() {
    console.log('Showing login page...');
    hideAllPages();
    document.getElementById('loginPage').classList.add('active');
}

function showSignupPage() {
    console.log('Showing signup page...');
    hideAllPages();
    document.getElementById('signupPage').classList.add('active');
}

function showDashboard() {
    console.log('Showing dashboard...');
    hideAllPages();
    document.getElementById('dashboardPage').classList.add('active');
    
    if (currentUser) {
        // Update user info
        const userNameEl = document.getElementById('userName');
        if (userNameEl) userNameEl.textContent = currentUser.name;
        
        // Show/hide admin features
        const isAdmin = currentUser.role === 'admin';
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = isAdmin ? 'block' : 'none';
        });
        
        // Initialize dashboard
        initializeDashboard();
        startRealTimeUpdates();
    }
}

function hideAllPages() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
}

// Dashboard Functions
function initializeDashboard() {
    console.log('Initializing dashboard...');
    updateSystemStatus();
    updateOverviewStats();
    initializeMap();
    renderAlerts();
    
    // Switch to overview section
    switchToSection('overview');
    
    // Initialize charts after a short delay to ensure DOM is ready
    setTimeout(() => {
        initializeCharts();
    }, 100);
}

function switchToSection(sectionName) {
    console.log('Switching to section:', sectionName);
    currentSection = sectionName;
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionName) {
            item.classList.add('active');
        }
    });
    
    // Update sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Reinitialize charts if needed
        if (sectionName === 'charts') {
            setTimeout(() => initializeCharts(), 100);
        }
    }
}

function updateSystemStatus() {
    const statusElement = document.getElementById('overallStatus');
    const updateElement = document.getElementById('lastUpdate');
    const badgeElement = document.getElementById('alertBadge');
    
    if (statusElement) {
        const status = appData.systemStatus.overallStatus.toLowerCase();
        statusElement.className = `status-indicator ${status}`;
        const statusText = statusElement.querySelector('.status-text');
        if (statusText) statusText.textContent = appData.systemStatus.overallStatus;
    }
    
    if (updateElement) {
        const now = new Date();
        updateElement.textContent = `Last updated: ${now.toLocaleTimeString()}`;
    }
    
    if (badgeElement) {
        const activeAlerts = appData.alerts.filter(alert => !alert.acknowledged).length;
        badgeElement.textContent = activeAlerts;
        badgeElement.style.display = activeAlerts > 0 ? 'block' : 'none';
    }
}

function updateOverviewStats() {
    const locationCounts = {
        safe: 0,
        warning: 0,
        critical: 0
    };
    
    appData.coastalLocations.forEach(location => {
        locationCounts[location.threatLevel.toLowerCase()]++;
    });
    
    const safeEl = document.getElementById('safeLocations');
    const warningEl = document.getElementById('warningLocations');
    const criticalEl = document.getElementById('criticalLocations');
    const uptimeEl = document.getElementById('systemUptime');
    
    if (safeEl) safeEl.textContent = locationCounts.safe;
    if (warningEl) warningEl.textContent = locationCounts.warning;
    if (criticalEl) criticalEl.textContent = locationCounts.critical;
    if (uptimeEl) uptimeEl.textContent = appData.systemStatus.systemUptime;
}

// Map Functions
function initializeMap() {
    const mapContainer = document.getElementById('locationMarkers');
    if (!mapContainer) return;
    
    console.log('Initializing map...');
    mapContainer.innerHTML = '';
    
    appData.coastalLocations.forEach((location, index) => {
        const marker = document.createElement('div');
        marker.className = `location-marker ${location.threatLevel.toLowerCase()}`;
        
        // Position markers across the map area
        const positions = [
            { top: '25%', left: '20%' },  // Miami
            { top: '15%', left: '85%' },  // Boston
            { top: '40%', left: '10%' }   // San Francisco
        ];
        
        if (positions[index]) {
            marker.style.top = positions[index].top;
            marker.style.left = positions[index].left;
        }
        
        marker.addEventListener('click', () => showLocationDetails(location));
        mapContainer.appendChild(marker);
    });
}

function showLocationDetails(location) {
    console.log('Showing location details for:', location.name);
    const detailsPanel = document.getElementById('locationDetails');
    
    if (detailsPanel) {
        const nameEl = document.getElementById('locationName');
        const seaLevelEl = document.getElementById('detailSeaLevel');
        const windSpeedEl = document.getElementById('detailWindSpeed');
        const pollutionEl = document.getElementById('detailPollution');
        const stormRiskEl = document.getElementById('detailStormRisk');
        
        if (nameEl) nameEl.textContent = location.name;
        if (seaLevelEl) seaLevelEl.textContent = `${location.seaLevel.toFixed(1)}m`;
        if (windSpeedEl) windSpeedEl.textContent = `${location.windSpeed} km/h`;
        if (pollutionEl) pollutionEl.textContent = location.pollution;
        if (stormRiskEl) stormRiskEl.textContent = `${location.stormProbability}%`;
        
        detailsPanel.style.display = 'block';
    }
}

function hideLocationDetails() {
    const detailsPanel = document.getElementById('locationDetails');
    if (detailsPanel) {
        detailsPanel.style.display = 'none';
    }
}

// Charts Initialization
function initializeCharts() {
    console.log('Initializing charts...');
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded');
        return;
    }
    
    initializeTideChart();
    initializeWindChart();
    initializePollutionChart();
    initializeStormChart();
}

function initializeTideChart() {
    const canvas = document.getElementById('tideChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (charts.tide) {
        charts.tide.destroy();
    }
    
    charts.tide = new Chart(ctx, {
        type: 'line',
        data: {
            labels: appData.tideData.map(d => d.time),
            datasets: [{
                label: 'Tide Level (m)',
                data: appData.tideData.map(d => d.level),
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#1FB8CD',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Level (meters)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            }
        }
    });
}

function initializeWindChart() {
    const canvas = document.getElementById('windChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (charts.wind) {
        charts.wind.destroy();
    }
    
    charts.wind = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: appData.windData.map(d => d.time),
            datasets: [{
                label: 'Wind Speed (km/h)',
                data: appData.windData.map(d => d.speed),
                backgroundColor: '#FFC185',
                borderColor: '#B4413C',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Speed (km/h)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            }
        }
    });
}

function initializePollutionChart() {
    const canvas = document.getElementById('pollutionChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (charts.pollution) {
        charts.pollution.destroy();
    }
    
    charts.pollution = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: appData.pollutionData.map(d => d.location),
            datasets: [{
                data: appData.pollutionData.map(d => d.level),
                backgroundColor: ['#B4413C', '#ECEBD5', '#5D878F', '#DB4545'],
                borderColor: '#ffffff',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function initializeStormChart() {
    const canvas = document.getElementById('stormChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (charts.storm) {
        charts.storm.destroy();
    }
    
    charts.storm = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: appData.stormData.map(d => d.category),
            datasets: [{
                data: appData.stormData.map(d => d.probability),
                backgroundColor: ['#D2BA4C', '#964325', '#944454', '#13343B'],
                borderColor: '#ffffff',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Alert Management
function renderAlerts() {
    const alertsList = document.getElementById('alertsList');
    if (!alertsList) return;
    
    console.log('Rendering alerts...');
    alertsList.innerHTML = '';
    
    appData.alerts.forEach(alert => {
        const alertElement = createAlertElement(alert);
        alertsList.appendChild(alertElement);
    });
}

function createAlertElement(alert) {
    const div = document.createElement('div');
    div.className = `alert-item ${alert.acknowledged ? 'acknowledged' : ''}`;
    div.dataset.severity = alert.severity;
    
    const date = new Date(alert.timestamp);
    const timeAgo = getTimeAgo(date);
    
    div.innerHTML = `
        <div class="alert-icon ${alert.severity.toLowerCase()}">
            <i class="fas ${getAlertIcon(alert.severity)}"></i>
        </div>
        <div class="alert-content">
            <div class="alert-title">${alert.title}</div>
            <div class="alert-description">${alert.description}</div>
            <div class="alert-meta">
                <span><i class="fas fa-map-marker-alt"></i> ${alert.location}</span>
                <span><i class="fas fa-clock"></i> ${timeAgo}</span>
            </div>
        </div>
        <div class="alert-actions">
            <button class="acknowledge-btn" 
                    onclick="acknowledgeAlert('${alert.id}')"
                    ${alert.acknowledged ? 'disabled' : ''}>
                ${alert.acknowledged ? 'Acknowledged' : 'Acknowledge'}
            </button>
        </div>
    `;
    
    return div;
}

function getAlertIcon(severity) {
    switch (severity) {
        case 'CRITICAL': return 'fa-exclamation-triangle';
        case 'WARNING': return 'fa-exclamation-circle';
        default: return 'fa-check-circle';
    }
}

function filterAlerts(filter) {
    const alerts = document.querySelectorAll('.alert-item');
    
    alerts.forEach(alert => {
        if (filter === 'all' || alert.dataset.severity === filter) {
            alert.style.display = 'flex';
        } else {
            alert.style.display = 'none';
        }
    });
}

function acknowledgeAlert(alertId) {
    console.log('Acknowledging alert:', alertId);
    const alert = appData.alerts.find(a => a.id === alertId);
    if (alert) {
        alert.acknowledged = true;
        renderAlerts();
        updateSystemStatus();
        
        showNotification(
            'Alert Acknowledged',
            `Alert "${alert.title}" has been acknowledged.`,
            'success'
        );
    }
}

function createAlert(event) {
    event.preventDefault();
    console.log('Creating new alert...');
    
    const selects = event.target.querySelectorAll('select');
    const location = selects[0].value;
    const severity = selects[1].value;
    const title = event.target.querySelector('input[type="text"]').value;
    const description = event.target.querySelector('textarea').value;
    
    const locationName = selects[0].selectedOptions[0].text;
    
    const newAlert = {
        id: 'alert_' + Date.now(),
        timestamp: new Date().toISOString(),
        severity: severity,
        location: locationName,
        title: title,
        description: description,
        acknowledged: false
    };
    
    appData.alerts.unshift(newAlert);
    renderAlerts();
    updateSystemStatus();
    
    // Trigger notification
    showNotification(
        'New Alert Created',
        `${newAlert.severity} alert created for ${newAlert.location}`,
        newAlert.severity.toLowerCase()
    );
    
    // Reset form
    event.target.reset();
}

// Notification System
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            notificationPermission = permission === 'granted';
            console.log('Notification permission:', permission);
        });
    }
}

function showNotification(title, message, type = 'warning') {
    console.log('Showing notification:', title, message, type);
    
    // Browser notification
    if (notificationPermission && 'Notification' in window) {
        const notification = new Notification(title, {
            body: message,
            icon: '/favicon.ico',
            tag: 'coastal-alert'
        });
        
        notification.onclick = function() {
            window.focus();
            notification.close();
        };
    }
    
    // Toast notification
    showToast(title, message, type);
}

function showToast(title, message, type = 'warning') {
    const toast = document.getElementById('notificationToast');
    if (!toast) return;
    
    const titleEl = toast.querySelector('.toast-title');
    const messageEl = toast.querySelector('.toast-message');
    const iconEl = toast.querySelector('.toast-icon');
    
    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;
    
    // Update icon based on type
    if (iconEl) {
        iconEl.className = 'toast-icon';
        switch (type) {
            case 'success':
                iconEl.innerHTML = '<i class="fas fa-check-circle"></i>';
                iconEl.style.background = 'var(--color-success)';
                break;
            case 'critical':
                iconEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
                iconEl.style.background = 'var(--color-error)';
                break;
            default:
                iconEl.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
                iconEl.style.background = 'var(--color-warning)';
        }
    }
    
    toast.classList.add('show');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

function hideNotification() {
    const toast = document.getElementById('notificationToast');
    if (toast) {
        toast.classList.remove('show');
    }
}

// Real-time Updates
function startRealTimeUpdates() {
    console.log('Starting real-time updates...');
    updateInterval = setInterval(() => {
        simulateDataUpdates();
        updateSystemStatus();
        updateOverviewStats();
        
        // Update charts if in charts section
        if (currentSection === 'charts') {
            updateChartsData();
        }
    }, 30000); // Update every 30 seconds
}

function simulateDataUpdates() {
    // Simulate minor data changes
    appData.coastalLocations.forEach(location => {
        // Small random variations
        location.seaLevel += (Math.random() - 0.5) * 0.1;
        location.windSpeed += (Math.random() - 0.5) * 2;
        location.pollution += (Math.random() - 0.5) * 3;
        location.stormProbability += (Math.random() - 0.5) * 5;
        
        // Ensure values stay in realistic ranges
        location.seaLevel = Math.max(0.5, Math.min(4, location.seaLevel));
        location.windSpeed = Math.max(5, Math.min(60, location.windSpeed));
        location.pollution = Math.max(0, Math.min(100, location.pollution));
        location.stormProbability = Math.max(0, Math.min(100, location.stormProbability));
        
        // Update threat level based on conditions
        if (location.seaLevel > 2.5 || location.windSpeed > 40 || location.pollution > 80) {
            location.threatLevel = 'CRITICAL';
        } else if (location.seaLevel > 2 || location.windSpeed > 25 || location.pollution > 60) {
            location.threatLevel = 'WARNING';
        } else {
            location.threatLevel = 'SAFE';
        }
    });
    
    // Update system status
    const criticalLocations = appData.coastalLocations.filter(l => l.threatLevel === 'CRITICAL').length;
    const warningLocations = appData.coastalLocations.filter(l => l.threatLevel === 'WARNING').length;
    
    if (criticalLocations > 0) {
        appData.systemStatus.overallStatus = 'CRITICAL';
    } else if (warningLocations > 0) {
        appData.systemStatus.overallStatus = 'WARNING';
    } else {
        appData.systemStatus.overallStatus = 'SAFE';
    }
    
    appData.systemStatus.lastUpdated = new Date().toISOString();
}

function updateChartsData() {
    // Update tide data with new values
    appData.tideData.forEach(point => {
        point.level += (Math.random() - 0.5) * 0.1;
        point.level = Math.max(0.5, Math.min(3, point.level));
    });
    
    // Update wind data
    appData.windData.forEach(point => {
        point.speed += (Math.random() - 0.5) * 2;
        point.speed = Math.max(5, Math.min(50, point.speed));
    });
    
    // Refresh charts
    if (charts.tide && charts.tide.data) {
        charts.tide.data.datasets[0].data = appData.tideData.map(d => d.level);
        charts.tide.update('none');
    }
    
    if (charts.wind && charts.wind.data) {
        charts.wind.data.datasets[0].data = appData.windData.map(d => d.speed);
        charts.wind.update('none');
    }
}

// UI Interaction Functions
function toggleNotifications() {
    console.log('Toggle notifications panel');
    // This would open a notifications panel in a real app
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Loading Screen Functions
function showLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.add('show');
    }
}

function hideLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.remove('show');
    }
}

// Utility Functions
function animateCounter(element) {
    const target = parseInt(element.dataset.count);
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}

function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
}

function showForgotPassword() {
    alert('Password reset functionality would be implemented here. For demo purposes, this shows an alert.');
}

// Simulate ML Prediction API
function simulateMLPrediction(locationData) {
    // Simple threshold-based classification
    let riskScore = 0;
    
    if (locationData.seaLevel > 2.5) riskScore += 40;
    else if (locationData.seaLevel > 2) riskScore += 20;
    
    if (locationData.windSpeed > 40) riskScore += 30;
    else if (locationData.windSpeed > 25) riskScore += 15;
    
    if (locationData.pollution > 80) riskScore += 20;
    else if (locationData.pollution > 60) riskScore += 10;
    
    if (locationData.stormProbability > 70) riskScore += 10;
    
    if (riskScore >= 60) return 'CRITICAL';
    if (riskScore >= 30) return 'WARNING';
    return 'SAFE';
}

// Generate Mock Alert based on ML prediction
function checkForNewThreats() {
    appData.coastalLocations.forEach(location => {
        const prediction = simulateMLPrediction(location);
        
        // If threat level changed to a higher level, create alert
        if (prediction !== location.threatLevel && prediction !== 'SAFE') {
            const newAlert = {
                id: 'auto_' + Date.now(),
                timestamp: new Date().toISOString(),
                severity: prediction,
                location: location.name,
                title: `${prediction.charAt(0) + prediction.slice(1).toLowerCase()} Threat Detected`,
                description: `ML system detected ${prediction.toLowerCase()} conditions. Sea level: ${location.seaLevel.toFixed(1)}m, Wind: ${location.windSpeed}km/h, Pollution: ${location.pollution}`,
                acknowledged: false
            };
            
            appData.alerts.unshift(newAlert);
            
            showNotification(
                newAlert.title,
                `${location.name}: ${newAlert.description}`,
                prediction.toLowerCase()
            );
        }
        
        location.threatLevel = prediction;
    });
}

// Periodic threat checking (only when dashboard is active)
setInterval(() => {
    if (currentUser && currentSection) {
        checkForNewThreats();
    }
}, 60000); // Check every minute