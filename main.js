// Theme Toggle Logic
const themeBtn = document.getElementById('theme-btn');
const body = document.body;

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.classList.add(savedTheme);
    themeBtn.textContent = savedTheme === 'dark-mode' ? '라이트 모드' : '다크 모드';
}

themeBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    
    if (isDarkMode) {
        localStorage.setItem('theme', 'dark-mode');
        themeBtn.textContent = '라이트 모드';
    } else {
        localStorage.setItem('theme', '');
        themeBtn.textContent = '다크 모드';
    }
});

// Saju Analysis Logic
document.getElementById('analyze-btn').addEventListener('click', () => {
    const name = document.getElementById('saju-name').value;
    const birthDate = document.getElementById('saju-birth-date').value;
    const birthTime = document.getElementById('saju-birth-time').value;
    const gender = document.getElementById('saju-gender').value;

    if (!name || !birthDate || !birthTime) {
        alert('모든 정보를 입력해 주세요.');
        return;
    }

    const dateParts = birthDate.split('-');
    const timeParts = birthTime.split(':');
    
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]);
    const day = parseInt(dateParts[2]);
    const hour = parseInt(timeParts[0]);
    const minute = parseInt(timeParts[1]);

    // Create Solar object from lunar-javascript
    // Note: Solar, Lunar, etc. are global objects if included via script tag
    try {
        const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
        const lunar = solar.getLunar();
        const eightChar = lunar.getEightChar();

        // Display Result
        document.getElementById('res-name').textContent = name;
        document.getElementById('saju-year').textContent = eightChar.getYear();
        document.getElementById('saju-month').textContent = eightChar.getMonth();
        document.getElementById('saju-day').textContent = eightChar.getDay();
        document.getElementById('saju-hour').textContent = eightChar.getHour();

        // Generate Interpretations
        const dayMaster = eightChar.getDay().charAt(0); // 일간 (Day Master)
        const interpretations = generateInterpretations(dayMaster, eightChar.getYear(), gender);
        
        document.getElementById('res-general').textContent = interpretations.general;
        document.getElementById('res-2026').textContent = interpretations.fortune2026;

        // Show Result Section
        document.getElementById('analysis-result').classList.remove('hidden');
        document.getElementById('analysis-result').scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
        console.error(e);
        alert('사주 분석 중 오류가 발생했습니다. 입력 형식을 확인해 주세요.');
    }
});

function generateInterpretations(dayMaster, yearPillar, gender) {
    const wuxing = {
        '甲': '목(木) - 큰 나무', '乙': '목(木) - 화초',
        '丙': '화(火) - 태양', '丁': '화(火) - 등불',
        '戊': '토(土) - 넓은 대지', '己': '토(土) - 텃밭',
        '庚': '금(金) - 바위/칼', '辛': '금(金) - 보석',
        '壬': '수(水) - 호수/바다', '癸': '수(水) - 빗물'
    };

    const masterName = wuxing[dayMaster] || '알 수 없음';
    
    let general = `${masterName}의 기운을 타고나셨습니다. `;
    
    if (['甲', '乙'].includes(dayMaster)) {
        general += "성장과 발전의 에너지가 강하며, 추진력이 좋고 어진 성품을 지니셨습니다. 주변 사람들을 돌보는 리더십이 돋보입니다.";
    } else if (['丙', '丁'].includes(dayMaster)) {
        general += "열정적이고 화려한 기운을 가졌으며, 예의가 바르고 명랑한 성격입니다. 창의적인 분야에서 두각을 나타낼 가능성이 높습니다.";
    } else if (['戊', '己'].includes(dayMaster)) {
        general += "안정감 있고 믿음직한 성품으로, 포용력이 넓어 조율자 역할을 잘 수행합니다. 결실을 맺는 능력이 탁월합니다.";
    } else if (['庚', '辛'].includes(dayMaster)) {
        general += "결단력이 있고 의리가 강하며, 세밀하고 완벽을 추구하는 경향이 있습니다. 시시비비를 가리는 통찰력이 뛰어납니다.";
    } else if (['壬', '癸'].includes(dayMaster)) {
        general += "지혜롭고 유연한 사고방식을 가졌으며, 적응력이 뛰어나고 생각이 깊습니다. 보이지 않는 곳에서 흐름을 읽는 능력이 있습니다.";
    } else {
        general += "균형 잡힌 시각으로 세상을 바라보며, 자신만의 길을 묵묵히 걸어가는 기질이 있습니다.";
    }

    let fortune2026 = "2026년 병오년(丙午년)은 강한 불의 기운이 지배하는 해입니다. ";
    
    if (['甲', '乙'].includes(dayMaster)) {
        fortune2026 += "나무가 불을 만나는 형국으로, 본인의 재능이 널리 알려지고 활동 범위가 넓어지는 시기입니다. 다만 지나친 에너지 소모에 주의하십시오.";
    } else if (['丙', '丁'].includes(dayMaster)) {
        fortune2026 += "불과 불이 만나는 해로 경쟁이 치열해질 수 있으나, 본인의 열정을 불태울 좋은 동료를 만날 수 있는 운입니다. 독단적인 행동은 피하는 것이 좋습니다.";
    } else if (['戊', '己'].includes(dayMaster)) {
        fortune2026 += "불이 흙을 돕는 화생토(火生土)의 흐름으로, 문서운이나 합격운이 따르며 주변의 도움을 받아 안정적인 성과를 거두는 길한 해가 될 것입니다.";
    } else if (['庚', '辛'].includes(dayMaster)) {
        fortune2026 += "강한 열기가 금을 제련하는 시기로, 변화와 혁신이 일어나는 해입니다. 직장이나 주거지 이동 등 새로운 시작을 하기에 적합한 시기입니다.";
    } else if (['壬', '癸'].includes(dayMaster)) {
        fortune2026 += "불이 물의 기운을 억제하려 하니 갈등이 생길 수 있으나, 이를 지혜롭게 극복하면 큰 재물운을 거머쥘 수 있는 기회의 해가 될 것입니다.";
    } else {
        fortune2026 += "새로운 도전의 기회가 찾아오는 해이며, 주변의 조언을 귀담아듣는다면 예상치 못한 성과를 거둘 수 있습니다.";
    }

    return { general, fortune2026 };
}
