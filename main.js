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

// Hanja to Korean Mapping for GanZhi
const ganZhiMap = {
    '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무', '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계',
    '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사', '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해'
};

function toKorean(ganzhi) {
    if (!ganzhi) return '';
    return ganzhi.split('').map(char => ganZhiMap[char] || char).join('');
}

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

        // 1. 사주 팔자 표시 (Hanja + Korean)
        const pillars = [
            { id: 'saju-year', value: eightChar.getYear() },
            { id: 'saju-month', value: eightChar.getMonth() },
            { id: 'saju-day', value: eightChar.getDay() },
            { id: 'saju-hour', value: eightChar.getTime() }
        ];

        pillars.forEach(p => {
            const hanja = p.value;
            const korean = toKorean(hanja);
            document.getElementById(p.id).innerHTML = hanja + '<br><span style="font-size: 0.9rem; writing-mode: horizontal-tb; letter-spacing: 0; margin-top: 8px; display: block; color: var(--secondary-text); font-weight: normal;">(' + korean + ')</span>';
        });

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
            document.getElementById('bar-' + el.id).style.width = percent + '%';
            document.getElementById('val-' + el.id).textContent = percent + '%';
        });

        // 3. 오늘의 운세 계산
        const todaySolar = SolarObj.fromDate(new Date());
        const todayLunar = todaySolar.getLunar();
        const todayEightChar = todayLunar.getEightChar();
        const todayDayGan = todayEightChar.getDayGan();

        // 4. 해석 및 궁합 생성
        const dayPillar = eightChar.getDay();
        const dayMaster = dayPillar.charAt(0); // 일간 (Hanja)
        const interpretations = generateInterpretations(dayMaster, gender, counts, todayDayGan);
        
        document.getElementById('res-general').textContent = interpretations.general;
        document.getElementById('res-2026').textContent = interpretations.fortune2026;
        document.getElementById('res-wealth').textContent = interpretations.wealth;

        const now = new Date();
        document.getElementById('today-date').textContent = '분석 일시: ' + now.getFullYear() + '년 ' + (now.getMonth() + 1) + '월 ' + now.getDate() + '일 (' + todayEightChar.getDay() + '일)';
        document.getElementById('res-daily-fortune').textContent = interpretations.dailyFortune;
        document.getElementById('res-daily-advice').innerText = interpretations.dailyAdvice;

        // 5. 궁합 추천 표시
        const compatibilityList = document.getElementById('compatibility-list');
        compatibilityList.innerHTML = '';
        interpretations.bestMatches.forEach(match => {
            const div = document.createElement('div');
            div.className = 'compatibility-item';
            div.style.marginBottom = '20px';
            div.style.padding = '20px';
            div.style.backgroundColor = 'var(--container-bg)';
            div.style.borderRadius = '10px';
            div.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
            div.innerHTML = '<strong style="color: var(--accent-color); font-size: 1.15rem; display: block; margin-bottom: 10px;">' + match.title + '</strong><p style="font-size: 0.95rem; line-height: 1.7;">' + match.reason + '</p>';
            compatibilityList.appendChild(div);
        });

        document.getElementById('analysis-result').classList.remove('hidden');
        document.getElementById('analysis-result').scrollIntoView({ behavior: 'smooth' });

    } catch (e) {
        console.error(e);
        alert('분석 중 오류가 발생했습니다. (오류 내용: ' + e.message + ')');
    }
});

function generateInterpretations(dayMasterHanja, gender, counts, todayDayGanHanja) {
    const wuxingNames = { '甲': '목', '乙': '목', '丙': '화', '丁': '화', '戊': '토', '己': '토', '庚': '금', '辛': '금', '壬': '수', '癸': '수' };
    const ganIndex = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const meIdx = ganIndex.indexOf(dayMasterHanja);
    const todayIdx = ganIndex.indexOf(todayDayGanHanja);
    
    const me = wuxingNames[dayMasterHanja];
    const strongest = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

    let general = '당신은 만물의 생명력을 상징하는 ' + me + '의 기운을 타고난 ' + (gender === 'male' ? '남성' : '여성') + '입니다. 명리학적으로 ' + me + '은 ' + (me === '목' ? '성장과 인자함' : me === '화' ? '열정과 예절' : me === '토' ? '신용과 중용' : me === '금' ? '의리와 결단' : '지혜와 유연함') + '을 의미하며, 이는 당신의 삶 전반에 걸쳐 강력한 신념으로 작용합니다. 특히 현재 사주에서는 ' + strongest + '의 에너지가 매우 강하게 자리 잡고 있어, 남들보다 뛰어난 추진력과 리더십을 발휘할 수 있는 잠재력을 가졌습니다. 다만 강한 기운이 때로는 독단적인 고집으로 비춰질 수 있으니 타인의 의견을 수렴하는 포용력을 기른다면 더욱 완벽한 운의 흐름을 탈 수 있습니다.';

    let fortune2026 = '2026년 병오년(丙午年)은 천간의 뜨거운 태양과 지지의 활활 타오르는 불이 만나는 역동적인 "붉은 말"의 해입니다. 당신의 ' + me + ' 기운이 이 강력한 화(火)의 에너지를 만났을 때, 삶의 무대가 확장되는 커다란 변화를 겪게 될 것입니다. 상반기에는 기존에 추진하던 일들이 가속도를 내며 성과를 보이기 시작할 것이며, 하반기에는 새로운 인연이나 기회가 찾아와 인생의 전환점을 맞이할 가능성이 높습니다. 다만 급격한 기운의 변화로 인해 감정 기복이 생길 수 있으니, 중요한 결정은 반드시 차분한 상태에서 내리시길 권장하며 과감한 도전이 큰 결실로 이어지는 한 해가 될 것입니다.';

    let wealth = '재물운의 관점에서 보면, 현재 ' + strongest + ' 기운이 강하게 작용하여 공격적인 투자보다는 실리를 챙기는 안정적인 자산 관리가 유리한 시기입니다. 2026년에는 특히 문서와 관련된 행운이 따르니 부동산 계약이나 장기적인 저축 계획을 세우기에 아주 적합합니다. 건강 면에서는 사주의 불균형으로 인해 ' + (me === '목' ? '간과 신경계' : me === '화' ? '심혈관 질환' : me === '토' ? '위장 및 소화기' : me === '금' ? '호흡기 및 대장' : '신장 및 방광') + ' 계통의 피로도가 높을 수 있습니다. 규칙적인 운동과 함께 ' + (counts['수'] < 1 ? '충분한 수분 섭취' : '차분한 명상') + '을 생활화하여 체내 기운을 조절하는 것이 재물운을 지키는 가장 중요한 기초가 될 것입니다.';

    const diff = (todayIdx - meIdx + 10) % 10;
    let dailyFortune = "";
    let dailyAdvice = "";

    if (diff === 0 || diff === 1) {
        dailyFortune = "나와 대등한 기운이 들어오는 '비겁'의 날입니다. 주체성이 강해지고 동료와의 협력이 중요해집니다.";
        dailyAdvice = "오늘의 행동 지침:\n\n1. 동료나 친구와 점심 식사를 하며 유대감을 강화하세요.\n2. 본인의 전문성을 발휘할 수 있는 제안을 당당히 하십시오.\n3. 다만 지나친 경쟁심은 불필요한 마찰을 부르니 주의하세요.\n4. 운동을 통해 넘치는 에너지를 건강하게 발산해 보세요.\n\n오늘은 자신의 영역을 확고히 다지면서도 주변과 조화를 이루는 지혜가 필요한 날입니다.";
    } else if (diff === 2 || diff === 3) {
        dailyFortune = "나의 재능과 에너지를 밖으로 표출하는 '식상'의 날입니다. 창의력이 번뜩이고 표현력이 좋아집니다.";
        dailyAdvice = "오늘의 행동 지침:\n\n1. 새로운 기획안을 작성하거나 아이디어 회의에 참여하세요.\n2. 평소 하고 싶었던 말을 논리적이고 부드럽게 전달해 보세요.\n3. 예술적인 활동이나 취미 생활에 몰입하기에 최적인 날입니다.\n4. 구설수를 피하기 위해 말하기 전 한 번 더 생각하십시오.\n\n당신의 말과 행동이 타인에게 영감을 주고 실질적인 변화를 이끌어내는 역동적인 하루가 될 것입니다.";
    } else if (diff === 4 || diff === 5) {
        dailyFortune = "현실적인 성과와 결실을 맺는 '재성'의 날입니다. 경제적 감각이 예리해지고 목표 달성 운이 따릅니다.";
        dailyAdvice = "오늘의 행동 지침:\n\n1. 미뤄왔던 재정 계획을 점검하거나 가계부를 정리해 보세요.\n2. 업무에서 구체적인 수치와 결과물을 내는 데 집중하십시오.\n3. 쇼핑을 한다면 꼭 필요한 물건인지 신중히 판단 후 구매하세요.\n4. 결과 중심적인 태도로 주변 사람을 몰아세우지 않게 유의하세요.\n\n노력에 대한 보상이 확실히 따라오는 날이니, 성실함으로 기회를 완벽히 당신의 것으로 만드십시오.";
    } else if (diff === 6 || diff === 7) {
        dailyFortune = "사회적 책임과 명예를 중시하게 되는 '관성'의 날입니다. 조직 내에서 인정을 받거나 규율을 따를 일이 생깁니다.";
        dailyAdvice = "오늘의 행동 지침:\n\n1. 시간 약속을 철저히 지키고 단정한 차림으로 신뢰를 주십시오.\n2. 공적인 업무 처리에 있어 원칙을 준수하며 정직하게 행동하세요.\n3. 스트레스가 쌓일 수 있으니 퇴근 후에는 미온수로 목욕하세요.\n4. 지나친 자기검열로 위축되지 말고 할 일에만 집중하십시오.\n\n절제된 행동이 당신의 품격을 높여주며, 윗사람으로부터 좋은 평가를 이끌어내는 보람찬 하루가 될 것입니다.";
    } else {
        dailyFortune = "나를 채워주고 보호해 주는 '인성'의 날입니다. 공부, 계약, 건강 회복에 아주 유리한 기운입니다.";
        dailyAdvice = "오늘의 행동 지침:\n\n1. 전문 서적을 읽거나 강의를 들으며 지적 성장을 도모하세요.\n2. 중요한 문서 계약이나 승인이 있다면 오늘 처리하기 좋습니다.\n3. 어머니나 스승님 등 당신을 아끼는 분께 안부 인사를 전하세요.\n4. 충분한 휴식과 영양 섭취로 몸의 에너지를 충전하십시오.\n\n내면을 채우는 활동들이 당신의 미래를 지탱하는 든든한 뿌리가 되어주는 평온하고 길한 날입니다.";
    }

    const matches = {
        '목': [
            { title: '수(水) 기운이 풍부한 지혜로운 사주', reason: '명리학의 수생목(水生木) 원리에 따라, 마르지 않는 샘물처럼 당신에게 끝없는 영감과 지식을 공급해 주는 최고의 파트너입니다. 당신의 추진력이 지칠 때쯤 따뜻한 위로와 냉철한 분석으로 삶의 방향을 잡아주며, 함께할 때 정서적으로 가장 큰 안정을 느낄 수 있는 인연입니다.' },
            { title: '화(火) 기운이 강한 열정적인 사주', reason: '목생화(木生火)의 관계로, 당신이 가진 잠재력과 재능이라는 땔감을 활활 타오르는 불꽃으로 만들어 세상에 널리 알려주는 조력자입니다. 서로의 꿈을 응원하며 시너지를 내기에 최적이며, 동업이나 부부 관계에서 서로의 가치를 극대화할 수 있는 매우 역동적이고 생산적인 궁합입니다.' },
            { title: '토(土) 기운이 안정적인 든든한 사주', reason: '나무가 땅에 깊이 뿌리를 내리듯, 당신의 이상적인 계획을 현실적인 결과물로 안착시켜 주는 든든한 기반이 되어줍니다. 금전적인 관리나 현실적인 문제 해결에 있어 당신의 부족한 점을 완벽히 보완해주며, 시간이 흐를수록 서로에 대한 신뢰가 깊어져 흔들림 없는 관계를 유지할 수 있는 길한 인연입니다.' },
            { title: '천간 합(甲己)이 이루어지는 운명적 사주', reason: '서로를 보는 순간 강한 이끌림을 느낄 수 있는 운명적인 궁합입니다. 서로의 성향이 매우 다르더라도 그 차이점이 오히려 완벽한 조화를 이루어, 인생의 큰 풍파 속에서도 서로의 손을 놓지 않는 끈끈한 결속력을 자랑합니다. 서로의 영혼을 채워주는 소울메이트와 같은 관계를 형성하게 됩니다.' },
            { title: '음양의 조화가 완벽히 균형 잡힌 사주', reason: '당신의 강한 진취성과 추진력을 부드러운 수용성으로 감싸 안아주는 편안한 안식처 같은 인연입니다. 갈등이 생기더라도 대화를 통해 합리적으로 해결할 수 있는 소통의 능력이 탁월하며, 서로의 자존감을 높여주어 함께 성장하는 건강한 관계를 지속할 수 있는 최고의 궁합 중 하나입니다.' }
        ],
        '화': [
            { title: '목(木) 기운이 가득한 따뜻한 조력자 사주', reason: '목생화(木生火)의 원리로 당신의 열정이 식지 않도록 끊임없이 새로운 땔감을 공급해 주는 귀인입니다. 당신의 창의적인 아이디어를 구체화하고 뒷받침해주며, 당신이 지쳤을 때 다시 일어설 수 있는 정신적 에너지를 제공합니다. 서로가 서로의 발전을 진심으로 기뻐해 줄 수 있는 아름다운 궁합입니다.' },
            { title: '토(土) 기운이 넓은 포용력 있는 사주', reason: '화생토(火生土)의 관계로 당신의 뜨거운 열기를 온화한 대지로 받아들여 실질적인 재물과 성과로 변환시켜 주는 든든한 파트너입니다. 당신의 급한 성격을 차분하게 달래주며 현실적인 감각을 심어주어, 함께 사업을 하거나 가정을 꾸릴 때 경제적으로 매우 풍요로운 삶을 영위할 수 있게 돕는 인연입니다.' },
            { title: '금(金) 기운이 강한 결단력 있는 사주', reason: '당신의 뜨거운 열정으로 차가운 금속을 제련하여 보석으로 만들듯, 서로의 자극을 통해 비약적인 성장을 이루는 관계입니다. 경쟁 관계에서 시작하더라도 결국에는 서로의 능력을 가장 높게 평가하는 파트너가 되며, 사회적인 성공을 향해 함께 달려갈 때 가장 큰 폭발력을 발휘하는 전략적인 궁합입니다.' },
            { title: '천간 합(丙辛)이 성립되는 매력적인 사주', reason: '첫 만남부터 서로의 카리스마에 매료되는 강렬한 인연입니다. 서로의 명예와 자존심을 존중해주면서도 핵심적인 부분에서 완벽한 일치를 보이며, 공통의 목표를 설정했을 때 그 어떤 장애물도 뚫고 나가는 강력한 추진력을 보여줍니다. 연인 관계에서 특히 드라마틱하고 열정적인 사랑을 나누게 됩니다.' },
            { title: '수(水) 기운이 적절히 조화된 지혜로운 사주', reason: '자칫 과열되어 주변을 태우기 쉬운 당신의 기운을 적절한 시원함으로 조절해 주는 조율사 같은 인연입니다. 감정적인 폭주를 막아주고 이성적인 판단을 내릴 수 있도록 곁에서 지혜를 빌려주며, 당신이 사회적으로 안정된 위치에 오를 수 있도록 품격과 체면을 지켜주는 아주 귀중한 관계가 될 것입니다.' }
        ],
        '토': [
            { title: '화(火) 기운이 넘치는 밝고 명랑한 사주', reason: '화생토(火生土)의 원리로 차가운 대지를 따뜻한 태양빛으로 데워주듯 당신의 삶에 활력과 자신감을 불어넣어 주는 파트너입니다. 내성적일 수 있는 당신을 밖으로 이끌어내어 많은 사람과 소통하게 하며, 당신의 포용력을 더 넓은 세상에 알릴 수 있도록 화려한 조명을 비춰주는 최고의 서포터 같은 인연입니다.' },
            { title: '금(金) 기운이 선명한 확실한 사주', reason: '토생금(土生金)의 관계로 당신의 넓은 품 안에서 보석과 같은 인재나 성과가 태어나게 돕는 길한 궁합입니다. 당신이 가진 풍부한 자원을 가장 효율적으로 활용하여 빛나게 해주며, 실생활에서 경제적인 이익을 창출하는 능력이 뛰어납니다. 함께할수록 공동의 자산이 늘어나고 명예가 높아지는 실속 있는 관계입니다.' },
            { title: '목(木) 기운이 적절히 섞인 생기 있는 사주', reason: '자칫 정체되기 쉬운 당신의 삶에 새로운 변화의 씨앗을 뿌려 끊임없이 생동감을 주는 인연입니다. 현실에 안주하려는 당신을 자극하여 더 넓은 미래를 꿈꾸게 하며, 함께 새로운 도전을 시작할 때 가장 큰 재미와 성취감을 느낄 수 있습니다. 서로의 가치관을 존중하며 균형 잡힌 삶을 살게 돕는 동반자입니다.' },
            { title: '천간 합(戊癸)으로 연결된 운명적 사주', reason: '말하지 않아도 서로의 마음을 읽을 수 있는 깊은 신뢰 관계를 형성합니다. 서로의 정직함과 성실함에 반해 평생을 함께할 동역자로 여기게 되며, 어떤 시련이 와도 흔들리지 않는 뿌리 깊은 관계를 유지합니다. 특히 재물적인 운로가 서로 잘 맞아떨어져 함께 부를 쌓아가기에 아주 유리한 인연입니다.' },
            { title: '수(水) 기운이 풍부한 유연하고 지혜로운 사주', reason: '당신에게 필요한 유연한 사고방식과 창의적인 기회를 끊임없이 제공해 주는 길한 파트너입니다. 대지에 물이 흐르듯 당신의 고정된 틀을 깨고 더 넓은 가능성을 열어주며, 특히 대인관계나 사회생활에서 당신이 겪는 어려움을 지혜롭게 해결해 주는 중재자 역할을 톡톡히 해낼 수 있는 고마운 존재입니다.' }
        ],
        '금': [
            { title: '토(土) 기운이 풍부한 든든한 배경 사주', reason: '토생금(土生金)의 원리로 흙 속에서 보석을 발견하여 소중히 다듬어주듯 당신의 진정한 가치를 가장 먼저 알아보고 지지해 주는 귀인입니다. 당신의 날카로운 성격으로 인한 상처를 따뜻하게 감싸 안아주며, 세상의 풍파로부터 당신을 보호해 주는 든든한 방패 역할을 자처하여 당신이 마음껏 능력을 발휘하도록 돕습니다.' },
            { title: '수(水) 기운이 맑고 깊은 지혜로운 사주', reason: '금생수(金生水)의 관계로 당신의 차갑고 단단한 기운을 부드러운 흐름으로 정화하여 더 큰 지혜로 승화시켜 주는 파트너입니다. 당신의 극단적인 결단력을 유연하게 조절해 주어 적을 만들지 않고도 승리할 수 있는 처세술을 가르쳐주며, 함께할 때 예술적인 감수성이나 깊은 철학적 교감을 나눌 수 있는 우아한 궁합입니다.' },
            { title: '목(木) 기운이 강한 목표 지향적 사주', reason: '당신의 명확한 판단력과 실행력을 발휘할 수 있는 실질적인 목표와 무대를 제공하는 최고의 조력자입니다. 당신의 카리스마를 인정하고 따르면서도 핵심적인 피드백을 통해 목표 달성을 돕습니다. 서로의 역할 분담이 명확할 때 가장 큰 성공을 거두며, 경쟁보다는 협력을 통해 엄청난 부를 창출할 수 있는 실리적 인연입니다.' },
            { title: '천간 합(乙庚)으로 맺어진 보완적 사주', reason: '강철 같은 당신의 성정과 부드러운 화초 같은 상대의 성정이 만나 완벽한 조화를 이루는 궁합입니다. 서로의 부족한 감수성과 결단력을 채워주며, 함께 있을 때 가장 완성된 자아를 느낄 수 있습니다. 주변 사람들에게도 모범이 되는 조화로운 커플이나 파트너가 될 확률이 매우 높으며 평생의 안식처가 되어줍니다.' },
            { title: '화(火) 기운이 적절히 제련해 주는 사주', reason: '단순한 금속 조각에 불과한 당신을 화려한 보검이나 보석으로 제련하여 세상의 중심에 서게 돕는 고마운 인연입니다. 당신의 거친 부분을 다듬어 품격을 높여주며, 사회적으로 인정받는 위치에 오를 수 있도록 끊임없이 자극과 동기를 부여합니다. 서로에 대한 존경심을 바탕으로 높은 수준의 성취를 함께 이룰 수 있습니다.' }
        ],
        '수': [
            { title: '금(金) 기운이 마르지 않는 후원자 사주', reason: '금생수(金生水)의 원리로 당신의 지혜와 생각이 마르지 않도록 끊임없이 새로운 지식과 자원을 공급해 주는 최고의 후원자입니다. 당신이 혼란스러울 때 명확한 기준을 제시하여 중심을 잡아주며, 경제적으로나 정신적으로 항상 당신의 편에 서서 든든한 버팀목이 되어주는 부모님과 같은 자애로운 기운의 인연입니다.' },
            { title: '목(木) 기운이 생동감 넘치는 활동적 사주', reason: '수생목(水生木)의 관계로 당신의 깊은 생각과 지혜가 실질적인 결실을 맺을 수 있도록 행동력을 부여하는 파트너입니다. 당신의 아이디어를 현실화하는 추진력이 뛰어나며, 함께 새로운 프로젝트를 시작할 때 세상을 놀라게 할 결과를 만들어냅니다. 서로의 창의성을 극대화하며 삶에 활력을 불어넣는 즐거운 궁합입니다.' },
            { title: '토(土) 기운이 중용을 지키는 안정적 사주', reason: '자칫 방향을 잃고 흩어지기 쉬운 당신의 기운을 제방처럼 단단하게 가두어 큰 호수로 만들어주는 고마운 조력자입니다. 당신의 변화무쌍한 감정을 안정시켜 주며 사회적인 규범 안에서 명예를 얻을 수 있도록 길을 안내합니다. 서로의 다름을 인정하고 존중할 때 가장 견고하고 흔들림 없는 평생의 동반자 관계를 형성하게 됩니다.' },
            { title: '천간 합(丁壬)으로 소통하는 소울메이트', reason: '서로의 감정을 말하지 않아도 눈빛만으로 읽어낼 수 있는 깊은 정서적 유대감을 가집니다. 예술적인 감각이나 취미 생활에서 완벽한 일치를 보이며, 함께 있을 때 세상의 시름을 잊고 가장 순수한 자신으로 돌아갈 수 있는 힐링과 같은 인연입니다. 정서적 결핍을 채워주어 삶의 질을 한 단계 높여주는 특별한 만남이 될 것입니다.' },
            { title: '화(火) 기운이 따뜻하게 녹여주는 사주', reason: '당신의 차갑고 냉철한 이성을 따뜻한 사랑과 열정으로 녹여 활동적인 사람으로 변화시키며 재물적인 행운을 함께 가져올 수 있도록 돕는 아주 매력적인 궁합입니다.' }
        ]
    };

    const bestMatches = matches[me] || matches['목'];
    return { general, fortune2026, wealth, bestMatches, dailyFortune, dailyAdvice };
}

// Policy Modal Logic
const modal = document.getElementById('policy-modal');
const modalBody = document.getElementById('modal-body');

const policies = {
    privacy: '<h2>개인정보처리방침</h2><p>꼬식이의 명리연구소는 사용자의 개인정보 보호를 최우선으로 하며, 관련 법령을 준수합니다.</p><ul><li><strong>개인정보 수집 및 이용:</strong> 본 사이트는 사용자의 생년월일, 성별, 태어난 시간 데이터를 사주 분석 및 결과 도출을 위해 일시적으로 사용합니다.</li><li><strong>데이터 저장:</strong> 입력된 모든 정보는 서버에 저장되지 않으며, 브라우저 세션이 종료되면 즉시 소멸됩니다.</li><li><strong>타사 쿠키 및 광고:</strong> 본 사이트는 Google AdSense 광고를 게재하며, Google은 사용자의 방문 기록을 바탕으로 맞춤형 광고를 제공하기 위해 쿠키를 사용합니다. 사용자는 Google 광고 설정에서 맞춤형 광고를 거부할 수 있습니다.</li><li><strong>문의:</strong> 개인정보와 관련된 문의는 support@myeongri-lab.example.com으로 연락 바랍니다.</li></ul>',
    terms: '<h2>서비스 이용약관</h2><p>꼬식이의 명리연구소(이하 "연구소")가 제공하는 모든 서비스 이용에 관한 사항을 규정합니다.</p><ul><li>사용자는 본 서비스를 개인적, 비상업적 용도로만 이용할 수 있습니다.</li><li>분석 결과는 명리학적 데이터에 기반한 추정치이며, 실제 결과와 다를 수 있습니다.</li><li>사용자의 오입력으로 인한 결과에 대해 연구소는 책임을 지지 않습니다.</li></ul>',
    disclaimer: '<h2>책임부인 및 법적 고지</h2><p>꼬식이의 명리연구소의 사주 분석 서비스는 과학적으로 검증된 것이 아니며, 동양 철학인 명리학의 이론적 해석을 제공하는 것입니다.</p><p>제공되는 정보는 어떠한 법적, 재무적, 의학적 효력도 없으며, 중대한 결정의 근거로 사용되어서는 안 됩니다. 본 정보를 바탕으로 행한 모든 행동에 대한 책임은 사용자 본인에게 있습니다.</p>',
    contact: '<h2>고객 지원 및 문의</h2><p>서비스 이용 중 불편한 점이나 광고 관련 제휴 문의는 아래 채널을 이용해 주세요.</p><p><strong>Email:</strong> support@myeongri-lab.example.com</p><p><strong>운영 시간:</strong> 평일 10:00 - 17:00</p>'
};

function showModal(type) {
    if (policies[type]) {
        modalBody.innerHTML = policies[type];
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

window.onclick = function(event) {
    if (event.target == modal) {
        hideModal();
    }
}
