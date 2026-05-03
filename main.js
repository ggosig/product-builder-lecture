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
    const gender = document.getElementById('saju-gender').value;
    const birthDate = document.getElementById('saju-birth-date').value;
    const birthTime = document.getElementById('saju-birth-time').value;

    if (!birthDate || !birthTime) {
        alert('생년월일과 시간을 모두 입력해 주세요.');
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

        const elementMap = { '木': '목', '火': '화', '土': '토', '金': '금', '水': '수' };
        const counts = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
        
        wuxingData.forEach(p => {
            if (p) {
                for (let char of p) {
                    const kr = elementMap[char] || char;
                    if (counts.hasOwnProperty(kr)) counts[kr]++;
                }
            }
        });

        const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
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

        // 3. 해석 및 궁합 생성
        const dayPillar = eightChar.getDay();
        const dayMaster = dayPillar.charAt(0);
        const interpretations = generateInterpretations(dayMaster, gender, counts);
        
        document.getElementById('res-general').textContent = interpretations.general;
        document.getElementById('res-2026').textContent = interpretations.fortune2026;
        document.getElementById('res-wealth').textContent = interpretations.wealth;

        // 4. 궁합 추천 표시
        const compatibilityList = document.getElementById('compatibility-list');
        compatibilityList.innerHTML = '';
        interpretations.bestMatches.forEach(match => {
            const div = document.createElement('div');
            div.className = 'compatibility-item';
            div.style.marginBottom = '20px';
            div.style.padding = '15px';
            div.style.backgroundColor = 'var(--container-bg)';
            div.style.borderRadius = '10px';
            div.innerHTML = `<strong style="color: var(--accent-color); font-size: 1.1rem;">${match.title}</strong><p style="margin-top: 5px; font-size: 0.95rem;">${match.reason}</p>`;
            compatibilityList.appendChild(div);
        });

        document.getElementById('analysis-result').classList.remove('hidden');
        document.getElementById('analysis-result').scrollIntoView({ behavior: 'smooth' });

    } catch (e) {
        console.error(e);
        alert('분석 중 오류가 발생했습니다. (오류 내용: ' + e.message + ')');
    }
});

function generateInterpretations(dayMaster, gender, counts) {
    const wuxingNames = { 
        '甲': '목', '乙': '목', '丙': '화', '丁': '화', '戊': '토', 
        '己': '토', '庚': '금', '辛': '금', '壬': '수', '癸': '수',
        '목': '목', '화': '화', '토': '토', '금': '금', '수': '수'
    };
    const me = wuxingNames[dayMaster] || dayMaster;
    const strongest = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    
    // 성품 해석
    let general = `당신은 ${me}의 기운을 가진 ${gender === 'male' ? '남성' : '여성'}으로, 사주에 ${strongest}의 기운이 가장 강하게 나타납니다. `;
    if (me === '목') general += "수직으로 성장하는 나무처럼 진취적이고 인자한 성품을 지녔습니다.";
    else if (me === '화') general += "타오르는 불꽃처럼 열정적이고 예의를 중시하는 밝은 성격입니다.";
    else if (me === '토') general += "넓은 대지처럼 포용력이 있고 믿음직스러운 신용의 소유자입니다.";
    else if (me === '금') general += "단단한 바위나 칼처럼 결단력이 있고 의리가 강한 성향입니다.";
    else if (me === '수') general += "흐르는 물처럼 지혜롭고 유연하며 세상의 이치에 밝습니다.";

    // 2026년 운세
    let fortune2026 = "2026년 병오년(丙午年)은 강한 '화(火)'의 기운이 들어오는 해입니다. ";
    if (me === '수') fortune2026 += "뜨거운 열기가 지혜로운 물을 만나 증발하지 않도록 안정이 필요한 시기입니다.";
    else if (me === '목') fortune2026 += "나무가 불을 만나 활활 타오르니, 자신의 재능을 세상에 널리 알릴 기회가 옵니다.";
    else fortune2026 += "역동적인 변화가 예상되니, 급한 결정보다는 신중한 태도로 기회를 잡으시길 바랍니다.";

    // 상세 운세
    let wealth = `현재 사주에서 ${strongest} 기운이 과다할 수 있으니, `;
    if (counts[strongest] >= 3) wealth += "한쪽으로 치우친 기운을 조절하기 위해 절제와 균형 잡힌 생활이 필수적입니다. ";
    wealth += "부족한 기운을 보완하는 색상이나 장소(예: " + (counts['수'] < 1 ? "물 근처, 푸른색" : "산책, 녹색") + ")를 가까이하면 운이 상승합니다.";

    // 궁합 추천 로직
    const matches = {
        '목': [
            { title: '수(水) 기운이 강한 사주', reason: '수생목(水生木)의 원리에 따라 물이 나무를 길러주듯 당신을 정신적으로 지지하고 성장을 돕는 최고의 파트너입니다.' },
            { title: '화(火) 기운이 강한 사주', reason: '목생화(木生火)의 관계로 당신의 재능과 열정을 밖으로 끌어내어 빛나게 해주는 궁합입니다.' },
            { title: '토(土) 기운이 강한 사주', reason: '나무가 땅에 뿌리를 내리듯 당신에게 안정적인 기반과 현실적인 결실을 제공해 줍니다.' },
            { title: '천간 합(甲己) 사주', reason: '서로의 부족한 부분을 채워주며 조화로운 관계를 유지할 수 있는 인연입니다.' },
            { title: '음양의 조화가 맞는 사주', reason: '당신의 강한 진취성을 부드럽게 감싸 안아 정서적 안정을 주는 관계입니다.' }
        ],
        '화': [
            { title: '목(木) 기운이 강한 사주', reason: '목생화(木生火)의 원리로 당신의 열정이 식지 않도록 끊임없이 영감과 에너지를 공급해 주는 귀인입니다.' },
            { title: '토(土) 기운이 강한 사주', reason: '화생토(火生土)의 관계로 당신의 뜨거운 기운을 받아들여 실질적인 성과물로 만들어주는 든든한 조력자입니다.' },
            { title: '금(金) 기운이 강한 사주', reason: '당신의 결단력을 자극하여 더 큰 목표를 향해 나아가게 만드는 도전적인 시너지를 냅니다.' },
            { title: '천간 합(丙辛) 사주', reason: '첫눈에 반하기 쉬운 강한 끌림이 있으며, 서로의 카리스마를 존중하는 관계입니다.' },
            { title: '수(水) 기운이 적절한 사주', reason: '과열되기 쉬운 당신의 기운을 차분하게 조절해 주어 이성적인 판단을 돕습니다.' }
        ],
        '토': [
            { title: '화(火) 기운이 강한 사주', reason: '화생토(火生土)의 원리로 대지를 따뜻하게 데워주듯 당신의 포용력을 넓히고 자신감을 북돋워 줍니다.' },
            { title: '금(金) 기운이 강한 사주', reason: '토생금(土生金)의 관계로 당신이 가진 잠재력을 보석처럼 다듬어 세상에 드러나게 해줍니다.' },
            { title: '목(木) 기운이 적절한 사주', reason: '무기력해지기 쉬운 땅을 일구어 활력을 불어넣고 새로운 변화를 주도하게 돕습니다.' },
            { title: '천간 합(戊癸) 사주', reason: '서로에 대한 신뢰가 매우 두터우며, 안정적이고 평화로운 관계를 지속할 수 있습니다.' },
            { title: '수(水) 기운이 풍부한 사주', reason: '당신에게 필요한 유연함과 재물적 기회를 끊임없이 제공해 주는 길한 인연입니다.' }
        ],
        '금': [
            { title: '토(土) 기운이 강한 사주', reason: '토생금(土生金)의 원리로 흙 속의 원석을 찾아내듯 당신의 가치를 알아봐 주고 끝까지 믿어주는 지지자입니다.' },
            { title: '수(水) 기운이 강한 사주', reason: '금생수(金生水)의 관계로 당신의 날카로운 성정을 부드럽게 정화하고 지혜로운 삶의 방향을 제시합니다.' },
            { title: '목(木) 기운이 강한 사주', reason: '당신의 결단력을 발휘할 수 있는 명확한 목표와 대상을 제공하여 성취감을 느끼게 합니다.' },
            { title: '천간 합(乙庚) 사주', reason: '강함과 부드러움이 만나는 이상적인 궁합으로, 서로를 보완하며 큰 발전을 이룹니다.' },
            { title: '화(火) 기운이 적절한 사주', reason: '원석을 제련하여 쓸모 있는 도구로 만들듯 당신을 더욱 완성도 높은 사람으로 성장시킵니다.' }
        ],
        '수': [
            { title: '금(金) 기운이 강한 사주', reason: '금생수(金生水)의 원리로 마르지 않는 샘물처럼 당신에게 끊임없는 지식과 자원을 공급해 주는 후원자입니다.' },
            { title: '목(木) 기운이 강한 사주', reason: '수생목(水生木)의 관계로 당신의 지혜가 결실을 맺을 수 있도록 실질적인 활동 무대를 제공합니다.' },
            { title: '토(土) 기운이 적절한 사주', reason: '흐르는 물이 길을 잃지 않도록 제방이 되어주듯 당신의 삶에 명확한 규범과 안정을 가져다줍니다.' },
            { title: '천간 합(丁壬) 사주', reason: '정서적으로 깊은 공감을 나누며, 함께 있을 때 가장 편안함을 느끼는 소울메이트입니다.' },
            { title: '화(火) 기운이 풍부한 사주', reason: '당신의 차가운 기운을 녹여 활동적으로 변화시키며 재물적인 행운을 함께 가져옵니다.' }
        ]
    };

    const bestMatches = matches[me] || matches['목']; // Fallback

    return { general, fortune2026, wealth, bestMatches };
}
