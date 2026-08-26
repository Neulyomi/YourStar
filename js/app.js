/**
 * 메인 애플리케이션 진입점 (App Controller)
 * - 라이프사이클 관리: 감성 우주 명언 인트로 -> 궤도 아크 날짜 다이얼 -> Web AR / PC 360 Sky View -> Story Bottom Sheet
 * - 24시간 실제 천구 궤적 흰색 라인 표시 + 그 위에 얹혀지는 초저속 혜성 궤도 연출
 * - 실제 혜성 구조(U자형 포물면 돔 헤드 & 일체형 꼬리 스트림)
 * - [태양 - 지구 - 나의 별] 우주적 거리 체감 스케일 바
 */

class OrbitalArcDial {
  constructor(viewportEl, trackEl, badgeEl, options) {
    this.viewport = viewportEl;
    this.track = trackEl;
    this.badge = badgeEl;
    this.options = Object.assign({
      min: 1,
      max: 12,
      value: 1,
      unit: "월",
      angleStep: 22, // 숫자 간 각도 간격 대폭 확장 (도)
      radius: 75,    // 궤도 반지름 확장
      onChange: null
    }, options);

    this.currentValue = this.options.value;
    this.currentAngle = -(this.currentValue - this.options.min) * this.options.angleStep;
    this.targetAngle = this.currentAngle;
    this.isDragging = false;
    this.startY = 0;
    this.startX = 0;
    this.items = [];

    this.init();
  }

  init() {
    this.buildItems();
    this.bindEvents();
    this.setValue(this.currentValue);
  }

  setMax(newMax) {
    this.options.max = newMax;
    if (this.currentValue > newMax) {
      this.setValue(newMax);
    } else {
      this.buildItems();
      this.updatePositions();
    }
  }

  buildItems() {
    this.track.innerHTML = '';
    this.items = [];

    for (let i = this.options.min; i <= this.options.max; i++) {
      const el = document.createElement('div');
      el.className = 'arc-num-item';
      el.textContent = i;
      this.track.appendChild(el);
      this.items.push({ value: i, el: el });
    }
  }

  setValue(val) {
    this.currentValue = Math.max(this.options.min, Math.min(this.options.max, val));
    this.targetAngle = -(this.currentValue - this.options.min) * this.options.angleStep;
    this.currentAngle = this.targetAngle;
    this.updatePositions();
    this.updateBadge();
    if (this.options.onChange) this.options.onChange(this.currentValue);
  }

  bindEvents() {
    // 1. 터치 드래그
    this.viewport.addEventListener('touchstart', (e) => {
      this.isDragging = true;
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      const dx = e.touches[0].clientX - this.startX;
      const dy = e.touches[0].clientY - this.startY;
      const delta = (Math.abs(dx) > Math.abs(dy) ? dx : -dy) * 0.40;
      this.targetAngle += delta;
      this.clampTargetAngle();
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
      this.currentAngle = this.targetAngle;
      this.updatePositions();
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.snapToNearest();
    });

    // 2. 마우스 드래그
    this.viewport.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;
      const delta = (Math.abs(dx) > Math.abs(dy) ? dx : -dy) * 0.40;
      this.targetAngle += delta;
      this.clampTargetAngle();
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.currentAngle = this.targetAngle;
      this.updatePositions();
    });

    window.addEventListener('mouseup', () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.snapToNearest();
    });

    // 3. 휠 스크롤
    this.viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = (e.deltaY > 0 ? -1 : 1) * this.options.angleStep;
      this.targetAngle += delta;
      this.clampTargetAngle();
      this.snapToNearest();
    }, { passive: false });
  }

  clampTargetAngle() {
    const minAngle = -(this.options.max - this.options.min) * this.options.angleStep;
    const maxAngle = 0;
    this.targetAngle = Math.max(minAngle - 10, Math.min(maxAngle + 10, this.targetAngle));
  }

  snapToNearest() {
    const index = Math.round(-this.targetAngle / this.options.angleStep);
    const clampedIndex = Math.max(0, Math.min(this.options.max - this.options.min, index));
    this.currentValue = this.options.min + clampedIndex;
    this.targetAngle = -clampedIndex * this.options.angleStep;
    this.currentAngle = this.targetAngle;
    this.updatePositions();
    this.updateBadge();
    if (this.options.onChange) this.options.onChange(this.currentValue);
  }

  updateBadge() {
    if (this.badge) {
      this.badge.textContent = `${this.currentValue}${this.options.unit}`;
    }
  }

  updatePositions() {
    const centerX = 77.5; // 뷰포트 너비 155px의 정확한 중심
    const centerY = 85;   // 궤도 원의 하단 중심축

    this.items.forEach((item, idx) => {
      const itemAngle = this.currentAngle + (idx * this.options.angleStep);
      const rad = (itemAngle * Math.PI) / 180;

      // 상단 30% 호(-45° ~ +45°) 상의 정밀 위치 계산
      const x = centerX + this.options.radius * Math.sin(rad);
      const y = centerY - this.options.radius * Math.cos(rad);

      const isCentered = Math.abs(itemAngle) < (this.options.angleStep * 0.40);

      if (Math.abs(itemAngle) > 48) {
        item.el.style.opacity = '0';
        item.el.style.pointerEvents = 'none';
      } else {
        const distRatio = Math.cos(rad);
        // 중심 외의 숫자는 가파르게 페이드아웃하여 겹침 100% 방지
        item.el.style.opacity = `${Math.pow(distRatio, 4.0)}`;
        item.el.style.pointerEvents = 'auto';
      }

      // 숫자 요소 중심 정렬 (너비 32px, 높이 28px)
      item.el.style.transform = `translate(${x - 16}px, ${y - 14}px) rotate(${itemAngle * 0.35}deg)`;

      if (isCentered) {
        item.el.classList.add('active');
      } else {
        item.el.classList.remove('active');
      }
    });
  }
}

class YourStarApp {
  constructor() {
    this.currentStar = null;
    this.selectedMonth = 8;
    this.selectedDay = 25;
    this.preferVisibleStar = true;
    this.activeZodiacId = null;

    // 코어 시스템 인스턴스
    this.cometSystem = null;
    this.arManager = null;
    this.monthDial = null;
    this.dayDial = null;

    // DOM 참조
    this.dom = {
      cosmicQuoteContainer: document.getElementById('cosmic-quote-container'),
      cosmicQuoteText: document.getElementById('cosmic-quote-text'),
      cosmicQuoteAuthor: document.getElementById('cosmic-quote-author'),
      dateInputSection: document.getElementById('date-input-section'),
      onboardingScreen: document.getElementById('onboarding-screen'),
      checkVisiblePriority: document.getElementById('check-visible-priority'),
      btnLaunch: document.getElementById('btn-launch'),
      arVideo: document.getElementById('ar-video-feed'),
      canvasContainer: document.getElementById('canvas-container'),
      
      // HUD
      arHud: document.querySelector('.ar-hud'),
      arGuideBar: document.querySelector('.ar-guide-bar'),
      hudTargetName: document.getElementById('hud-target-name'),
      hudAstroInfo: document.getElementById('hud-astro-info'),
      hudDistTag: document.getElementById('hud-dist-tag'),
      hudDistMarker: document.getElementById('hud-dist-marker'),
      hudDistFill: document.getElementById('hud-dist-fill'),
      btnCalibrate: document.getElementById('btn-calibrate'),
      btnResetDate: document.getElementById('btn-reset-date'),
      
      // Bottom Sheet
      bottomSheet: document.getElementById('bottom-sheet'),
      btnCloseSheet: document.getElementById('btn-close-sheet'),
      sheetBadge: document.getElementById('sheet-badge'),
      sheetTitle: document.getElementById('sheet-title'),
      sheetImage: document.getElementById('sheet-image'),
      sheetHistoryBox: document.getElementById('sheet-history-box'),
      sheetHistoryText: document.getElementById('sheet-history-text'),
      sheetStory: document.getElementById('sheet-story'),
      sheetObsTitle: document.getElementById('sheet-obs-title'),
      sheetObsDesc: document.getElementById('sheet-obs-desc'),
      specDistance: document.getElementById('spec-distance'),
      specSpeed: document.getElementById('spec-speed'),
      specCatalog: document.getElementById('spec-catalog'),
      specConstellation: document.getElementById('spec-constellation')
    };

    // [풍부한 우주 & 별 관련 감성 명언 풀 50선: 입장할 때마다 랜덤 노출]
    this.cosmicQuotes = [
      { quote: "저 점을 다시 보세요. 저것이 여기입니다. 저것이 우리의 고향이며, 저것이 우리입니다.", author: "칼 세이건, 《창백한 푸른 점》" },
      { quote: "우리는 모두 별에서 만들어진 먼지이며, 우주가 스스로를 이해하는 방법입니다.", author: "칼 세이건, 《코스모스》" },
      { quote: "어딘가에는 엄청난 무언가가 알려지기를 기다리고 있습니다.", author: "칼 세이건" },
      { quote: "별들은 수억 년 동안 빛나며, 오늘 밤 당신의 눈동자에 닿기 위해 어둠을 건너왔습니다.", author: "아서 C. 클라크" },
      { quote: "우주에 존재하는 가장 아름다운 것은 바로 신비 그 자체입니다. 그것이야말로 모든 진정한 예술과 과학의 근원입니다.", author: "알베르트 아인슈타인" },
      { quote: "내 별은 저 많은 별들 중 하나일 뿐이지만, 그렇기에 모든 별들이 당신을 향해 빛나게 될 것입니다.", author: "앙투안 드 생텍쥐페리, 《어린 왕자》" },
      { quote: "사막이 아름다운 것은 어딘가에 우물을 숨기고 있기 때문이고, 밤하늘이 아름다운 것은 눈에 보이지 않는 별이 있기 때문입니다.", author: "앙투안 드 생텍쥐페리" },
      { quote: "발밑을 보지 말고 고개를 들어 하늘의 별을 바라보세요. 호기심을 잃지 마세요.", author: "스티븐 호킹" },
      { quote: "우주가 우리가 사랑하는 사람들을 담고 있는 곳이 아니라면, 우주는 그저 텅 빈 공간에 불과합니다.", author: "스티븐 호킹" },
      { quote: "밤하늘의 어둠은 별빛이 존재하기 위한 무대이며, 당신의 탄생은 그 무대 위에 켜진 촛불입니다.", author: "에드윈 허블" },
      { quote: "별을 바라볼 때면 나는 항상 꿈을 꿉니다. 별을 향해 걸어갈 수 있는 지도가 있다면 얼마나 좋을까요.", author: "빈센트 반 고흐" },
      { quote: "내가 확실하게 아는 것은 아무것도 없습니다. 하지만 별들을 바라보는 것만으로도 나는 언제나 꿈을 꾸게 됩니다.", author: "빈센트 반 고흐" },
      { quote: "우리는 어둠 속에서도 별을 바라봅니다. 그것이 인간이 밤을 견디는 방식입니다.", author: "랄프 왈도 에머슨" },
      { quote: "천문학은 인간에게 겸손을 가르치고, 동시에 인간의 영혼을 가장 높은 곳으로 인도합니다.", author: "칼 세이건" },
      { quote: "우리의 몸을 이루는 원자들은 수십억 년 전 폭발한 초신성의 중심부에서 만들어졌습니다. 당신은 글자 그대로 별의 자손입니다.", author: "로렌스 크라우스" },
      { quote: "우주를 바라볼 때 우리는 과거를 봅니다. 오늘 밤 당신이 마주한 빛은 수천 년의 시간을 여행해 온 기적입니다.", author: "닐 드그라스 타이슨" },
      { quote: "별빛은 어둠 속에서만 그 진정한 찬란함을 드러냅니다.", author: "마틴 루터 킹" },
      { quote: "침묵하는 우주 속에서 하나의 빛으로 태어난 당신이라는 기적.", author: "YourStar 천문 아카이브" },
      { quote: "우주는 영원하지만, 오늘 밤 당신이 올려다보는 이 밤하늘은 오직 당신만을 위해 준비된 유일한 순간입니다.", author: "YourStar 천문 아카이브" },
      { quote: "별은 결코 서두르지 않지만, 자신만의 궤도를 따라 언제나 제자리를 찾아갑니다.", author: "파울로 코엘료" },
      { quote: "하늘에는 수많은 별이 있고, 우리 마음속에는 수많은 꿈이 있습니다. 그 둘은 서로를 비춥니다.", author: "임마누엘 칸트" },
      { quote: "우리가 별을 바라보는 이유는, 우리가 어디서 왔는지 기억하기 위해서입니다.", author: "조슬린 벨 버넬" },
      { quote: "밤이 깊을수록 별은 더욱 빛납니다. 당신의 가장 깊은 어둠 또한 가장 눈부신 빛을 품고 있습니다.", author: "표도르 도스토옙스키" },
      { quote: "우주는 당신을 우연히 만든 것이 아닙니다. 138억 년의 역사가 당신이라는 한 사람을 빚어냈습니다.", author: "브라이언 콕스" },
      { quote: "모든 인간은 저마다의 가슴속에 은하수를 품고 살아갑니다.", author: "칼 융" },
      { quote: "별빛 하나에 추억과, 별빛 하나에 사랑과, 별빛 하나에 쓸쓸함과, 별빛 하나에 동경을.", author: "윤동주, 《별 헤는 밤》" },
      { quote: "어둠이 빛을 삼킬 수는 없습니다. 단 하나의 작은 촛불, 단 하나의 별빛이 온 우주의 어둠을 밝힙니다.", author: "프란치스코 하비에르" },
      { quote: "우리는 시공간이라는 광활한 바다에 떠 있는 푸른 섬에서 서로의 손을 잡고 있습니다.", author: "칼 세이건" },
      { quote: "저 멀리 반짝이는 별은 이미 사라졌을지도 모릅니다. 그러나 그 빛은 여전히 우리를 위로합니다.", author: "무라카미 하루키" },
      { quote: "별을 만지려 손을 뻗는 자는 비록 별을 따지 못할지라도 손에 흙을 묻히지는 않습니다.", author: "브루클린 속담" },
      { quote: "당신이 태어난 날, 우주는 새로운 별 하나를 밤하늘에 새겨 넣었습니다.", author: "YourStar 천문 아카이브" },
      { quote: "우주는 침묵 속에서 가장 웅장한 음악을 연주하고 있습니다.", author: "요하네스 케플러" },
      { quote: "우리가 우주를 탐구할수록 발견하게 되는 것은 우주가 아니라 바로 우리 자신입니다.", author: "베르나르 베르베르" },
      { quote: "모든 별에는 각자의 이름이 있고, 모든 생명에는 저마다의 빛이 있습니다.", author: "탈무드" },
      { quote: "별은 어둠을 두려워하지 않습니다. 어둠이 있기에 자신이 빛날 수 있음을 알기 때문입니다.", author: "헤르만 헤세" },
      { quote: "시간은 흐르지만, 별빛에 새겨진 당신의 이야기는 영원히 우주를 유영합니다.", author: "YourStar 천문 아카이브" },
      { quote: "가장 먼 곳의 별빛이 내 눈에 닿는 순간, 나는 비로소 우주와 하나가 됩니다.", author: "헨리 데이비드 소로" },
      { quote: "태양은 지구를 비추고, 별은 인간의 영혼을 비춥니다.", author: "빅토르 위고" },
      { quote: "우리는 진흙탕 속에 있을지라도, 우리 중 누군가는 하늘의 별들을 바라보고 있습니다.", author: "오스카 와일드" },
      { quote: "빛을 퍼뜨리는 방법에는 두 가지가 있습니다. 촛불이 되거나, 그것을 비추는 거울이 되는 것입니다.", author: "이디스 워튼" },
      { quote: "우주는 우리 안에 있습니다. 우리는 별의 물질로 만들어졌습니다.", author: "칼 세이건" },
      { quote: "그대 눈동자에 깃든 반짝임은 머나먼 은하수가 건넨 오랜 약속입니다.", author: "YourStar 천문 아카이브" },
      { quote: "아무리 작은 별이라도 밤하늘 전체의 조화를 위해 반드시 필요한 존재입니다.", author: "플라톤" },
      { quote: "우리가 숨 쉬는 공기 한 모금에도 수천만 광년을 건너온 별의 숨결이 깃들어 있습니다.", author: "할로우 섀플리" },
      { quote: "별빛을 따라 걷는 자는 결코 길을 잃지 않습니다.", author: "단테 알리기에리" },
      { quote: "당신이 존재하는 것만으로도 이 차가운 우주는 조금 더 따뜻해집니다.", author: "YourStar 천문 아카이브" },
      { quote: "별들이 서로 멀리 떨어져 있는 이유는 각자의 빛을 온전히 발하기 위함입니다.", author: "장 지오노" },
      { quote: "우주라는 무한한 도화지 위에 오늘 밤 당신이라는 가장 눈부신 별자리를 그립니다.", author: "YourStar 천문 아카이브" },
      { quote: "별을 노래하는 마음으로 모든 죽어가는 것을 사랑해야지.", author: "윤동주, 《서시》" },
      { quote: "우주 끝에서 시작된 여행이 오늘 밤 당신의 마음에 닻을 내립니다.", author: "YourStar 천문 아카이브" }
    ];

    this.init();
  }

  init() {
    this.initCosmicQuoteAndDateFlow();
    this.initOrbitalDials();
    this.init3DSystem();
    this.bindDOMEvents();
  }

  // --- 0. 감성 우주 명언 인트로 -> 3초 후 날짜 입력창 오픈 플로우 ---
  initCosmicQuoteAndDateFlow() {
    if (this.dom.cosmicQuoteText && this.dom.cosmicQuoteAuthor) {
      const selected = this.cosmicQuotes[Math.floor(Math.random() * this.cosmicQuotes.length)];
      this.dom.cosmicQuoteText.textContent = `"${selected.quote}"`;
      this.dom.cosmicQuoteAuthor.textContent = `— ${selected.author}`;
    }

    // 3.0초 후 날짜 입력창이 자연스럽게 스르륵 열림
    setTimeout(() => {
      if (this.dom.dateInputSection) {
        this.dom.dateInputSection.classList.add('revealed');
      }
    }, 2800);

    // [중요: 궤도 점프 방지 사전 GPS 프리로드]
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (window.astroEngine) {
            window.astroEngine.setLocation(pos.coords.latitude, pos.coords.longitude);
          }
        },
        () => {},
        { timeout: 3000 }
      );
    }
  }

  // --- 1. 상단 30% 궤도 아크 날짜 다이얼 초기화 ---
  initOrbitalDials() {
    const monthViewport = document.getElementById('month-dial-viewport');
    const monthTrack = document.getElementById('month-numbers-track');
    const monthBadge = document.getElementById('month-display-text');

    const dayViewport = document.getElementById('day-dial-viewport');
    const dayTrack = document.getElementById('day-numbers-track');
    const dayBadge = document.getElementById('day-display-text');

    this.monthDial = new OrbitalArcDial(monthViewport, monthTrack, monthBadge, {
      min: 1,
      max: 12,
      value: this.selectedMonth,
      unit: "월",
      onChange: (m) => {
        this.selectedMonth = m;
        this.updateDaysInMonth();
      }
    });

    this.dayDial = new OrbitalArcDial(dayViewport, dayTrack, dayBadge, {
      min: 1,
      max: 31,
      value: this.selectedDay,
      unit: "일",
      onChange: (d) => {
        this.selectedDay = d;
      }
    });

    this.updateDaysInMonth();
  }

  updateDaysInMonth() {
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][this.selectedMonth - 1];
    if (this.dayDial) {
      this.dayDial.setMax(daysInMonth);
    }
  }

  // --- 2. 3D 렌더링 & 천문 시스템 초기화 ---
  init3DSystem() {
    this.stellarEngine = new StellarEngine('canvas-container', {
      onStarClick: (starData) => {
        this.openBottomSheet(starData);
      },
      onConstellationClick: (constellationData) => {
        const primeStar = constellationData.stars[0] || {
          name: constellationData.name,
          ra: 0,
          dec: 0,
          distance: "수백 광년",
          mag: 2.0,
          spec: "주계열성",
          desc: constellationData.story
        };
        this.openConstellationBottomSheet(primeStar, constellationData);
      },
      onUpdate: () => {
        if (this.arManager) {
          this.arManager.update();
        }
      }
    });

    this.arManager = new AROrientationManager(this.stellarEngine.camera, this.dom.canvasContainer, {
      onCameraStarted: () => {
        this.dom.arVideo.classList.add('active');
      },
      onOrientationUpdate: () => {
        this.updateHUDCoordinates();
      }
    });
  }

  // --- 3. 이벤트 바인딩 ---
  bindDOMEvents() {
    // 생일 별 찾기 (Launch)
    if (this.dom.btnLaunch) {
      const handleLaunch = (e) => {
        if (e) {
          try { e.stopPropagation(); } catch (err) {}
        }
        this.startStarExperience();
      };

      this.dom.btnLaunch.addEventListener('click', handleLaunch);
      this.dom.btnLaunch.addEventListener('touchend', handleLaunch);
    }

    // 나침반 수동 보정
    if (this.dom.btnCalibrate) {
      this.dom.btnCalibrate.addEventListener('click', () => {
        if (this.arManager) {
          this.arManager.adjustCompassOffset(45);
        }
        this.updateStellarPosition();
      });
    }

    // 날짜 다시 입력 (UI 클린 격리 및 온보딩 복원)
    if (this.dom.btnResetDate) {
      this.dom.btnResetDate.addEventListener('click', () => {
        if (this.dom.onboardingScreen) {
          this.dom.onboardingScreen.classList.remove('hidden');
        }
        if (this.dom.arHud) {
          this.dom.arHud.classList.remove('ar-active');
        }
        if (this.dom.arGuideBar) {
          this.dom.arGuideBar.classList.remove('ar-active');
        }
        if (this.dom.bottomSheet) {
          this.dom.bottomSheet.classList.remove('ar-active');
          this.dom.bottomSheet.classList.remove('open');
        }
        if (this.dom.dateInputSection) {
          this.dom.dateInputSection.classList.add('revealed');
        }
        this.closeBottomSheet();
      });
    }

    // 바텀 시트 닫기
    if (this.dom.btnCloseSheet) {
      this.dom.btnCloseSheet.addEventListener('click', () => {
        this.closeBottomSheet();
      });
    }
  }

  // --- 4. 생일 별 탐색 시작 플로우 ---
  async startStarExperience() {
    try {
      this.preferVisibleStar = this.dom.checkVisiblePriority ? this.dom.checkVisiblePriority.checked : true;

      // [iOS Safari 핵심] 사용자 클릭 제스처 컨텍스트 안에서 즉시 센서 권한 요청
      if (this.arManager) {
        try { this.arManager.enableDeviceSensors(); } catch (e) {}
      }

      // 1. Web AR 카메라 시작
      if (this.arManager) {
        try { await this.arManager.startARSession('ar-video-feed'); } catch (e) {}
      }

      // 2. 생일 별 NASA 사진 및 4px 별자리 & 4px 공전 궤도 렌더링
      this.updateStellarPosition();

      // 3. 온보딩 모달 숨기고 AR HUD 및 가이드 바 활성화
      if (this.dom.onboardingScreen) this.dom.onboardingScreen.classList.add('hidden');
      if (this.dom.arHud) this.dom.arHud.classList.add('ar-active');
      if (this.dom.arGuideBar) this.dom.arGuideBar.classList.add('ar-active');
      if (this.dom.bottomSheet) this.dom.bottomSheet.classList.add('ar-active');
    } catch (err) {
      console.warn("startStarExperience fallback:", err);
      if (this.dom.onboardingScreen) this.dom.onboardingScreen.classList.add('hidden');
      if (this.dom.arHud) this.dom.arHud.classList.add('ar-active');
      if (this.dom.arGuideBar) this.dom.arGuideBar.classList.add('ar-active');
    }
  }

  // --- 5. 실시간 천문 좌표 & NASA 실사 천체 & 별자리 렌더링 갱신 ---
  updateStellarPosition() {
    const star = window.nasaStarDB.getStarByDate(
      this.selectedMonth,
      this.selectedDay,
      this.preferVisibleStar,
      window.astroEngine
    );
    this.currentStar = star;

    // 생일 수호 별자리 ID 확인
    this.activeZodiacId = window.getZodiacByBirthday(this.selectedMonth, this.selectedDay);

    // NASA 실사 고화질 사진 및 4px 공전 궤도선 렌더링
    this.stellarEngine.setupStellarObject(star, window.astroEngine);

    // 4px 두께의 선명한 별자리 튜브 라인 렌더링
    this.stellarEngine.renderConstellations(window.astroEngine, this.activeZodiacId);

    // PC 뷰어일 경우 시작 시 별 방향으로 시선 자연스럽게 정렬
    if (!this.arManager.isSensorActive && this.stellarEngine.currentStarPos) {
      this.arManager.lookAtPosition(this.stellarEngine.currentStarPos);
    }

    // HUD 정보 및 [태양 - 지구 - 나의 별] 거리 스케일 바 갱신
    const cart = window.astroEngine.getCartesianFromEquatorial(star.ra, star.dec, 380);
    this.dom.hudTargetName.textContent = star.name;
    const cardDir = window.astroEngine.getCardinalDirection(cart.azimuth);
    const altText = cart.altitude >= 0 ? `고도 +${cart.altitude}°` : `고도 ${cart.altitude}° (지평선 아래)`;
    this.dom.hudAstroInfo.textContent = `${cardDir} ${cart.azimuth}° • ${altText} (${star.constellation})`;

    const distNum = star.distance_num || 5000;
    const auNum = distNum * 63241.077;
    const auStr = auNum >= 100000000 ? `${(auNum / 100000000).toFixed(1)}억 AU` : `${Math.round(auNum).toLocaleString()} AU`;

    if (this.dom.hudDistTag) {
      this.dom.hudDistTag.textContent = `★ 나의 별 (${auStr} • ${star.distance_ly || "수천 광년"})`;
    }
    if (this.dom.hudDistMarker) {
      // 태양(0%) - 지구(18%) - 나의별(18% ~ 95%) 로그 스케일링
      const logMin = Math.log10(10);      // 10 ly
      const logMax = Math.log10(2500000); // 250만 ly
      const curLog = Math.log10(Math.max(10, distNum));
      const starRatio = Math.min(1.0, Math.max(0, (curLog - logMin) / (logMax - logMin)));
      
      const totalLeftPercent = 18 + starRatio * (95 - 18);
      this.dom.hudDistMarker.style.left = `${totalLeftPercent.toFixed(1)}%`;
      if (this.dom.hudDistFill) {
        this.dom.hudDistFill.style.width = `${(totalLeftPercent - 18).toFixed(1)}%`;
      }
    }
  }

  updateHUDCoordinates() {
    if (!this.currentStar) return;
    const cart = window.astroEngine.getCartesianFromEquatorial(this.currentStar.ra, this.currentStar.dec, 380);
    const cardDir = window.astroEngine.getCardinalDirection(cart.azimuth);
    const altText = cart.altitude >= 0 ? `고도 +${cart.altitude}°` : `고도 ${cart.altitude}° (지평선 아래)`;
    this.dom.hudAstroInfo.textContent = `${cardDir} ${cart.azimuth}° • ${altText} (${this.currentStar.constellation})`;
  }

  // --- 6. NASA 생일 별 바텀 시트 열기 ---
  openBottomSheet(starData) {
    if (!starData || !window.astroEngine) return;
    const obsStatus = window.astroEngine.getObservationStatus(starData.ra, starData.dec);

    let badgeText = `${this.selectedMonth}월 ${this.selectedDay}일의 탄생 천체 • ${starData.type}`;
    if (starData.isVisiblePriorityMatch) {
      badgeText = `현재 밤하늘 관측 추천 • ${starData.type}`;
    }
    if (this.dom.sheetBadge) this.dom.sheetBadge.textContent = badgeText;
    if (this.dom.sheetTitle) this.dom.sheetTitle.textContent = starData.name;
    if (this.dom.sheetImage) this.dom.sheetImage.src = starData.image;
    if (this.dom.sheetStory) this.dom.sheetStory.textContent = `"${starData.story}"`;

    if (this.dom.sheetHistoryText) {
      this.dom.sheetHistoryText.textContent = starData.history_story || 
        `${starData.distance_ly || "수천 년"} 전 우주를 떠난 빛이 긴 영겁의 여행 끝에 오늘 밤 당신의 눈에 도착했습니다.`;
    }

    if (this.dom.sheetObsTitle) this.dom.sheetObsTitle.textContent = obsStatus.statusTitle;
    if (this.dom.sheetObsDesc) this.dom.sheetObsDesc.textContent = obsStatus.statusDesc;

    if (this.dom.specDistance) this.dom.specDistance.textContent = starData.distance_ly || "수천 광년";
    if (this.dom.specSpeed) this.dom.specSpeed.textContent = starData.orbital_speed || "약 220 km/s";
    if (this.dom.specCatalog) this.dom.specCatalog.textContent = starData.catalog;
    if (this.dom.specConstellation) this.dom.specConstellation.textContent = starData.constellation;

    if (this.dom.bottomSheet) {
      this.dom.bottomSheet.classList.add('ar-active');
      this.dom.bottomSheet.classList.add('open');
    }
  }

  // --- 7. 별자리 개별 항성 클릭 시 상세 정보 바텀시트 열기 ---
  openConstellationBottomSheet(starInfo, constellation) {
    if (!starInfo || !constellation || !window.astroEngine) return;
    const obsStatus = window.astroEngine.getObservationStatus(starInfo.ra, starInfo.dec);

    if (this.dom.sheetBadge) this.dom.sheetBadge.textContent = `${constellation.name} (${constellation.latin}) • ${constellation.season}의 별자리`;
    if (this.dom.sheetTitle) this.dom.sheetTitle.textContent = starInfo.name;
    if (this.dom.sheetImage) this.dom.sheetImage.src = "https://images-assets.nasa.gov/image/PIA18224/PIA18224~orig.jpg";
    if (this.dom.sheetStory) this.dom.sheetStory.textContent = `"${starInfo.desc} — ${constellation.story}"`;

    if (this.dom.sheetHistoryText) {
      this.dom.sheetHistoryText.textContent = `${starInfo.distance} 전 우주를 출발한 빛이 오늘 당신의 시야에 닿았습니다.`;
    }

    if (this.dom.sheetObsTitle) this.dom.sheetObsTitle.textContent = obsStatus.statusTitle;
    if (this.dom.sheetObsDesc) this.dom.sheetObsDesc.textContent = obsStatus.statusDesc;

    if (this.dom.specDistance) this.dom.specDistance.textContent = starInfo.distance;
    if (this.dom.specSpeed) this.dom.specSpeed.textContent = starInfo.spec;
    if (this.dom.specCatalog) this.dom.specCatalog.textContent = `겉보기 밝기: ${starInfo.mag}등급`;
    if (this.dom.specConstellation) this.dom.specConstellation.textContent = `${constellation.name} (${constellation.symbol})`;

    if (this.dom.bottomSheet) {
      this.dom.bottomSheet.classList.add('ar-active');
      this.dom.bottomSheet.classList.add('open');
    }
  }

  closeBottomSheet() {
    if (this.dom.bottomSheet) {
      this.dom.bottomSheet.classList.remove('open');
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new YourStarApp();
});
