// Helper function to generate a random number between min and max
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a unique 5-digit random number for BB 5
function generateBB5() {
    const digits = new Set();
    while (digits.size < 5) {
        digits.add(getRandomNumber(0, 9));
    }
    return Array.from(digits).join('');
}

// Generate 5 unique 2-digit numbers for 2d TOP
function generateTop2D() {
    const numbers = new Set();
    while (numbers.size < 5) {
        const number = getRandomNumber(10, 99);
        numbers.add(number);
    }
    return Array.from(numbers).join(' ');
}

// Generate a 1-digit random number for CB
function generateCB() {
    return getRandomNumber(0, 9);
}

// Store numbers in local storage with the current date as key
function storeNumbers(numbers) {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(today, JSON.stringify(numbers));
}

// Retrieve numbers from local storage for the current date
function retrieveNumbers() {
    const today = new Date().toISOString().split('T')[0];
    return JSON.parse(localStorage.getItem(today));
}

// Generate and display random numbers for today
function displayNumbers() {
    let numbers = retrieveNumbers();

    if (!numbers) {
        numbers = {};
        for (let i = 1; i <= 9; i++) {
            numbers[`bb5-${i}`] = generateBB5();
            numbers[`top2d-${i}`] = generateTop2D();
            numbers[`cb-${i}`] = generateCB();
        }
        storeNumbers(numbers);
    }

    for (let i = 1; i <= 9; i++) {
        document.getElementById(`bb5-${i}`).textContent = numbers[`bb5-${i}`];
        document.getElementById(`top2d-${i}`).textContent = numbers[`top2d-${i}`];
        document.getElementById(`cb-${i}`).textContent = numbers[`cb-${i}`];
    }
}

// Schedule the numbers to reset daily at 00:05 GMT+7
function scheduleDailyGeneration() {
    const now = new Date();
    const target = new Date();
    target.setUTCHours(17, 5, 0, 0); // 00:05 GMT+7 is 17:05 UTC

    if (now >= target) {
        target.setDate(target.getDate() + 1);
    }

    const millisTillReset = target - now;

    setTimeout(function () {
        localStorage.removeItem(new Date().toISOString().split('T')[0]); // Clear today's data
        displayNumbers();
        setInterval(function () {
            localStorage.removeItem(new Date().toISOString().split('T')[0]); // Clear today's data
            displayNumbers();
        }, 86400000); // 24 hours in milliseconds
    }, millisTillReset);
}

document.addEventListener('DOMContentLoaded', (event) => {
    displayNumbers(); // Initial display
    scheduleDailyGeneration();
});
