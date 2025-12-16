// API endpoint - will be /api/lookup in production, or full URL for local dev
const API_BASE = window.location.origin + '/api/lookup';

// DOM elements
const ipForm = document.getElementById('ipForm');
const ipInput = document.getElementById('ipInput');
const submitBtn = document.getElementById('submitBtn');
const errorMessage = document.getElementById('errorMessage');
const resultsSection = document.getElementById('resultsSection');
const quickBtns = document.querySelectorAll('.quick-btn');
const copyBtn = document.getElementById('copyBtn');

// Result elements
const resultIP = document.getElementById('resultIP');
const resultCountry = document.getElementById('resultCountry');
const resultState = document.getElementById('resultState');
const resultDistrict = document.getElementById('resultDistrict');
const resultCity = document.getElementById('resultCity');
const resultTimestamp = document.getElementById('resultTimestamp');
const jsonOutput = document.getElementById('jsonOutput');

let currentResult = null;

// Validate IP format
function isValidIP(ip) {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip.trim());
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'flex';
    resultsSection.style.display = 'none';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Hide error message
function hideError() {
    errorMessage.style.display = 'none';
}

// Set loading state
function setLoading(loading) {
    submitBtn.disabled = loading;
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    if (loading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

// Display results
function displayResults(data) {
    currentResult = data;
    
    resultIP.textContent = data.ip || '-';
    resultCountry.textContent = data.data?.country || 'N/A';
    resultState.textContent = data.data?.state || 'N/A';
    resultDistrict.textContent = data.data?.district || 'N/A';
    resultCity.textContent = data.data?.city || 'N/A';
    resultTimestamp.textContent = data.timestamp 
        ? new Date(data.timestamp).toLocaleString() 
        : new Date().toLocaleString();
    
    // Display JSON
    jsonOutput.textContent = JSON.stringify(data, null, 2);
    
    // Show results section
    resultsSection.style.display = 'block';
    hideError();
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Fetch IP data
async function lookupIP(ip) {
    if (!isValidIP(ip)) {
        showError('Please enter a valid IPv4 address (e.g., 154.161.165.171)');
        return;
    }

    setLoading(true);
    hideError();

    try {
        const url = `${API_BASE}?ip=${encodeURIComponent(ip)}`;
        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
            displayResults(data);
        } else {
            showError(data.error || 'Failed to fetch IP data');
        }

    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Network error: Unable to fetch IP data. Please try again.');
    } finally {
        setLoading(false);
    }
}

// Copy to clipboard
async function copyToClipboard() {
    if (!currentResult) return;

    try {
        const jsonString = JSON.stringify(currentResult, null, 2);
        await navigator.clipboard.writeText(jsonString);
        
        // Visual feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copied!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.classList.remove('copied');
        }, 2000);
    } catch (error) {
        console.error('Failed to copy:', error);
        showError('Failed to copy to clipboard');
    }
}

// Form submission
ipForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const ip = ipInput.value.trim();
    if (ip) {
        lookupIP(ip);
    }
});

// Quick IP buttons
quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const ip = btn.getAttribute('data-ip');
        ipInput.value = ip;
        lookupIP(ip);
    });
});

// Copy button
copyBtn.addEventListener('click', copyToClipboard);

// Enter key support
ipInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        ipForm.dispatchEvent(new Event('submit'));
    }
});

// Focus input on load
window.addEventListener('load', () => {
    ipInput.focus();
});

