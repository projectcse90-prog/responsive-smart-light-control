// Hardcoded credentials for demo
const VALID_EMAIL = 'admin@example.com';
const VALID_PASSWORD = 'admin123';

// Light control data structure
let lights = {
    'living-room': { isOn: false, brightness: 50 },
    'bedroom': { isOn: false, brightness: 50 },
    'kitchen': { isOn: false, brightness: 50 },
    'study': { isOn: false, brightness: 50 }
};

// User settings
let userSettings = {
    name: 'Admin User',
    email: 'admin@example.com',
    theme: 'dark'
};

// Load data from localStorage
function loadLights() {
    const storedLights = localStorage.getItem('lights');
    if (storedLights) {
        lights = JSON.parse(storedLights);
    }
}

function loadSettings() {
    const storedSettings = localStorage.getItem('userSettings');
    if (storedSettings) {
        userSettings = JSON.parse(storedSettings);
    }
    applyTheme();
}

function saveLights() {
    localStorage.setItem('lights', JSON.stringify(lights));
}

function saveSettings() {
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
    applyTheme();
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// Login function
function login(email, password) {
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'dashboard.html';
        return true;
    }
    return false;
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('lights');
        localStorage.removeItem('userSettings');
        window.location.href = 'index.html';
    }
}

// Redirect if not logged in
function checkAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
    }
}

// Redirect if already logged in
function checkAlreadyLoggedIn() {
    if (isLoggedIn()) {
        window.location.href = 'dashboard.html';
    }
}

// Apply theme
function applyTheme() {
    document.body.className = userSettings.theme === 'light' ? 'light-theme' : '';
}

// Show toast notification
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Update real-time clock
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleString();
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

// Calculate energy usage
function calculateEnergyUsage() {
    let totalWatts = 0;
    let lightsOn = 0;
    Object.values(lights).forEach(light => {
        if (light.isOn) {
            totalWatts += (light.brightness / 100) * 60; // Assume 60W max per light
            lightsOn++;
        }
    });
    return { totalWatts, lightsOn };
}

// Initialize login page
function initLogin() {
    checkAlreadyLoggedIn();

    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (login(email, password)) {
            errorMessage.textContent = '';
            showToast('Login successful!');
        } else {
            errorMessage.textContent = 'Invalid email or password.';
        }
    });
}

// Initialize dashboard
function initDashboard() {
    checkAuth();
    loadLights();
    loadSettings();

    updateClock();
    setInterval(updateClock, 1000);

    updateDashboardOverview();

    // Logout event
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', logout);
    }
}

// Initialize rooms page
function initRooms() {
    checkAuth();
    loadLights();

    // Master switch
    const masterBtn = document.getElementById('master-switch');
    masterBtn.addEventListener('click', toggleAllLights);

    // Individual controls
    Object.keys(lights).forEach(room => {
        const toggleBtn = document.getElementById(`toggle-${room}`);
        const brightnessSlider = document.getElementById(`brightness-${room}`);
        const brightnessValue = document.getElementById(`brightness-value-${room}`);

        toggleBtn.addEventListener('click', () => toggleLight(room));
        brightnessSlider.addEventListener('input', (e) => setBrightness(room, e.target.value));
    });

    updateRoomControls();

    // Logout
    document.getElementById('logout-link').addEventListener('click', logout);
}

// Initialize energy page
function initEnergy() {
    checkAuth();
    loadLights();

    updateEnergyPage();

    // Logout
    document.getElementById('logout-link').addEventListener('click', logout);
}

// Initialize settings page
function initSettings() {
    checkAuth();
    loadSettings();

    // Populate form
    document.getElementById('user-name').value = userSettings.name;
    document.getElementById('user-email').value = userSettings.email;
    document.getElementById('theme-toggle').value = userSettings.theme;

    // Save settings
    document.getElementById('save-settings').addEventListener('click', () => {
        userSettings.name = document.getElementById('user-name').value;
        userSettings.email = document.getElementById('user-email').value;
        userSettings.theme = document.getElementById('theme-toggle').value;
        saveSettings();
        showToast('Settings saved successfully!');
    });

    // Reset system
    document.getElementById('reset-system').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the system? This will clear all data.')) {
            localStorage.clear();
            showToast('System reset successfully!', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    });

    // Logout
    document.getElementById('logout-link').addEventListener('click', logout);
}

// Toggle all lights
function toggleAllLights() {
    const allOn = Object.values(lights).every(light => light.isOn);
    Object.keys(lights).forEach(room => {
        lights[room].isOn = !allOn;
        updateLightUI(room);
    });
    saveLights();
    updateDashboardOverview();
    showToast(allOn ? 'All lights turned off' : 'All lights turned on');
}

// Toggle light on/off
function toggleLight(room) {
    lights[room].isOn = !lights[room].isOn;
    updateLightUI(room);
    saveLights();
    updateDashboardOverview();
    updateEnergyPage();
}

// Set brightness
function setBrightness(room, value) {
    lights[room].brightness = parseInt(value);
    updateLightUI(room);
    saveLights();
    updateDashboardOverview();
    updateEnergyPage();
}

// Update light UI
function updateLightUI(room) {
    const bulb = document.getElementById(`bulb-${room}`);
    const toggleBtn = document.getElementById(`toggle-${room}`);
    const brightnessValue = document.getElementById(`brightness-value-${room}`);
    const brightnessSlider = document.getElementById(`brightness-${room}`);

    if (bulb) {
        bulb.className = 'bulb';
        if (lights[room].isOn) {
            bulb.classList.add('on');
            const brightnessLevel = Math.floor(lights[room].brightness / 25) * 25;
            bulb.classList.add(`brightness-${brightnessLevel}`);
        }
    }

    if (toggleBtn) {
        toggleBtn.textContent = lights[room].isOn ? 'Turn OFF' : 'Turn ON';
        toggleBtn.classList.toggle('on', lights[room].isOn);
    }

    if (brightnessValue) {
        brightnessValue.textContent = `${lights[room].brightness}%`;
    }

    if (brightnessSlider) {
        brightnessSlider.disabled = !lights[room].isOn;
    }
}

// Update room controls
function updateRoomControls() {
    Object.keys(lights).forEach(room => {
        updateLightUI(room);
    });
    const masterBtn = document.getElementById('master-switch');
    if (masterBtn) {
        const allOn = Object.values(lights).every(light => light.isOn);
        masterBtn.textContent = allOn ? 'Turn All OFF' : 'Turn All ON';
    }
}

// Update dashboard overview
function updateDashboardOverview() {
    const totalRooms = document.getElementById('total-rooms');
    const lightsOn = document.getElementById('lights-on');
    const powerConsumption = document.getElementById('power-consumption');
    const systemMessage = document.getElementById('system-message');

    if (totalRooms) totalRooms.textContent = Object.keys(lights).length;
    if (lightsOn) lightsOn.textContent = Object.values(lights).filter(l => l.isOn).length;
    if (powerConsumption) {
        const { totalWatts } = calculateEnergyUsage();
        powerConsumption.textContent = `${totalWatts.toFixed(1)} W`;
    }
    if (systemMessage) {
        const issues = [];
        if (Object.values(lights).filter(l => l.isOn).length === 0) issues.push('No lights are on');
        systemMessage.textContent = issues.length ? issues.join(', ') : 'All systems operational.';
    }
}

// Update energy page
function updateEnergyPage() {
    const dailyUsage = document.getElementById('daily-usage');
    const currentConsumption = document.getElementById('current-consumption');
    const roomUsageList = document.getElementById('room-usage-list');
    const energyWarning = document.getElementById('energy-warning');

    if (dailyUsage) {
        const { totalWatts } = calculateEnergyUsage();
        dailyUsage.textContent = `${(totalWatts * 24 / 1000).toFixed(2)} kWh`; // Simulated daily
    }
    if (currentConsumption) {
        const { totalWatts } = calculateEnergyUsage();
        currentConsumption.textContent = `${totalWatts.toFixed(1)} W`;
    }
    if (roomUsageList) {
        roomUsageList.innerHTML = '';
        Object.keys(lights).forEach(room => {
            const li = document.createElement('li');
            const roomName = room.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
            const watts = lights[room].isOn ? ((lights[room].brightness / 100) * 60).toFixed(1) : 0;
            li.textContent = `${roomName}: ${watts} W`;
            roomUsageList.appendChild(li);
        });
    }
    if (energyWarning) {
        const { totalWatts } = calculateEnergyUsage();
        energyWarning.style.display = totalWatts > 150 ? 'block' : 'none';
    }
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('login-form')) {
        initLogin();
    } else if (document.getElementById('current-time')) {
        initDashboard();
    } else if (document.getElementById('master-switch')) {
        initRooms();
    } else if (document.getElementById('daily-usage')) {
        initEnergy();
    } else if (document.getElementById('user-name')) {
        initSettings();
    }
});
