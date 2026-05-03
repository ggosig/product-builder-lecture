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
            alert('라이브러리 로드 중입니다. 잠시 후 다시 시도해 주세요.');
            return;
        }

        const solar = SolarObj.fromYmdHms(year, month, day, hour, minute, 0);
        const lunar = solar.getLunar();
        const eightChar = lunar.getEightChar();

        // 1. 사주 팔자 표시
        document.getElementById('res-name').textContent = name;
        document.getElementById('saju-year').textContent = eightChar.getYear();
        document.getElementById('saju-month').textContent = eightChar.getMonth();
        document.getElementById('saju-day').textContent = eightChar.getDay();
        document.getElementById('saju-hour').textContent = eightChar.getTime();

        // 2. 오행 분석 및 퍼센테이지 계산
        const wuxingData = [
            eightChar.getYearWuXing(),
            eightChar.getMonthWuXing(),
            eightChar.getDayWuXing(),
            eightChar.getTimeWuXing()
        ];

        const counts = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
        wuxingData.forEach(p => {
            for (let char of p) {
                if (counts.hasOwnProperty(char)) counts[char]++;
            }
        });

        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        const elements = [
            { id: 'wood', key: '목' },
            { id: 'fire', key: '화' },
            { id: 'earth', key: '토' },
            { id: 'metal', key: '금' },
            { id: 'water', key: '수' }
        ];

        elements.forEach(el => {
            const percent = Math.round((counts[el.key] / total) * 100);
            document.getElementById(`bar-${el.id}`).style.width = percent + '%';
            document.getElementById(`val-${el.id}`).textContent = percent + '%';
        });

        // 3. 텍스트 해석 생성
        const dayPillar = eightChar.getDay();
        const dayMaster = dayPillar.charAt(0);
        const interpretations = generateInterpretations(dayMaster, gender, counts);
        
        document.getElementById('res-general').textContent = interpretations.general;
        document.getElementById('res-2026').textContent = interpretations.fortune2026;
        document.getElementById('res-wealth').textContent = interpretations.wealth;

        document.getElementById('analysis-result').classList.remove('hidden');
        document.getElementById('analysis-result').scrollIntoView({ behavior: 'smooth' });

    } catch (e) {
        console.error(e);
        alert('분석 중 오류가 발생했습니다. (오류 내용: ' + e.message + ')');
    }
});

function generateInterpretations(dayMaster, gender, counts) {
    const wuxingNames = { '甲': '목', '乙': '목', '丙': '화', '丁': '화', '戊': '토', '己': '토', '庚': '금', '辛': '금', '壬': '수', '癸': '수' };
    const me = wuxingNames[dayMaster];
    
    // 강점 기운 찾기
    const strongest = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    
    let general = `당신은 ${me}의 기운을 가진 ${gender === 'male' ? '남성' : '여성'}으로, 사주에 ${strongest}의 기운이 가장 강하게 나타납니다. `;
    if (me === '목') general += "수직으로 성장하는 나무처럼 진취적이고 인자한 성품을 지녔습니다.";
    else if (me === '화') general += "타오르는 불꽃처럼 열정적이고 예의를 중시하는 밝은 성격입니다.";
    else if (me === '토') general += "넓은 대지처럼 포용력이 있고 믿음직스러운 신용의 소유자입니다.";
    else if (me === '금') general += "단단한 바위나 칼처럼 결단력이 있고 의리가 강한 성향입니다.";
    else if (me === '수') general += "흐르는 물처럼 지혜롭고 유연하며 세상의 이치에 밝습니다.";

    let fortune2026 = "2026년 병오년(丙午年)은 강한 '화(火)'의 기운이 들어오는 해입니다. ";
    if (me === '수') fortune2026 += "뜨거운 열기가 지혜로운 물을 만나 증발하지 않도록 안정이 필요한 시기입니다.";
    else if (me === '목') fortune2026 += "나무가 불을 만나 활활 타오르니, 자신의 재능을 세상에 널리 알릴 기회가 옵니다.";
    else fortune2026 += "역동적인 변화가 예상되니, 급한 결정보다는 신중한 태도로 기회를 잡으시길 바랍니다.";

    let wealth = `현재 사주에서 ${strongest} 기운이 과다할 수 있으니, `;
    if (counts[strongest] >= 3) wealth += "한쪽으로 치우친 기운을 조절하기 위해 절제와 균형 잡힌 생활이 필수적입니다. ";
    wealth += "부족한 기운을 보완하는 색상이나 장소(예: " + (counts['수'] < 1 ? "물 근처, 푸른색" : "산책, 녹색") + ")를 가까이하면 운이 상승합니다.";

    return { general, fortune2026, wealth };
}
