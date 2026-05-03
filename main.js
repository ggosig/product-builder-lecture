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
    const gender = document.getElementById('saju-gender').value;
    const birthDate = document.getElementById('saju-birth-date').value;
    const birthTime = document.getElementById('saju-birth-time').value;

    if (!name || !birthDate || !birthTime) {
        alert('이름, 생년월일, 시간을 모두 입력해 주세요.');
        return;
    }

    try {
        const dateParts = birthDate.split('-');
        const timeParts = birthTime.split(':');
        
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        const day = parseInt(dateParts[2]);
        const hour = parseInt(timeParts[0]);
        const minute = parseInt(timeParts[1]);

        let SolarObj;
        if (typeof Solar !== 'undefined') {
            SolarObj = Solar;
        } else if (typeof Lunar !== 'undefined' && Lunar.Solar) {
            SolarObj = Lunar.Solar;
        }

        if (!SolarObj) {
            alert('사주 분석 라이브러리를 불러오지 못했습니다. 페이지를 새로고침 해주세요.');
            return;
        }

        const solar = SolarObj.fromYmdHms(year, month, day, hour, minute, 0);
        const lunar = solar.getLunar();
        const eightChar = lunar.getEightChar();

        // Display results with correct method names
        document.getElementById('res-name').textContent = name;
        document.getElementById('saju-year').textContent = eightChar.getYear();
        document.getElementById('saju-month').textContent = eightChar.getMonth();
        document.getElementById('saju-day').textContent = eightChar.getDay();
        document.getElementById('saju-hour').textContent = eightChar.getTime(); // Corrected from getHour()

        const dayPillar = eightChar.getDay();
        const dayMaster = dayPillar.charAt(0);
        
        const interpretations = generateInterpretations(dayMaster, gender);
        
        document.getElementById('res-general').textContent = interpretations.general;
        document.getElementById('res-2026').textContent = interpretations.fortune2026;
        document.getElementById('res-wealth').textContent = interpretations.wealth;

        document.getElementById('analysis-result').classList.remove('hidden');
        document.getElementById('analysis-result').scrollIntoView({ behavior: 'smooth' });

    } catch (e) {
        console.error("Saju Analysis Error:", e);
        alert('분석 중 오류가 발생했습니다. (오류 내용: ' + e.message + ')');
    }
});

function generateInterpretations(dayMaster, gender) {
    const wuxing = {
        '甲': '목(木)', '乙': '목(木)', '丙': '화(火)', '丁': '화(火)', '戊': '토(토)',
        '己': '토(토)', '庚': '금(금)', '辛': '금(금)', '壬': '수(수)', '癸': '수(수)'
    };
    const element = wuxing[dayMaster] || '알 수 없음';
    
    let general = `당신은 ${element}의 기운을 타고난 ${gender === 'male' ? '남성' : '여성'}입니다. `;
    if (element.includes('목')) general += "꾸준히 성장하려는 의지가 강하며 인자한 성품을 가졌습니다.";
    else if (element.includes('화')) general += "열정적이고 밝으며 주변을 환하게 만드는 매력이 있습니다.";
    else if (element.includes('토')) general += "믿음직스럽고 포용력이 넓어 사람들의 중심이 되는 역할을 합니다.";
    else if (element.includes('금')) general += "결단력이 있고 의리가 강하며 명확한 원칙을 가지고 살아갑니다.";
    else if (element.includes('수')) general += "지혜롭고 유연하며 세상의 흐름을 잘 읽는 능력이 있습니다.";

    let fortune2026 = "2026년 병오년(丙午年)은 당신에게 새로운 전환점이 될 것입니다. ";
    if (element.includes('목')) fortune2026 += "재능을 널리 알리고 활동 범위를 넓히기에 아주 좋은 해입니다.";
    else if (element.includes('화')) fortune2026 += "강한 열정으로 목표를 달성할 수 있으나 독단적인 태도는 주의가 필요합니다.";
    else if (element.includes('토')) fortune2026 += "주변의 도움으로 안정적인 성과를 거두며 내실을 기하는 해가 될 것입니다.";
    else if (element.includes('금')) fortune2026 += "과감한 도전이 성과로 이어지며 직업적으로 큰 도약이 가능한 시기입니다.";
    else if (element.includes('수')) fortune2026 += "지혜로운 판단으로 재물을 모으고 명예를 얻을 수 있는 길한 흐름입니다.";

    let wealth = "재물운은 노력이 결실을 맺는 안정적인 흐름을 보입니다. ";
    wealth += "건강 면에서는 규칙적인 생활 습관이 운의 흐름을 더욱 좋게 할 것입니다.";

    return { general, fortune2026, wealth };
}
