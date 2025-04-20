const $ = id => document.getElementById(id);
const API = 'https://mempool.space/api/v1/mining/hashrate/3d';
let loading = false;
let currentHashrate = 0;

// Modal handling
const modal = $('info-modal');
const guerrillaInfoIcon = $('guerrilla-info-icon');
const powerInfoIcon = $('power-info-icon');
const closeBtn = document.querySelector('.close-btn');
const guerrillaInfo = $('guerrilla-info');
const powerInfo = $('power-info');

function showModal(infoElement) {
    modal.style.display = 'block';
    guerrillaInfo.style.display = 'none';
    powerInfo.style.display = 'none';
    infoElement.style.display = 'block';
}

guerrillaInfoIcon.addEventListener('click', () => showModal(guerrillaInfo));
powerInfoIcon.addEventListener('click', () => showModal(powerInfo));

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

async function fetchData() {
    if (loading) return;
    loading = true;
    
    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error('Network error');
        
        const data = await res.json();
        currentHashrate = data.currentHashrate;
        $('hashrate').textContent = `${(currentHashrate / 1e18).toFixed(2)} EH/s`;
        
        updateMinersNeeded();
    } catch (err) {
        console.error(err);
        $('hashrate').textContent = 'Error';
        $('miners').textContent = 'Error';
    } finally {
        setTimeout(() => {
            loading = false;
        }, 400);
    }
}

function updateMinersNeeded() {
    if (currentHashrate <= 0) return;
    
    const guerrillaPercentage = parseInt($('black-market-miners-slider').value);
    const bitaxeHashrate = parseFloat($('bitaxe-hashrate-slider').value);
    
    // If 51% or more of the network is already guerrilla miners, we've reached the threshold
    if (guerrillaPercentage >= 51) {
        $('miners').textContent = "0";
        return;
    }
    
    // Calculate how much more hashrate we need to add to reach 51% censorship-resistant
    // Formula: We need to add enough hashrate X such that:
    // (current_guerrilla_hashrate + X) / (current_total_hashrate + X) = 0.51
    // Solving for X: X = (0.51 * current_total_hashrate - current_guerrilla_hashrate) / 0.49
    
    const existingGuerrillaHashrate = currentHashrate * (guerrillaPercentage / 100);
    const targetPercentage = 0.51;
    const additionalHashrateNeeded = Math.max(0, (targetPercentage * currentHashrate - existingGuerrillaHashrate) / (1 - targetPercentage));
    
    // If we need additional hashrate but BitAxe hashrate is 0, we can't calculate miners needed
    if (additionalHashrateNeeded > 0 && bitaxeHashrate <= 0) {
        $('miners').textContent = "∞";
        return;
    }
    
    // If no additional hashrate is needed, show 0 miners
    if (additionalHashrateNeeded <= 0) {
        $('miners').textContent = "0";
        return;
    }
    
    // Convert BitAxe hashrate from TH/s to H/s for calculation (1 TH/s = 1e12 H/s)
    const bitaxeHashrateInHs = bitaxeHashrate * 1e12;
    
    // Division gives us the number of miners needed
    const minersNeeded = Math.round(additionalHashrateNeeded / bitaxeHashrateInHs);
    $('miners').textContent = minersNeeded.toLocaleString();
}

function updateGuerrillaSliderValue() {
    const value = $('black-market-miners-slider').value;
    $('slider-value').textContent = `${value}%`;
    updateMinersNeeded();
}

function updateBitaxeSliderValue() {
    const value = parseFloat($('bitaxe-hashrate-slider').value);
    $('bitaxe-value').textContent = `${value} TH/s`;
    updateMinersNeeded();
}

// Event listeners
$('black-market-miners-slider').addEventListener('input', updateGuerrillaSliderValue);
$('bitaxe-hashrate-slider').addEventListener('input', updateBitaxeSliderValue);

// Initial load
fetchData();