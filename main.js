const generatorBtn = document.getElementById('generator-btn');
const numberContainers = document.querySelectorAll('.number');

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
