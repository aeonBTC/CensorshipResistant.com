const API = 'https://mempool.space/api/v1/mining/hashrate/3d';
let loading = false;
let currentHashrate = 0;
let currentDifficulty = 0;
let hashrateData = null;

// ------------------- Home Page Functions -------------------

// Initialize home page functionality
function initializeHomePage() {
    // Initialize basic functionality first
    initializeBasicFunctionality();

    // Fetch all data needed for home page stats
    fetchBitcoinNetworkData().then(() => {
        // Update the display with the fetched data
        updateHashrateDisplay();
        updateDifficultyDisplay();
    });
    
    // Fetch the current block height
    fetchBlockHeight();
    
    // Fetch average block fees
    fetchAverageBlockFees();
}

// Fetch Bitcoin network data (hashrate and difficulty) once
async function fetchBitcoinNetworkData() {
    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error('Network error');
        
        hashrateData = await res.json();
        currentHashrate = hashrateData.currentHashrate;
        currentDifficulty = hashrateData.currentDifficulty;
        
        return hashrateData;
    } catch (error) {
        console.error('Error fetching Bitcoin network data:', error);
        return null;
    }
}

// Update hashrate display on the page
function updateHashrateDisplay() {
    const hashrateElement = document.getElementById('current-hashrate');
    if (!hashrateElement) return;
    
    if (!currentHashrate) {
        hashrateElement.textContent = 'Data unavailable';
        return;
    }
    
    let displayValue, unit;
    
    // Automatically adjust to ZH/s if the hashrate exceeds 1000 EH/s
    if (currentHashrate >= 1e21) {
        // Convert to Zetahash (ZH/s)
        displayValue = (currentHashrate / 1e21).toFixed(2);
        unit = 'ZH/s';
    } else {
        // Convert to Exahash (EH/s)
        displayValue = (currentHashrate / 1e18).toFixed(2);
        unit = 'EH/s';
    }
    
    // Update the display with the current hashrate
    hashrateElement.textContent = displayValue + ' ' + unit;
}

// Update the difficulty display
function updateDifficultyDisplay() {
    const difficultyElement = document.getElementById('current-difficulty');
    if (!difficultyElement || !currentDifficulty) return;
    
    let formattedDifficulty;
    
    // Format with T for trillion or Q for quadrillion
    if (currentDifficulty >= 1e15) {
        formattedDifficulty = (currentDifficulty / 1e15).toFixed(2) + ' Q';
    } else if (currentDifficulty >= 1e12) {
        formattedDifficulty = (currentDifficulty / 1e12).toFixed(2) + ' T';
    } else {
        formattedDifficulty = currentDifficulty.toLocaleString('en-US', {
            maximumFractionDigits: 0
        });
    }
    
    difficultyElement.textContent = formattedDifficulty;
}

// Fetch the current Bitcoin block height
function fetchBlockHeight() {
    const blockHeightElement = document.getElementById('current-block-height');
    if (!blockHeightElement) return;
    
    fetch('https://mempool.space/api/blocks/tip/height')
        .then(response => response.text())
        .then(height => {
            // Format the block height with commas for readability
            const formattedHeight = parseInt(height).toLocaleString();
            blockHeightElement.textContent = formattedHeight;
        })
        .catch(error => {
            console.error('Error fetching block height:', error);
            blockHeightElement.textContent = 'Data unavailable';
        });
}

// Fetch average block fees in BTC (last 72 blocks)
function fetchAverageBlockFees() {
    const feesElement = document.getElementById('current-fees');
    if (!feesElement) return;
    
    // Use the mempool.space API to get recent blocks
    fetch('https://mempool.space/api/v1/blocks')
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                // Limit to most recent 72 blocks
                const blocks = data.slice(0, 72);
                
                // Calculate total fees from these blocks
                let totalFeesSats = 0;
                
                // Sum the fees from all blocks
                for (let i = 0; i < blocks.length; i++) {
                    if (blocks[i].extras && blocks[i].extras.totalFees) {
                        totalFeesSats += blocks[i].extras.totalFees;
                    }
                }
                
                // Calculate the average
                const avgFeesSats = totalFeesSats / blocks.length;
                
                // Convert satoshis to BTC (1 BTC = 100,000,000 satoshis)
                const feesBtc = avgFeesSats / 100000000;
                
                // Format the fees to 4 decimal places
                const formattedFees = feesBtc.toFixed(4);
                
                // Update the display
                feesElement.textContent = `${formattedFees} BTC`;
            } else {
                // Fallback if no data
                feesElement.textContent = '0.0000 BTC';
            }
        })
        .catch(error => {
            console.error('Error fetching block fees:', error);
            feesElement.textContent = '0.0000 BTC'; // Fallback
        });
}

// ------------------- Calculator Page Functions -------------------

// Initialize calculator page
function initializeCalculatorPage() {
    // Initialize basic functionality
    initializeBasicFunctionality();
    
    // Get all the required elements
    const modal = document.getElementById('info-modal');
    const guerrillaInfoIcon = document.getElementById('guerrilla-info-icon');
    const powerInfoIcon = document.getElementById('power-info-icon');
    const closeBtn = document.querySelector('.close-btn');
    const guerrillaInfo = document.getElementById('guerrilla-info');
    const powerInfo = document.getElementById('power-info');
    const blackMarketSlider = document.getElementById('black-market-miners-slider');
    const bitaxeSlider = document.getElementById('bitaxe-hashrate-slider');
    
    // Setup modal event listeners if elements exist
    if (guerrillaInfoIcon && powerInfoIcon && modal) {
        guerrillaInfoIcon.addEventListener('click', () => {
            showModal(guerrillaInfo, modal, guerrillaInfo, powerInfo);
        });
        
        powerInfoIcon.addEventListener('click', () => {
            showModal(powerInfo, modal, guerrillaInfo, powerInfo);
        });
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => hideModal(modal));
        }
        
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                hideModal(modal);
            }
        });
    }
    
    // Setup calculator-specific listeners
    if (blackMarketSlider) {
        blackMarketSlider.addEventListener('input', updateGuerrillaSliderValue);
    }
    
    if (bitaxeSlider) {
        bitaxeSlider.addEventListener('input', updateBitaxeSliderValue);
    }
    
    // Fetch data for calculator
    fetchBitcoinNetworkData().then(data => {
        if (data) {
            updateCalculatorDisplay();
        }
    });
}

// Update the calculator display with the current hashrate
function updateCalculatorDisplay() {
    const hashrateElement = document.getElementById('hashrate');
    if (hashrateElement && currentHashrate > 0) {
        hashrateElement.textContent = `${(currentHashrate / 1e18).toFixed(2)} EH/s`;
    }
    
    updateMinersNeeded();
}

// Simplified showModal
function showModal(infoElement, modal, guerrillaInfo, powerInfo) {
    if (!modal) return;
    modal.style.display = 'flex';
    if (guerrillaInfo) guerrillaInfo.style.display = 'none';
    if (powerInfo) powerInfo.style.display = 'none';
    if (infoElement) infoElement.style.display = 'block';
}

// Simplified hideModal
function hideModal(modal) {
    if (!modal) return;
    modal.style.display = 'none';
}

function updateGuerrillaSliderValue() {
    const slider = document.getElementById('black-market-miners-slider');
    const valueDisplay = document.getElementById('slider-value');
    
    if (!slider || !valueDisplay) return;
    
    const value = slider.value;
    valueDisplay.textContent = `${value}%`;
    updateMinersNeeded();
}

function updateBitaxeSliderValue() {
    const slider = document.getElementById('bitaxe-hashrate-slider');
    const valueDisplay = document.getElementById('bitaxe-value');
    
    if (!slider || !valueDisplay) return;
    
    const value = parseFloat(slider.value);
    valueDisplay.textContent = `${value} TH/s`;
    updateMinersNeeded();
}

function updateMinersNeeded() {
    const minersElement = document.getElementById('miners');
    if (!minersElement || currentHashrate <= 0) return;
    
    const blackMarketSlider = document.getElementById('black-market-miners-slider');
    const bitaxeSlider = document.getElementById('bitaxe-hashrate-slider');
    
    if (!blackMarketSlider || !bitaxeSlider) return;
    
    const guerrillaPercentage = parseInt(blackMarketSlider.value);
    const bitaxeHashrate = parseFloat(bitaxeSlider.value);
    
    // If 51% or more of the network is already guerrilla miners, we've reached the threshold
    if (guerrillaPercentage >= 51) {
        minersElement.textContent = "0";
        return;
    }
    
    // Calculate how much more hashrate we need to add to reach 51% censorship resistant
    // Formula: We need to add enough hashrate X such that:
    // (current_guerrilla_hashrate + X) / (current_total_hashrate + X) = 0.51
    // Solving for X: X = (0.51 * current_total_hashrate - current_guerrilla_hashrate) / 0.49
    
    const existingGuerrillaHashrate = currentHashrate * (guerrillaPercentage / 100);
    const targetPercentage = 0.51;
    const additionalHashrateNeeded = Math.max(0, (targetPercentage * currentHashrate - existingGuerrillaHashrate) / (1 - targetPercentage));
    
    // If we need additional hashrate but BitAxe hashrate is 0, we can't calculate miners needed
    if (additionalHashrateNeeded > 0 && bitaxeHashrate <= 0) {
        minersElement.textContent = "∞";
        return;
    }
    
    // If no additional hashrate is needed, show 0 miners
    if (additionalHashrateNeeded <= 0) {
        minersElement.textContent = "0";
        return;
    }
    
    // Convert BitAxe hashrate from TH/s to H/s for calculation (1 TH/s = 1e12 H/s)
    const bitaxeHashrateInHs = bitaxeHashrate * 1e12;
    
    // Division gives us the number of miners needed
    const minersNeeded = Math.round(additionalHashrateNeeded / bitaxeHashrateInHs);
    minersElement.textContent = minersNeeded.toLocaleString();
}

// ------------------- Initialize on page load -------------------

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the calculator page
    if (document.getElementById('bitaxe-hashrate-slider') && document.getElementById('black-market-miners-slider')) {
        // Calculator page
        initializeCalculatorPage();
    } 
    // Check if we're on the home page
    else if (document.getElementById('current-hashrate')) {
        // Home page
        initializeHomePage();
    }
    // For other pages, just initialize basic functionality
    else {
        // Basic initialization (smooth scrolling, etc)
        initializeBasicFunctionality();
    }
});

// Function for basic functionality shared across all pages
function initializeBasicFunctionality() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}