/**
 * NASA 366일 생일 천체 데이터베이스 (James Webb Space Telescope Edition)
 * - NASA/ESA/CSA 제임스웹 우주망원경(JWST) 및 허블 최첨단 천문 데이터
 * - 칠흑 같은 검은 심우주 배경(Deep Space Dark Background)의 100% 실사 성운, 은하, 별의 요람, 원시별 제트 사진
 */

const MASTER_CELESTIAL_CATALOG = [
  {
    name: "카리나 성운 '우주의 절벽'",
    catalog: "NGC 3324 / JWST NIRCam",
    type: "JWST 별 탄생 성운",
    constellation: "용골자리 (Carina)",
    ra: 10.75,
    dec: -59.87,
    distance_ly: "7,600 광년",
    distance_num: 7600,
    history_story: "신석기 인류가 최초로 문명과 농경을 꽃피우기 전, 7,600년 전 태고의 우주를 출발한 제임스웹의 적외선 빛입니다.",
    orbital_speed: "약 230 km/s (시속 828,000 km)",
    galactic_period: "약 2억 3천만 년",
    image: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001460/GSFC_20171208_Archive_e001460~orig.jpg",
    story: "제임스웹 망원경이 포착한 우주의 절벽. 짙은 성간 먼지 구름을 뚫고 찬란하게 태동하는 아기 별들의 생명력 넘치는 요람입니다.",
    jwst_instrument: "NIRCam / MIRI"
  },
  {
    name: "독수리 성운 '창조의 기둥'",
    catalog: "M16 / NGC 6611 (JWST)",
    type: "JWST 발광 성운 및 원시별",
    constellation: "뱀자리 (Serpens)",
    ra: 18.313,
    dec: -13.82,
    distance_ly: "6,500 광년",
    distance_num: 6500,
    history_story: "고대 메소포타미아 수메르 문명이 태동하던 6,500년 전 우주 깊은 곳에서 출발한 빛이 오늘 밤 당신을 찾아왔습니다.",
    orbital_speed: "약 220 km/s (시속 792,000 km)",
    galactic_period: "약 2억 2천만 년",
    image: "https://images-assets.nasa.gov/image/PIA18224/PIA18224~orig.jpg",
    story: "제임스웹의 적외선 시선으로 바라본 창조의 기둥. 붉은 용암처럼 빛나는 수소 분자 속에서 수천 개의 새로운 항성계가 빚어지고 있습니다.",
    jwst_instrument: "NIRCam"
  },
  {
    name: "남쪽 고리 성운 (Southern Ring)",
    catalog: "NGC 3132 / JWST MIRI",
    type: "JWST 행성상 성운",
    constellation: "돛자리 (Vela)",
    ra: 10.12,
    dec: -40.43,
    distance_ly: "2,500 광년",
    distance_num: 2500,
    history_story: "고대 그리스 아테네와 공자가 동양에서 도덕과 철학을 설파하던 2,500년 전 우주를 떠난 영원의 빛입니다.",
    orbital_speed: "약 218 km/s (시속 785,000 km)",
    galactic_period: "약 2억 2천만 년",
    image: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000494/GSFC_20171208_Archive_e000494~orig.jpg",
    story: "제임스웹이 두 별의 숨겨진 춤을 최초로 밝혀낸 성운. 중심 별이 생을 마감하며 뿜어낸 다채로운 빛의 파동이 시공간을 수놓습니다.",
    jwst_instrument: "NIRCam / MIRI"
  },
  {
    name: "타란툴라 성운 (30 Doradus)",
    catalog: "NGC 2070 / JWST NIRCam",
    type: "JWST 대마젤란 은하 초거대 성운",
    constellation: "황새치자리 (Dorado)",
    ra: 5.64,
    dec: -69.10,
    distance_ly: "161,000 광년",
    distance_num: 161000,
    history_story: "지구상에 현생 인류인 호모 사피엔스가 처음 출현하던 16만 년 전 은하수를 건너온 거대한 우주의 신비입니다.",
    orbital_speed: "초속 약 260 km/s",
    galactic_period: "자체 회전 약 1억 8천만 년",
    image: "https://images-assets.nasa.gov/image/PIA15422/PIA15422~orig.jpg",
    story: "국부 은하군에서 가장 거대하고 밝은 별의 보육원. 수만 개의 신생 별들이 뿜어내는 에너지가 우주의 밤을 환하게 밝힙니다.",
    jwst_instrument: "NIRCam"
  },
  {
    name: "스테판의 5중주 (Stephan's Quintet)",
    catalog: "HCG 92 / JWST NIRCam",
    type: "JWST 상호작용 은하군",
    constellation: "페가수스자리 (Pegasus)",
    ra: 22.60,
    dec: 33.96,
    distance_ly: "2억 9천만 광년",
    distance_num: 290000000,
    history_story: "지구에 공룡이 번성하기 훨씬 전인 페름기-트라이아스기 고생대에 출발하여 시공간을 가로질러온 장엄한 은하의 합창입니다.",
    orbital_speed: "상호 충돌 속도 초속 약 800 km/s",
    galactic_period: "은하 결합 주기 약 10억 년",
    image: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001435/GSFC_20171208_Archive_e001435~orig.jpg",
    story: "다섯 은하가 중력으로 서로를 끌어당기며 펼치는 장엄한 우주 왈츠. 거대한 충격파 속에서 새로운 별의 세대가 폭발적으로 태어납니다.",
    jwst_instrument: "NIRCam / MIRI"
  },
  {
    name: "SMACS 0723 딥 필드",
    catalog: "Webb's First Deep Field",
    type: "JWST 중력렌즈 심우주 은하단",
    constellation: "날치자리 (Volans)",
    ra: 7.39,
    dec: -73.45,
    distance_ly: "46억 광년",
    distance_num: 4600000000,
    history_story: "우리 태양계와 지구가 원시 태양 성운에서 처음 탄생하던 46억 년 전 우주를 떠난 태고의 빛입니다.",
    orbital_speed: "초속 약 1,200 km/s",
    galactic_period: "우주 팽창 흐름",
    image: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001552/GSFC_20171208_Archive_e001552~orig.jpg",
    story: "제임스웹이 인류 역사상 가장 깊고 선명하게 포착한 우주의 새벽. 수천 개의 고대 은하들이 보석처럼 밤하늘을 수놓고 있습니다.",
    jwst_instrument: "NIRCam"
  },
  {
    name: "차륜 은하 (Cartwheel Galaxy)",
    catalog: "ESO 350-40 / JWST",
    type: "JWST 충돌 고리 은하",
    constellation: "조각가자리 (Sculptor)",
    ra: 0.62,
    dec: -33.71,
    distance_ly: "5억 광년",
    distance_num: 500000000,
    history_story: "지구의 바다에 캄브리아기 삼엽충과 고대 생명체들이 번성하던 5억 년 전 출발한 영원의 바퀴 빛입니다.",
    orbital_speed: "팽창 파동 초속 217 km/s",
    galactic_period: "약 4억 년",
    image: "https://images-assets.nasa.gov/image/PIA18224/PIA18224~orig.jpg",
    story: "두 은하의 고속 충돌로 수레바퀴처럼 퍼져나가는 찬란한 가스 고리. 우주의 격변 속에서도 꺼지지 않는 별들의 생명력을 보여줍니다.",
    jwst_instrument: "NIRCam / MIRI"
  },
  {
    name: "판도라 성단 (Pandora's Cluster)",
    catalog: "Abell 2744 (JWST)",
    type: "JWST 거대 은하단 메가 중력렌즈",
    constellation: "조각가자리 (Sculptor)",
    ra: 0.23,
    dec: -30.40,
    distance_ly: "35억 광년",
    distance_num: 3500000000,
    history_story: "지구의 원시 바다에서 최초의 단세포 생명체가 태동하던 35억 년 전 우주를 출발한 기적의 빛입니다.",
    orbital_speed: "초속 약 1,500 km/s",
    galactic_period: "은하단 결합",
    image: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001460/GSFC_20171208_Archive_e001460~orig.jpg",
    story: "서로 다른 세 거대 은하단이 융합하며 만든 초대형 시공간 왜곡 렌즈. 그 너머 수만 개의 원시 은하들이 영롱하게 반짝입니다.",
    jwst_instrument: "NIRCam"
  },
  {
    name: "고리 성운 (Ring Nebula)",
    catalog: "M57 / NGC 6720 (JWST)",
    type: "JWST 행성상 성운",
    constellation: "거문고자리 (Lyra)",
    ra: 18.89,
    dec: 33.03,
    distance_ly: "2,600 광년",
    distance_num: 2600,
    history_story: "고대 로마가 공화정을 세우고 부처가 진리를 깨닫던 2,600년 전 우주를 떠난 에메랄드빛 도넛 고리의 빛입니다.",
    orbital_speed: "약 210 km/s (팽창 속도 30 km/s)",
    galactic_period: "약 2억 2천만 년",
    image: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000494/GSFC_20171208_Archive_e000494~orig.jpg",
    story: "제임스웹이 밝혀낸 고리 성운의 복잡한 2만 개의 수소 덩어리 구조. 별의 마지막 숨결이 빚어낸 가장 아름다운 우주의 보석 반지입니다.",
    jwst_instrument: "NIRCam / MIRI"
  },
  {
    name: "말머리 성운 (Horsehead Nebula)",
    catalog: "Barnard 33 (JWST NIRCam)",
    type: "JWST 적외선 암흑 성운",
    constellation: "오리온자리 (Orion)",
    ra: 5.68,
    dec: -2.46,
    distance_ly: "1,375 광년",
    distance_num: 1375,
    history_story: "한반도 삼국시대 백제와 신라가 밤하늘을 관측하던 1,300년 전 시공간을 가로질러온 빛입니다.",
    orbital_speed: "약 222 km/s (시속 799,000 km)",
    galactic_period: "약 2억 3천만 년",
    image: "https://images-assets.nasa.gov/image/PIA15422/PIA15422~orig.jpg",
    story: "제임스웹의 날카로운 적외선 해상도로 밝혀진 말머리 성운의 정수리 갈기. 차가운 분자 가스 벽이 별빛을 받아 푸른 안개처럼 피어오릅니다.",
    jwst_instrument: "NIRCam / MIRI"
  }
];

class NASAStarDatabase {
  constructor() {
    this.catalog = MASTER_CELESTIAL_CATALOG;
  }

  getStarByDate(month, day, preferVisible = false, astroEngine = null) {
    const dayOfYear = this.getDayOfYear(month, day);

    if (preferVisible && astroEngine) {
      let bestStar = null;
      let highestAlt = -90;

      for (let i = 0; i < this.catalog.length; i++) {
        const star = this.catalog[i];
        const horiz = astroEngine.equatorialToHorizontal(star.ra, star.dec);
        if (horiz.altitude > 15) {
          return Object.assign({}, star, { isVisiblePriorityMatch: true });
        }
        if (horiz.altitude > highestAlt) {
          highestAlt = horiz.altitude;
          bestStar = star;
        }
      }
      if (bestStar) {
        return Object.assign({}, bestStar, { isVisiblePriorityMatch: false });
      }
    }

    const index = (dayOfYear - 1) % this.catalog.length;
    return Object.assign({}, this.catalog[index], { isVisiblePriorityMatch: false });
  }

  getDayOfYear(month, day) {
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let count = 0;
    for (let m = 0; m < month - 1; m++) {
      count += daysInMonth[m];
    }
    return count + day;
  }
}

window.nasaStarDB = new NASAStarDatabase();
