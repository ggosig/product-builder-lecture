const generatorBtn = document.getElementById('generator-btn');
const numberContainers = document.querySelectorAll('.number');
const themeBtn = document.getElementById('theme-btn');
const body = document.body;

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.classList.add(savedTheme);
    themeBtn.textContent = savedTheme === 'dark-mode' ? 'Light Mode' : 'Dark Mode';
}

themeBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    
    if (isDarkMode) {
        localStorage.setItem('theme', 'dark-mode');
        themeBtn.textContent = 'Light Mode';
    } else {
        localStorage.setItem('theme', '');
        themeBtn.textContent = 'Dark Mode';
    }
});

generatorBtn.addEventListener('click', () => {
    const lottoNumbers = [];
    while (lottoNumbers.length < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        if (!lottoNumbers.includes(randomNumber)) {
            lottoNumbers.push(randomNumber);
        }
    }

    numberContainers.forEach((container, index) => {
        container.textContent = lottoNumbers[index];
        container.style.backgroundColor = getRandomColor();
    });
});

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
