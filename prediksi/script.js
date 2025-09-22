// Lottery data
const lotteryData = [
    {
        id: 'totomacau',
        name: 'Toto Macau 4D',
        icon: 'https://imageshost.b-cdn.net/pasaran/totomacau.webp',
        image: 'https://cdn.globalcontentcloud.com/game-images/totomacau-pools/9500/thumbnail.webp'
    },
    {
        id: 'hongkong',
        name: 'Hongkong Lotto',
        icon: 'https://imageshost.b-cdn.net/pasaran/hongkong.webp',
        image: 'https://cdn.globalcontentcloud.com/game-images/hongkong/5379/thumbnail.webp'
    },
    {
        id: 'singapore',
        name: 'Singapore Pools',
        icon: 'https://imageshost.b-cdn.net/pasaran/singapore.webp',
        image: 'https://cdn.globalcontentcloud.com/game-images/singapore/5378/thumbnail.webp'
    },
    {
        id: 'sydney',
        name: 'Sydney Lotto',
        icon: 'https://imageshost.b-cdn.net/pasaran/sydney.webp',
        image: 'https://cdn.globalcontentcloud.com/game-images/sydney/5380/thumbnail.webp'
    },
    {
        id: 'kingkong',
        name: 'Kingkong 4D',
        icon: 'https://imageshost.b-cdn.net/pasaran/kingkong.webp',
        image: 'https://cdn.globalcontentcloud.com/game-images/kingkong-pools/6947/thumbnail.webp'
    }
];

// Generate random number without duplicates
function generateUniqueNumbers(count) {
    const numbers = [];
    while (numbers.length < count) {
        const num = Math.floor(Math.random() * 10);
        if (!numbers.includes(num)) {
            numbers.push(num);
        }
    }
    return numbers;
}

// Generate main number (5 unique digits)
function generateMainNumber() {
    const numbers = generateUniqueNumbers(5);
    return numbers.join('');
}

// Generate combinations from main number - ensuring uniqueness
function generateCombinations(mainNumber, length, count) {
    const combinations = [];
    const digits = mainNumber.split('');
    const usedCombinations = new Set();
    
    let attempts = 0;
    while (combinations.length < count && attempts < 100) {
        const shuffled = [...digits].sort(() => Math.random() - 0.5);
        const combination = shuffled.slice(0, length).join('');
        
        // Check if this combination hasn't been used
        if (!usedCombinations.has(combination)) {
            combinations.push(combination);
            usedCombinations.add(combination);
        }
        attempts++;
    }
    
    // If we couldn't generate enough unique combinations from the main digits,
    // generate additional unique combinations using different permutations
    while (combinations.length < count) {
        let newCombination;
        let isUnique = false;
        let localAttempts = 0;
        
        while (!isUnique && localAttempts < 50) {
            // Create a more diverse combination
            const availableDigits = [0,1,2,3,4,5,6,7,8,9];
            const selectedDigits = [];
            
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * availableDigits.length);
                selectedDigits.push(availableDigits[randomIndex]);
                availableDigits.splice(randomIndex, 1); // Remove to avoid duplicates within the same combination
            }
            
            newCombination = selectedDigits.join('');
            
            if (!usedCombinations.has(newCombination)) {
                isUnique = true;
                combinations.push(newCombination);
                usedCombinations.add(newCombination);
            }
            localAttempts++;
        }
        
        // Fallback: if still can't generate unique, break to avoid infinite loop
        if (!isUnique) break;
    }
    
    return combinations;
}

// Generate random colok bebas (1 digit from main number)
function generateColokBebas(mainNumber) {
    const digits = mainNumber.split('');
    const randomIndex = Math.floor(Math.random() * digits.length);
    return digits[randomIndex];
}

// Generate predictions with daily seed for consistency
function generatePredictions(lotteryId) {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}-${lotteryId}`;
    
    // Create a simple hash from date string + lottery ID
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
        const char = dateString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    // Use the hash as seed for random generation
    const originalRandom = Math.random;
    let seed = Math.abs(hash);
    Math.random = function() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
    
    const mainNumber = generateMainNumber();
    const predictions = {
        angkaMain: mainNumber,
        top4D: generateCombinations(mainNumber, 4, 2), // Only 2 combinations
        top3D: generateCombinations(mainNumber, 3, 2), // Only 2 combinations
        top2D: generateCombinations(mainNumber, 2, 6), // 6 combinations for alternating colors
        colokBebas: generateColokBebas(mainNumber)
    };
    
    // Restore original random function
    Math.random = originalRandom;
    
    return predictions;
}

// Function to format numbers as balls
function formatAsBalls(numbers, type = 'combo') {
    if (typeof numbers === 'string') {
        // For single number string (like main number)
        return `<div class="number-set">${numbers.split('').map(digit => 
            `<span class="ball ${type}">${digit}</span>`
        ).join('')}</div>`;
    } else if (Array.isArray(numbers)) {
        if (type === 'top2d') {
            // Special handling for TOP 2D BB - 6 sets with alternating colors, 2 sets per row
            let result = '';
            for (let i = 0; i < numbers.length; i += 2) {
                result += '<div class="number-row">';
                
                // First set in row
                if (numbers[i]) {
                    const ballType = (Math.floor(i/2) % 2 === 0) ? 'combo' : 'colok';
                    result += `<div class="number-set">${numbers[i].split('').map(digit => 
                        `<span class="ball ${ballType}">${digit}</span>`
                    ).join('')}</div>`;
                }
                
                // Second set in row
                if (numbers[i + 1]) {
                    const ballType = (Math.floor((i+1)/2) % 2 === 0) ? 'combo' : 'colok';
                    result += `<div class="number-set">${numbers[i + 1].split('').map(digit => 
                        `<span class="ball ${ballType}">${digit}</span>`
                    ).join('')}</div>`;
                }
                
                result += '</div>';
            }
            return result;
        } else {
            // For array of number combinations - each combination on separate line
            return numbers.map(combo => 
                `<div class="number-set">${combo.split('').map(digit => 
                    `<span class="ball ${type}">${digit}</span>`
                ).join('')}</div>`
            ).join('');
        }
    }
    return numbers;
}

// Create Toto Macau card with time slots
function createTotoMacauCard(lottery) {
    return `
        <div class="lottery-card" data-lottery="${lottery.id}">
            <details class="card-details">
                <summary class="card-header" style="background-image: url('${lottery.image}')">
                    <h3>${lottery.name}</h3>
                </summary>
                <div class="card-content">
                    <div class="time-slots">
                        <div class="time-row">
                            <button class="time-btn" onclick="showMacauPrediction('13:00')" data-time="13:00">13:00</button>
                            <button class="time-btn" onclick="showMacauPrediction('16:00')" data-time="16:00">16:00</button>
                        </div>
                        <div class="time-row">
                            <button class="time-btn" onclick="showMacauPrediction('19:00')" data-time="19:00">19:00</button>
                            <button class="time-btn" onclick="showMacauPrediction('22:00')" data-time="22:00">22:00</button>
                        </div>
                        <div class="time-row">
                            <button class="time-btn" onclick="showMacauPrediction('23:00')" data-time="23:00">23:00</button>
                            <button class="time-btn" onclick="showMacauPrediction('00:00')" data-time="00:00">00:00</button>
                        </div>
                    </div>
                    <div class="macau-prediction" id="macau-prediction" style="display: none;">
                        <div class="selected-time" id="selected-time"></div>
                        <div id="prediction-content"></div>
                    </div>
                </div>
            </details>
        </div>
    `;
}

// Create regular lottery card
function createRegularLotteryCard(lottery) {
    const predictions = generatePredictions(lottery.id);
    
    return `
        <div class="lottery-card" data-lottery="${lottery.id}">
            <details class="card-details">
                <summary class="card-header" style="background-image: url('${lottery.image}')">
                    <h3>${lottery.name}</h3>
                </summary>
                <div class="card-content">
                    <div class="prediction-row">
                        <span class="prediction-label">ANGKA MAIN</span>
                        <span class="prediction-value main-number">${formatAsBalls(predictions.angkaMain, 'main')}</span>
                    </div>
                    <div class="prediction-row">
                        <span class="prediction-label">TOP 4D BB</span>
                        <span class="prediction-value">${formatAsBalls(predictions.top4D, 'combo')}</span>
                    </div>
                    <div class="prediction-row">
                        <span class="prediction-label">TOP 3D BB</span>
                        <span class="prediction-value">${formatAsBalls(predictions.top3D, 'combo')}</span>
                    </div>
                    <div class="prediction-row">
                        <span class="prediction-label">TOP 2D BB</span>
                        <span class="prediction-value">${formatAsBalls(predictions.top2D, 'top2d')}</span>
                    </div>
                    <div class="prediction-row">
                        <span class="prediction-label">COLOK BEBAS</span>
                        <span class="prediction-value colok-number">${formatAsBalls(predictions.colokBebas, 'colok')}</span>
                    </div>
                </div>
            </details>
        </div>
    `;
}

// Handle Toto Macau time slot prediction - GLOBAL
window.showMacauPrediction = function(time) {
    // Remove active class from all time buttons
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    document.querySelector(`[data-time="${time}"]`).classList.add('active');
    
    // Generate predictions for this specific time slot
    const predictions = generatePredictions(`totomacau-${time}`);
    
    // Show the prediction area
    const predictionArea = document.getElementById('macau-prediction');
    const selectedTime = document.getElementById('selected-time');
    const predictionContent = document.getElementById('prediction-content');
    
    selectedTime.innerHTML = `<h4>Prediksi ${time}</h4>`;
    
    predictionContent.innerHTML = `
        <div class="prediction-row">
            <span class="prediction-label">ANGKA MAIN</span>
            <span class="prediction-value main-number">${formatAsBalls(predictions.angkaMain, 'main')}</span>
        </div>
        <div class="prediction-row">
            <span class="prediction-label">TOP 4D BB</span>
            <span class="prediction-value">${formatAsBalls(predictions.top4D, 'combo')}</span>
        </div>
        <div class="prediction-row">
            <span class="prediction-label">TOP 3D BB</span>
            <span class="prediction-value">${formatAsBalls(predictions.top3D, 'combo')}</span>
        </div>
        <div class="prediction-row">
            <span class="prediction-label">TOP 2D BB</span>
            <span class="prediction-value">${formatAsBalls(predictions.top2D, 'top2d')}</span>
        </div>
        <div class="prediction-row">
            <span class="prediction-label">COLOK BEBAS</span>
            <span class="prediction-value colok-number">${formatAsBalls(predictions.colokBebas, 'colok')}</span>
        </div>
    `;
    
    predictionArea.style.display = 'block';
};

// Handle navigation - GLOBAL
window.handleNavClick = function(lotteryId) {
    // Remove active from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active to clicked nav item
    const clickedNav = document.querySelector(`[data-lottery="${lotteryId}"]`);
    if (clickedNav) {
        clickedNav.classList.add('active');
    }
    
    // Find and scroll to the card
    const targetCard = document.querySelector(`.lottery-card[data-lottery="${lotteryId}"]`);
    if (targetCard) {
        // Open the details element
        const details = targetCard.querySelector('.card-details');
        if (details && !details.open) {
            details.open = true;
        }
        
        // Scroll to card
        targetCard.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
};

// Display current date in Indonesian
function displayCurrentDate() {
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const now = new Date();
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    
    document.getElementById('current-date').textContent = `${day} ${month} ${year}`;
}

// Initialize lottery cards
function initLotteryCards() {
    const cardsContainer = document.getElementById('cardsContainer');
    cardsContainer.innerHTML = '';
    
    lotteryData.forEach(lottery => {
        if (lottery.id === 'totomacau') {
            cardsContainer.innerHTML += createTotoMacauCard(lottery);
        } else if (lottery.id === 'kingkong') {
            cardsContainer.innerHTML += createKingKongCard(lottery);
        } else {
            cardsContainer.innerHTML += createRegularLotteryCard(lottery);
        }
    });
}

// Filter cards based on search
function filterCards(searchTerm) {
    const cards = document.querySelectorAll('.lottery-card');
    
    cards.forEach(card => {
        const lotteryId = card.dataset.lottery;
        const lottery = lotteryData.find(l => l.id === lotteryId);
        const lotteryName = lottery.name.toLowerCase();
        
        if (lotteryName.includes(searchTerm.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Generate lucky number
function generateLuckyNumber() {
    const luckyNumbers = generateUniqueNumbers(5);
    const luckyNumberElement = document.getElementById('luckyNumber');
    
    // Create ball elements for each digit
    luckyNumberElement.innerHTML = luckyNumbers.map(digit => 
        `<span class="ball">${digit}</span>`
    ).join('');
}

// Check and update predictions at midnight
function checkMidnightUpdate() {
    const now = new Date();
    const lastUpdate = localStorage.getItem('lastPredictionUpdate');
    const today = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    
    if (lastUpdate !== today) {
        initLotteryCards();
        localStorage.setItem('lastPredictionUpdate', today);
    }
}

// Schedule midnight update check
function scheduleMidnightUpdate() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
        checkMidnightUpdate();
        setInterval(checkMidnightUpdate, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
    
    checkMidnightUpdate();
}

// Create KingKong card with time slots
function createKingKongCard(lottery) {
    return `
        <div class="lottery-card" data-lottery="${lottery.id}">
            <details class="card-details">
                <summary class="card-header" style="background-image: url('${lottery.image}')">
                    <h3>${lottery.name}</h3>
                </summary>
                <div class="card-content">
                    <div class="time-slots">
                        <div class="time-row">
                            <button class="time-btn" onclick="showKingKongPrediction('17:00')" data-time="17:00">17:00</button>
                            <button class="time-btn" onclick="showKingKongPrediction('23:00')" data-time="23:00">23:00</button>
                        </div>
                    </div>
                    <div class="kingkong-prediction" id="kingkong-prediction" style="display: none;">
                        <div class="selected-time" id="kingkong-selected-time"></div>
                        <div id="kingkong-prediction-content"></div>
                    </div>
                </div>
            </details>
        </div>
    `;
}

// Handle KingKong time slot prediction - GLOBAL
window.showKingKongPrediction = function(time) {
    // Remove active class from all time buttons
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    document.querySelector(`[data-time="${time}"]`).classList.add('active');
    
    // Generate predictions for this specific time slot
    const predictions = generatePredictions(`kingkong-${time}`);
    
    // Show the prediction area
    const predictionArea = document.getElementById('kingkong-prediction');
    const selectedTime = document.getElementById('kingkong-selected-time');
    const predictionContent = document.getElementById('kingkong-prediction-content');
    
    selectedTime.innerHTML = `<h4>Prediksi ${time}</h4>`;
    
    predictionContent.innerHTML = `
        <div class="prediction-row">
            <span class="prediction-label">ANGKA MAIN</span>
            <span class="prediction-value main-number">${formatAsBalls(predictions.angkaMain, 'main')}</span>
        </div>
        <div class="prediction-row">
            <span class="prediction-label">TOP 4D BB</span>
            <span class="prediction-value">${formatAsBalls(predictions.top4D, 'combo')}</span>
        </div>
        <div class="prediction-row">
            <span class="prediction-label">TOP 3D BB</span>
            <span class="prediction-value">${formatAsBalls(predictions.top3D, 'combo')}</span>
        </div>
        <div class="prediction-row">
            <span class="prediction-label">TOP 2D BB</span>
            <span class="prediction-value">${formatAsBalls(predictions.top2D, 'top2d')}</span>
        </div>
        <div class="prediction-row">
            <span class="prediction-label">COLOK BEBAS</span>
            <span class="prediction-value colok-number">${formatAsBalls(predictions.colokBebas, 'colok')}</span>
        </div>
    `;
    
    predictionArea.style.display = 'block';
};

// Initialize app
function init() {
    // Display current date
    displayCurrentDate();
    
    // Initialize lottery cards
    initLotteryCards();
    
    // Schedule midnight updates
    scheduleMidnightUpdate();
    
    // Add search functionality
    document.getElementById('searchInput').addEventListener('input', (e) => {
        filterCards(e.target.value);
    });
    
    // Lucky number popup functionality
    const luckyBtn = document.getElementById('luckyBtn');
    const popupOverlay = document.getElementById('popupOverlay');
    const closePopup = document.getElementById('closePopup');
    const generateLucky = document.getElementById('generateLucky');
    
    luckyBtn.addEventListener('click', () => {
        generateLuckyNumber();
        popupOverlay.classList.add('active');
    });
    
    closePopup.addEventListener('click', () => {
        popupOverlay.classList.remove('active');
    });
    
    generateLucky.addEventListener('click', () => {
        generateLuckyNumber();
    });
    
    // Close popup when clicking outside
    popupOverlay.addEventListener('click', (e) => {
        if (e.target === popupOverlay) {
            popupOverlay.classList.remove('active');
        }
    });
    
    // Generate initial lucky number
    generateLuckyNumber();
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
