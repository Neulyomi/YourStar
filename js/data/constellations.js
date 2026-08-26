/**
 * 주요 별자리 천문 좌표, 항성 세부 정보 및 반투명 성도 일러스트레이션 데이터베이스
 * 황도 12궁(Zodiac 12) 및 북천/남천 주요 별자리 (오리온, 백조, 큰곰, 카시오페이아)
 */

const CONSTELLATIONS_DATA = [
  {
    id: "cancer",
    name: "게자리",
    latin: "Cancer",
    symbol: "♋",
    period: "06-22 ~ 07-22",
    season: "봄",
    story: "헤라클레스와의 사투에서 친구 히드라를 돕기 위해 발을 뻗었던 충직하고 용기 있는 게의 별자리입니다.",
    stars: [
      { name: "알타르프 (β Cnc)", ra: 9.16, dec: 9.19, mag: 3.53, distance: "290 광년", spec: "K4 III (오렌지색 거성)", desc: "게자리에서 가장 밝은 주성으로, 황금빛 오렌지색으로 빛납니다." },
      { name: "아쿠벤스 (α Cnc)", ra: 8.97, dec: 11.86, mag: 4.26, distance: "174 광년", spec: "A5m (백색 4중성계)", desc: "'게의 집게발'을 의미하는 아랍어에서 유래한 4중성계입니다." },
      { name: "아셀루스 아우스트랄리스 (δ Cnc)", ra: 8.74, dec: 18.15, mag: 3.94, distance: "136 광년", spec: "K0 III (황색 거성)", desc: "프레세페 성단(벌집 성단 M44) 바로 옆에 위치한 남쪽 당나귀 별입니다." },
      { name: "아셀루스 보레알리스 (γ Cnc)", ra: 8.72, dec: 21.47, mag: 4.66, distance: "158 광년", spec: "A1 V (백색 주계열성)", desc: "프레세페 성단의 북쪽을 지키는 북쪽 당나귀 별입니다." }
    ],
    lines: [[0, 2], [2, 3], [2, 1]]
  },
  {
    id: "leo",
    name: "사자자리",
    latin: "Leo",
    symbol: "♌",
    period: "07-23 ~ 08-22",
    season: "봄",
    story: "네메아 골짜기를 지배하던 불굴의 맹수 사자로, 밤하늘에서 당당한 위엄과 용기를 상징합니다.",
    stars: [
      { name: "레굴루스 (α Leo)", ra: 10.14, dec: 11.97, mag: 1.36, distance: "79 광년", spec: "B7 V (청백색 주계열성)", desc: "'작은 왕'이라는 뜻의 1등성으로 사자의 심장에 위치합니다." },
      { name: "데네볼라 (β Leo)", ra: 11.82, dec: 14.57, mag: 2.14, distance: "36 광년", spec: "A3 V (백색 주계열성)", desc: "사자의 꼬리에 위치하며 봄의 대삼각형을 이룹니다." },
      { name: "알기에바 (γ Leo)", ra: 10.33, dec: 19.84, mag: 2.01, distance: "130 광년", spec: "K0 III + G7 III (황금빛 이중성)", desc: "망원경으로 보면 너무나 아름다운 황금빛 쌍성입니다." },
      { name: "조스마 (δ Leo)", ra: 11.24, dec: 20.52, mag: 2.56, distance: "58 광년", spec: "A4 V (백색 주계열성)", desc: "사자의 허리 부분을 나타내는 별입니다." },
      { name: "알게누비 (ε Leo)", ra: 9.76, dec: 23.77, mag: 2.97, distance: "250 광년", spec: "G1 II (황색 밝은 거성)", desc: "사자의 머리 남쪽을 장식하는 별입니다." },
      { name: "아드하페라 (ζ Leo)", ra: 10.28, dec: 23.42, mag: 3.44, distance: "260 광년", spec: "F0 III (황백색 거성)", desc: "사자의 풍성한 갈기 낫(Sickle) 모양의 일부입니다." }
    ],
    lines: [[0, 2], [2, 5], [5, 4], [2, 3], [3, 1], [0, 1]]
  },
  {
    id: "virgo",
    name: "처녀자리",
    latin: "Virgo",
    symbol: "♍",
    period: "08-23 ~ 09-22",
    season: "봄/초가을",
    story: "정의의 여신 아스트라이아가 인류의 순수함을 지키기 위해 밤하늘로 올라가 빛나는 별자리가 되었습니다.",
    stars: [
      { name: "스피카 (α Vir)", ra: 13.42, dec: -11.16, mag: 0.98, distance: "250 광년", spec: "B1 III-IV (청백색 거성)", desc: "여신이 쥐고 있는 보리 이삭을 뜻하는 순백의 눈부신 1등성입니다." },
      { name: "포리마 (γ Vir)", ra: 12.69, dec: -1.45, mag: 2.74, distance: "38 광년", spec: "F0 V + F0 V (쌍둥이 백색 쌍성)", desc: "예언의 여신 포리마의 이름을 딴 정밀한 쌍성계입니다." },
      { name: "빈데미아트릭스 (ε Vir)", ra: 13.04, dec: 10.96, mag: 2.85, distance: "110 광년", spec: "G8 III (황색 거성)", desc: "'포도 수확인'이라는 뜻으로 가을의 시작을 알리는 별입니다." },
      { name: "자비야바 (β Vir)", ra: 11.84, dec: 1.76, mag: 3.6, distance: "35 광년", spec: "F9 V (황백색 왜성)", desc: "처녀자리의 머리 부근에 위치합니다." },
      { name: "헤제 (ζ Vir)", ra: 13.58, dec: -0.60, mag: 3.38, distance: "74 광년", spec: "A3 V (백색 주계열성)", desc: "처녀의 허리띠 부근에서 은은하게 빛납니다." }
    ],
    lines: [[3, 1], [1, 2], [1, 0], [0, 4], [2, 4]]
  },
  {
    id: "libra",
    name: "천칭자리",
    latin: "Libra",
    symbol: "♎",
    period: "09-23 ~ 10-22",
    season: "초여름",
    story: "정의와 공평을 재는 천칭으로, 낮과 밤의 길이가 같아지는 추분점의 균형을 상징합니다.",
    stars: [
      { name: "주벤에샤마리 (β Lib)", ra: 15.28, dec: -9.38, mag: 2.61, distance: "185 광년", spec: "B8 Vn (신비로운 에메랄드 녹색성)", desc: "밤하늘에서 거의 유일하게 육안으로 에메랄드 녹색빛을 띠는 별입니다." },
      { name: "주벤엘게누비 (α Lib)", ra: 14.85, dec: -16.04, mag: 2.75, distance: "76 광년", spec: "A3 IV (남쪽 집게발 다중성)", desc: "남쪽 저울판을 이루는 밝은 연성입니다." },
      { name: "주벤엘아크라브 (γ Lib)", ra: 15.59, dec: -14.79, mag: 3.91, distance: "163 광년", spec: "G8.5 III (주황색 거성)", desc: "저울의 중심축을 지탱하는 별입니다." },
      { name: "브라키움 (σ Lib)", ra: 15.07, dec: -25.25, mag: 3.25, distance: "290 광년", spec: "M2.5 III (적색 거성)", desc: "붉은빛을 띠는 천칭자리의 바닥 별입니다." }
    ],
    lines: [[1, 0], [0, 2], [2, 1], [1, 3]]
  },
  {
    id: "scorpius",
    name: "전갈자리",
    latin: "Scorpius",
    symbol: "♏",
    period: "10-23 ~ 11-21",
    season: "여름",
    story: "여름밤 남쪽 하늘 은하수 중심부를 가로지르는 웅장한 전갈로, 타오르는 붉은 심장을 품고 있습니다.",
    stars: [
      { name: "안타레스 (α Sco)", ra: 16.49, dec: -26.43, mag: 1.06, distance: "550 광년", spec: "M1.5 Iab (적색 초거성)", desc: "'화성의 맞수'라는 뜻의 거대한 붉은 초거성으로 태양 지름의 700배에 달합니다." },
      { name: "샤울라 (λ Sco)", ra: 17.56, dec: -37.10, mag: 1.62, distance: "570 광년", spec: "B2 IV (청색 거성)", desc: "전갈의 치명적인 독침 끝에서 빛나는 푸른 별입니다." },
      { name: "사르가스 (θ Sco)", ra: 17.62, dec: -42.99, mag: 1.86, distance: "270 광년", spec: "F0 II (황백색 밝은 거성)", desc: "전갈 꼬리의 곡선을 완성하는 아름다운 별입니다." },
      { name: "드슈바 (δ Sco)", ra: 16.01, dec: -22.62, mag: 2.29, distance: "440 광년", spec: "B0.3 IV (청백색 변광성)", desc: "전갈의 이마 중앙에 위치합니다." },
      { name: "그라피아스 (β Sco)", ra: 16.09, dec: -19.80, mag: 2.6, distance: "400 광년", spec: "B1 V (다중성계)", desc: "전갈의 북쪽 집게발 끝을 장식합니다." }
    ],
    lines: [[4, 3], [3, 0], [0, 2], [2, 1]]
  },
  {
    id: "sagittarius",
    name: "궁수자리 (사수자리)",
    latin: "Sagittarius",
    symbol: "♐",
    period: "11-22 ~ 12-21",
    season: "여름/초가을",
    story: "현자 켄타우로스 케이론이 은하수 중심을 향해 정의의 활시위를 당기는 장엄한 별자리입니다.",
    stars: [
      { name: "카우스 아우스트랄리스 (ε Sgr)", ra: 18.40, dec: -34.38, mag: 1.79, distance: "143 광년", spec: "B9.5 III (청백색 거성)", desc: "궁수자리의 활 남쪽 끝에서 가장 밝게 빛나는 으뜸별입니다." },
      { name: "누키 (σ Sgr)", ra: 18.92, dec: -26.30, mag: 2.05, distance: "228 광년", spec: "B2.5 V (청색 왜성)", desc: "인류 역사상 가장 오래된 별 이름 중 하나로 활의 시위를 나타냅니다." },
      { name: "아셀라 (ζ Sgr)", ra: 19.04, dec: -29.88, mag: 2.59, distance: "88 광년", spec: "A2.5 Va (백색 쌍성)", desc: "남두육성 주전자 손잡이의 핵심 별입니다." },
      { name: "카우스 메디우스 (δ Sgr)", ra: 18.35, dec: -29.83, mag: 2.72, distance: "348 광년", spec: "K3 III (오렌지색 거성)", desc: "활의 중심부를 이루며 은하 중심 블랙홀 방향을 가리킵니다." }
    ],
    lines: [[3, 0], [0, 2], [2, 1], [1, 3]]
  },
  {
    id: "capricornus",
    name: "염소자리",
    latin: "Capricornus",
    symbol: "♑",
    period: "12-22 ~ 01-19",
    season: "가을",
    story: "목동의 신 판이 거인 괴물을 피해 변신한 반양반어(상반신 염소, 하반신 물고기)의 신비로운 형상입니다.",
    stars: [
      { name: "데네브 알게디 (δ Cap)", ra: 21.78, dec: -16.13, mag: 2.85, distance: "39 광년", spec: "A7m (식쌍성계)", desc: "바다염소의 꼬리 끝에서 빛나는 가장 밝은 별입니다." },
      { name: "다비흐 (β Cap)", ra: 20.35, dec: -14.78, mag: 3.05, distance: "328 광년", spec: "F8 V + B9.5 V (복합 다중성계)", desc: "염소의 뿔 밑동에 위치하는 아름다운 쌍성입니다." }
    ],
    lines: [[1, 0]]
  },
  {
    id: "aquarius",
    name: "물병자리",
    latin: "Aquarius",
    symbol: "♒",
    period: "01-20 ~ 02-18",
    season: "가을",
    story: "신들의 연회에 불사의 감로주(넥타르)를 따르는 미소년 가니메데의 물병에서 쏟아지는 지혜의 물줄기입니다.",
    stars: [
      { name: "사달수드 (β Aqr)", ra: 21.53, dec: -5.57, mag: 2.90, distance: "540 광년", spec: "G0 Ib (황색 초거성)", desc: "'행운 중의 행운'이라는 뜻의 희귀한 황색 초거성입니다." },
      { name: "사달멜릭 (α Aqr)", ra: 22.09, dec: -0.32, mag: 2.95, distance: "520 광년", spec: "G2 Ib (황색 초거성)", desc: "'왕의 행운'을 뜻하는 물병의 중심별입니다." }
    ],
    lines: [[0, 1]]
  },
  {
    id: "pisces",
    name: "물고기자리",
    latin: "Pisces",
    symbol: "♓",
    period: "02-19 ~ 03-20",
    season: "가을/겨울",
    story: "미의 여신 아프로디테와 에로스 모자가 서로를 잃어버리지 않기 위해 은빛 리본으로 몸을 묶은 사랑의 물고기입니다.",
    stars: [
      { name: "알레샤 (α Psc)", ra: 2.03, dec: 2.76, mag: 3.82, distance: "139 광년", spec: "A0p + A3m (쌍성)", desc: "두 마리 물고기를 묶은 리본의 매듭 위치에 있는 별입니다." }
    ],
    lines: []
  },
  {
    id: "aries",
    name: "양자리",
    latin: "Aries",
    symbol: "♈",
    period: "03-21 ~ 04-19",
    season: "가을/겨울",
    story: "아이들을 구하기 위해 제우스가 보낸 황금 양털의 날개 달린 수양 별자리입니다.",
    stars: [
      { name: "하말 (α Ari)", ra: 2.12, dec: 23.46, mag: 2.01, distance: "66 광년", spec: "K2 III (주황색 거성)", desc: "양의 머리에서 돋아난 황금 뿔의 주성입니다." },
      { name: "셰라탄 (β Ari)", ra: 1.91, dec: 20.81, mag: 2.64, distance: "59 광년", spec: "A5 V (백색 분광쌍성)", desc: "양의 두 번째 뿔을 나타냅니다." }
    ],
    lines: [[0, 1]]
  },
  {
    id: "taurus",
    name: "황소자리",
    latin: "Taurus",
    symbol: "♉",
    period: "04-20 ~ 05-20",
    season: "겨울",
    story: "에우로파 공주를 태우고 지중해를 건넌 눈부신 흰 황소로, 타오르는 붉은 눈 알데바란을 품고 있습니다.",
    stars: [
      { name: "알데바란 (α Tau)", ra: 4.60, dec: 16.51, mag: 0.85, distance: "65 광년", spec: "K5 III (오렌지색 적색 거성)", desc: "'따르는 자'라는 뜻의 황소의 붉은 눈으로 0.8등급의 밝은 별입니다." },
      { name: "엘나스 (β Tau)", ra: 5.44, dec: 28.61, mag: 1.65, distance: "134 광년", spec: "B7 III (청백색 거성)", desc: "황소의 북쪽 뿔 끝에 위치합니다." }
    ],
    lines: [[0, 1]]
  },
  {
    id: "gemini",
    name: "쌍둥이자리",
    latin: "Gemini",
    symbol: "♊",
    period: "05-21 ~ 06-21",
    season: "겨울",
    story: "영원한 우애를 나눈 카스토르와 폴룩스 형제가 밤하늘에 나란히 빛나는 별자리입니다.",
    stars: [
      { name: "폴룩스 (β Gem)", ra: 7.76, dec: 28.03, mag: 1.15, distance: "34 광년", spec: "K0 III (황황색 거성)", desc: "쌍둥이 형제 중 동생의 머리에 해당하는 1등성입니다." },
      { name: "카스토르 (α Gem)", ra: 7.58, dec: 31.89, mag: 1.58, distance: "51 광년", spec: "A1 V (6중성계)", desc: "형의 머리에 해당하는 신비로운 6개의 별이 모인 복합성계입니다." }
    ],
    lines: [[1, 0]]
  },
  {
    id: "orion",
    name: "오리온자리",
    latin: "Orion",
    symbol: "🏹",
    period: "사계절 전천 대표",
    season: "겨울",
    story: "겨울철 밤하늘의 지배자이자 용맹한 사냥꾼 오리온의 웅장한 실루엣입니다.",
    stars: [
      { name: "베텔게우스 (α Ori)", ra: 5.92, dec: 7.41, mag: 0.50, distance: "640 광년", spec: "M1-2 Ia-ab (적색 초거성)", desc: "오리온의 오른쪽 어깨로 곧 초신성 폭발을 앞둔 거대한 별입니다." },
      { name: "리겔 (β Ori)", ra: 5.24, dec: -8.20, mag: 0.18, distance: "860 광년", spec: "B8 Ia (청백색 초거성)", desc: "오리온의 왼쪽 발끝에서 눈부시게 빛나는 0.1등급의 초거성입니다." },
      { name: "알니람 (ε Ori)", ra: 5.60, dec: -1.20, mag: 1.69, distance: "2,000 광년", spec: "B0 Ia (오리온 허리띠 중앙)", desc: "오리온 삼태성의 중심 별입니다." }
    ],
    lines: [[0, 2], [2, 1]]
  },
  {
    id: "cygnus",
    name: "백조자리",
    latin: "Cygnus",
    symbol: "🦢",
    period: "사계절 전천 대표",
    season: "여름/가을",
    story: "은하수 강물을 따라 유유히 날아가는 북십자성의 거대한 백조입니다.",
    stars: [
      { name: "데네브 (α Cyg)", ra: 20.69, dec: 45.28, mag: 1.25, distance: "2,600 광년", spec: "A2 Ia (백색 초거성)", desc: "여름의 대삼각형을 이루는 백조의 꼬리 별로 태양 20만 배의 밝기를 자랑합니다." },
      { name: "알비레오 (β Cyg)", ra: 19.51, dec: 27.96, mag: 3.05, distance: "430 광년", spec: "K3 II + B9.5 V (금과 사파이어 이중성)", desc: "밤하늘에서 가장 아름다운 금빛과 토파즈빛의 이중성입니다." }
    ],
    lines: [[0, 1]]
  },
  {
    id: "ursa_major",
    name: "큰곰자리 (북두칠성)",
    latin: "Ursa Major",
    symbol: "🐻",
    period: "사계절 전천 대표",
    season: "봄/사계절",
    story: "북극성을 가리키며 사계절 내내 밤하늘의 닻이 되어주는 북두칠성을 품은 곰 별자리입니다.",
    stars: [
      { name: "두베 (α UMa)", ra: 11.06, dec: 61.75, mag: 1.79, distance: "123 광년", spec: "K0 III (북극성을 가리키는 별)", desc: "북두칠성의 국자 머리 첫 번째 별입니다." },
      { name: "메라크 (β UMa)", ra: 11.03, dec: 56.38, mag: 2.37, distance: "79 광년", spec: "A1 V (지렛대 별)", desc: "두베와 함께 북극성을 찾는 길잡이 별입니다." },
      { name: "미자르 (ζ UMa)", ra: 13.40, dec: 54.92, mag: 2.23, distance: "83 광년", spec: "A2 V (시력 검사용 쌍성)", desc: "알코르와 함께 고대 시력 검사에 쓰였던 유명한 쌍성입니다." }
    ],
    lines: [[0, 1], [1, 2]]
  },
  {
    id: "cassiopeia",
    name: "카시오페이아자리",
    latin: "Cassiopeia",
    symbol: "👑",
    period: "사계절 전천 대표",
    season: "가을/겨울",
    story: "북쪽 하늘에서 W자 모양으로 빛나는 에티오피아의 왕비 별자리입니다.",
    stars: [
      { name: "쉐다르 (α Cas)", ra: 0.68, dec: 56.54, mag: 2.24, distance: "228 광년", spec: "K0 IIIa (오렌지색 거성)", desc: "카시오페이아의 중심을 이루는 주황색 거성입니다." }
    ],
    lines: []
  }
];

/**
 * 캔버스에 각 별자리의 대략적인 성도 일러스트레이션 실루엣을 반투명하게 렌더링하는 헬퍼
 * @param {string} constellationId 
 * @returns {THREE.CanvasTexture}
 */
function createConstellationArtTexture(constellationId) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 256, 256);

  // 시선을 방해하지 않는 매우 섬세하고 얇은 반투명 라인
  ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)'; // 맑은 페일 시안
  ctx.fillStyle = 'rgba(56, 189, 248, 0.04)';
  ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const cx = 128, cy = 128;

  switch (constellationId) {
    case 'cancer': // 게자리 실루엣
      ctx.beginPath();
      ctx.ellipse(cx, cy + 10, 42, 28, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();
      // 좌우 집게발
      ctx.beginPath();
      ctx.arc(cx - 50, cy - 25, 20, 0.2, Math.PI * 1.2, false);
      ctx.arc(cx + 50, cy - 25, 20, -Math.PI * 0.2, Math.PI * 0.8, false);
      ctx.stroke();
      break;

    case 'leo': // 사자자리 실루엣
      ctx.beginPath();
      ctx.arc(cx - 30, cy - 20, 32, 0, Math.PI * 2); // 머리 갈기
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx + 20, cy + 10, 50, 25, -0.2, 0, Math.PI * 2); // 몸통
      ctx.stroke();
      ctx.fill();
      break;

    case 'virgo': // 처녀자리 여신 날개 실루엣
      ctx.beginPath();
      ctx.moveTo(cx, cy - 60);
      ctx.bezierCurveTo(cx - 60, cy - 30, cx - 70, cy + 40, cx - 10, cy + 60);
      ctx.bezierCurveTo(cx + 70, cy + 40, cx + 60, cy - 30, cx, cy - 60);
      ctx.stroke();
      ctx.fill();
      break;

    case 'scorpius': // 전갈자리 꼬리 곡선 실루엣
      ctx.beginPath();
      ctx.arc(cx - 20, cy - 30, 25, 0, Math.PI * 2); // 머리
      ctx.moveTo(cx, cy - 10);
      ctx.bezierCurveTo(cx + 30, cy + 20, cx + 45, cy + 60, cx + 10, cy + 65);
      ctx.bezierCurveTo(cx - 30, cy + 65, cx - 20, cy + 40, cx - 10, cy + 30); // 꼬리 독침
      ctx.stroke();
      break;

    case 'sagittarius': // 궁수자리 활 & 화살 실루엣
      ctx.beginPath();
      ctx.arc(cx - 10, cy, 55, -Math.PI * 0.45, Math.PI * 0.45); // 활
      ctx.moveTo(cx - 60, cy);
      ctx.lineTo(cx + 60, cy); // 화살
      ctx.stroke();
      break;

    case 'orion': // 오리온 사냥꾼 나비형 실루엣
      ctx.beginPath();
      ctx.moveTo(cx - 45, cy - 50);
      ctx.lineTo(cx + 45, cy - 50);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + 45, cy + 50);
      ctx.lineTo(cx - 45, cy + 50);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
      break;

    case 'cygnus': // 백조자리 십자 날개 실루엣
      ctx.beginPath();
      ctx.moveTo(cx, cy - 65);
      ctx.lineTo(cx, cy + 65);
      ctx.moveTo(cx - 65, cy - 10);
      ctx.lineTo(cx + 65, cy - 10);
      ctx.stroke();
      break;

    case 'ursa_major': // 큰곰자리 실루엣
      ctx.beginPath();
      ctx.ellipse(cx, cy, 60, 35, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();
      break;

    default: // 기본 황도 심볼 원형 오라
      ctx.beginPath();
      ctx.arc(cx, cy, 48, 0, Math.PI * 2);
      ctx.stroke();
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.premultiplyAlpha = true;
  return texture;
}

function getZodiacByBirthday(month, day) {
  const m = parseInt(month, 10);
  const d = parseInt(day, 10);

  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return "aries";
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return "taurus";
  if ((m === 5 && d >= 21) || (m === 6 && d <= 21)) return "gemini";
  if ((m === 6 && d >= 22) || (m === 7 && d <= 22)) return "cancer";
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return "leo";
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return "virgo";
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return "libra";
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return "scorpius";
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return "sagittarius";
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return "capricornus";
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return "aquarius";
  return "pisces";
}

window.CONSTELLATIONS_DATA = CONSTELLATIONS_DATA;
window.getZodiacByBirthday = getZodiacByBirthday;
window.createConstellationArtTexture = createConstellationArtTexture;
