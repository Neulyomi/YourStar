/**
 * NASA 실사 천체 AR 렌더링 엔진 (Stellar AR Engine)
 * - 혜성 및 파티클 완전 삭제
 * - NASA 실제 촬영 고화질 우주 사진을 AR 밤하늘 3D 천구 좌표에 직접 빌보드로 렌더링
 * - 부드러운 원형 비네팅 알파 마스크로 검은 밤하늘에 자연스럽게 융합
 * - 60fps 무지연 경량 렌더링
 */

class StellarEngine {
  constructor(canvasContainer, options = {}) {
    this.container = canvasContainer;
    this.options = Object.assign({
      onStarClick: null,
      onUpdate: null
    }, options);

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // 씬 레이어 그룹
    this.horizonGroup = new THREE.Group();
    this.starFieldGroup = new THREE.Group();
    this.constellationGroup = new THREE.Group();
    this.orbitGroup = new THREE.Group();
    this.stellarObjectGroup = new THREE.Group();

    // 텍스처 로더 & 캐시
    this.textureLoader = new THREE.TextureLoader();
    this.textureLoader.crossOrigin = "anonymous";
    this.loadedTextureCache = {};

    // 인터랙션
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.interactiveObjects = [];

    this.currentStarData = null;
    this.currentStarPos = new THREE.Vector3(0, 20, -50);
    this.targetHaloMesh = null;
    this.stellarSprite = null;

    // 공전 궤도 광자 파티클
    this.orbitFlowPoints = null;
    this.orbitFlowOffsets = [];
    this.orbitFlowCount = 28;
    this.fullOrbitCurve = null;

    this.init();
  }

  init() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. 씬 & 카메라
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 0.01);

    // 2. 렌더러
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 3. 절차적 텍스처
    this.starDiscTex = this.createStarDiscTexture();
    this.defaultGlowTex = this.createDefaultStellarGlowTexture();
    this.softDotTex = this.createSoftDotTexture();

    // 4. 배경 심우주 별무리 (2,800개)
    this.buildBackgroundStarField();

    // 5. 지평선 콤파스 그리드
    this.buildHorizonGrid();

    // 6. 그룹 추가
    this.scene.add(this.horizonGroup);
    this.scene.add(this.starFieldGroup);
    this.scene.add(this.orbitGroup);
    this.scene.add(this.constellationGroup);
    this.scene.add(this.stellarObjectGroup);

    // 7. 이벤트 바인딩
    this.bindEvents();

    // 8. 렌더 루프
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  /**
   * [핵심: 4px 굵기 실린더 튜브 라인 생성기]
   * WebGL의 1px 선 제한을 극복하고 어느 각도에서나 4px 굵기로 선명하게 빛나는 3D 라인 메쉬 생성
   */
  createThickLineMesh(p1, p2, radius = 0.18, colorHex = 0x38bdf8, opacity = 0.65) {
    const dir = new THREE.Vector3().subVectors(p2, p1);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    const geo = new THREE.CylinderGeometry(radius, radius, len, 6, 1, true);
    const mat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(mid);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return mesh;
  }

  createStarDiscTexture() {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 64, 64);

    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    g.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    g.addColorStop(0.35, 'rgba(224, 242, 254, 0.9)');
    g.addColorStop(0.70, 'rgba(56, 189, 248, 0.4)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(c);
    tex.premultiplyAlpha = true;
    return tex;
  }

  createDefaultStellarGlowTexture() {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 128, 128);

    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 62);
    g.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    g.addColorStop(0.25, 'rgba(125, 211, 252, 0.8)');
    g.addColorStop(0.60, 'rgba(14, 165, 233, 0.3)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(64, 64, 62, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(c);
    tex.premultiplyAlpha = true;
    return tex;
  }

  createSoftDotTexture() {
    const c = document.createElement('canvas');
    c.width = 32; c.height = 32;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 32, 32);

    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 15);
    g.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    g.addColorStop(0.5, 'rgba(125, 211, 252, 0.7)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(16, 16, 15, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(c);
    tex.premultiplyAlpha = true;
    return tex;
  }

  createCircularStellarTexture(imageUrl, onSuccess, onError) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 512;
        const ctx = c.getContext('2d');

        // 1. 이미지를 1:1 정사각 중앙으로 크롭 & 드로잉
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 512, 512);

        // 2. [핵심: 원형 소프트 페이드아웃 알파 마스크 합성]
        // 사각형 사진 테두리를 100% 원형으로 부드럽게 잘라내고 우주 배경에 스며들게 함
        ctx.globalCompositeOperation = 'destination-in';
        const mask = ctx.createRadialGradient(256, 256, 100, 256, 256, 248);
        mask.addColorStop(0, 'rgba(0, 0, 0, 1.0)');     // 중심 100% 고화질 선명
        mask.addColorStop(0.70, 'rgba(0, 0, 0, 0.95)'); // 70% 반경까지 디테일 유지
        mask.addColorStop(0.92, 'rgba(0, 0, 0, 0.40)'); // 가장자리 부드러운 페이드
        mask.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');   // 외곽 완전 투명

        ctx.fillStyle = mask;
        ctx.beginPath();
        ctx.arc(256, 256, 248, 0, Math.PI * 2);
        ctx.fill();

        const tex = new THREE.CanvasTexture(c);
        tex.premultiplyAlpha = true;
        onSuccess(tex);
      } catch (e) {
        if (onError) onError(e);
      }
    };
    img.onerror = (err) => {
      if (onError) onError(err);
    };
    img.src = imageUrl;
  }

  buildHorizonGrid() {
    const radius = 52;
    
    // [핵심: 3px 굵기 나침반 궤도 튜브 토러스 메쉬]
    // WebGL 1px 선 대신 3D 원형 튜브(radius 0.15)로 렌더링하여 선명하고 굵은 나침반 궤도 구현
    const torusGeo = new THREE.TorusGeometry(radius, 0.15, 6, 128);
    // 토러스를 수평 지평선(XZ 평면)에 눕히기 위해 회전
    torusGeo.rotateX(Math.PI / 2);

    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.horizonGroup.add(new THREE.Mesh(torusGeo, torusMat));

    // 주요 방위각 틱 마크 (45도마다 3px 굵기 틱 바)
    for (let deg = 0; deg < 360; deg += 45) {
      const rad = deg * (Math.PI / 180);
      const innerPt = new THREE.Vector3((radius - 1.2) * Math.sin(rad), 0, -(radius - 1.2) * Math.cos(rad));
      const outerPt = new THREE.Vector3((radius + 1.2) * Math.sin(rad), 0, -(radius + 1.2) * Math.cos(rad));
      const tickMesh = this.createThickLineMesh(innerPt, outerPt, 0.14, 0x38bdf8, 0.70);
      this.horizonGroup.add(tickMesh);
    }

    const cardinalLabels = {
      0: "N 0°",
      45: "NE 45°",
      90: "E 90°",
      135: "SE 135°",
      180: "S 180°",
      225: "SW 225°",
      270: "W 270°",
      315: "NW 315°"
    };

    for (let deg = 0; deg < 360; deg += 15) {
      const rad = deg * (Math.PI / 180);
      const isMajor = (deg % 45 === 0);
      const labelText = cardinalLabels[deg] || `${deg}°`;

      const labelSprite = this.createHorizonLabelSprite(labelText, isMajor);
      const labelDist = radius + (isMajor ? 1.8 : 1.2);
      labelSprite.position.set(
        labelDist * Math.sin(rad),
        isMajor ? 0.6 : 0.4,
        -labelDist * Math.cos(rad)
      );
      this.horizonGroup.add(labelSprite);
    }
  }

  createHorizonLabelSprite(text, isMajor = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 128, 48);

    ctx.font = isMajor ? 'bold 22px "Plus Jakarta Sans", sans-serif' : '17px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = isMajor ? '#38bdf8' : 'rgba(224, 242, 254, 0.50)';
    ctx.fillText(text, 64, 24);

    const texture = new THREE.CanvasTexture(canvas);
    texture.premultiplyAlpha = true;

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const sprite = new THREE.Sprite(spriteMat);
    const scale = isMajor ? 3.6 : 2.5;
    sprite.scale.set(scale, scale * 0.375, 1);
    return sprite;
  }

  buildBackgroundStarField() {
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2800;
    const starPos = new Float32Array(starCount * 3);
    const starCol = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const r = 110 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);

      const rnd = Math.random();
      if (rnd > 0.85) {
        starCol[i * 3] = 0.45; starCol[i * 3 + 1] = 0.75; starCol[i * 3 + 2] = 1.0;
      } else if (rnd > 0.65) {
        starCol[i * 3] = 0.95; starCol[i * 3 + 1] = 0.65; starCol[i * 3 + 2] = 0.85;
      } else {
        starCol[i * 3] = 0.85; starCol[i * 3 + 1] = 0.90; starCol[i * 3 + 2] = 0.95;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.60,
      blending: THREE.AdditiveBlending,
      map: this.softDotTex,
      depthWrite: false
    });
    this.starFieldGroup.add(new THREE.Points(starGeo, starMat));
  }

  /**
   * [핵심: 4px 굵기 별자리 튜브 선 & 별자리 항성 렌더링]
   */
  renderConstellations(astroEngine, activeZodiacId = null) {
    while (this.constellationGroup.children.length > 0) {
      const child = this.constellationGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      this.constellationGroup.remove(child);
    }

    if (!window.CONSTELLATIONS_DATA) return;

    window.CONSTELLATIONS_DATA.forEach(constellation => {
      const isHighlighted = (constellation.id === activeZodiacId);
      const lineColorHex = isHighlighted ? 0xfef08a : 0x38bdf8;
      const lineOpacity = isHighlighted ? 0.85 : 0.45;
      const tubeRadius = isHighlighted ? 0.24 : 0.16; // [4px 굵기 튜브 라인]

      const starWorldPositions = [];

      // 1. 별자리 항성 렌더링 & 터치 히트박스 등록
      constellation.stars.forEach((s) => {
        const cart = astroEngine.getCartesianFromEquatorial(s.ra, s.dec, 55);
        const starPos = new THREE.Vector3(cart.x, cart.y, cart.z);
        starWorldPositions.push(starPos);

        const starMat = new THREE.SpriteMaterial({
          map: this.starDiscTex,
          color: isHighlighted ? 0xfffbeb : 0xe0f2fe,
          transparent: true,
          opacity: isHighlighted ? 0.95 : 0.70,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const starSprite = new THREE.Sprite(starMat);
        starSprite.position.copy(starPos);
        starSprite.scale.set(isHighlighted ? 2.0 : 1.4, isHighlighted ? 2.0 : 1.4, 1);
        this.constellationGroup.add(starSprite);

        // [모바일 별자리 터치 히트박스] 넉넉한 8.0 반경 구체
        const starHitGeo = new THREE.SphereGeometry(8.0, 8, 8);
        const starHitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
        const starHitMesh = new THREE.Mesh(starHitGeo, starHitMat);
        starHitMesh.position.copy(starPos);
        starHitMesh.userData = { isConstellationPin: true, constellationData: constellation };
        this.constellationGroup.add(starHitMesh);
        this.interactiveObjects.push(starHitMesh);
      });

      // 2. [4px 굵기 튜브 라인] 두 별 사이를 잇는 굵은 3D 튜브 메쉬
      constellation.lines.forEach(([i1, i2]) => {
        if (starWorldPositions[i1] && starWorldPositions[i2]) {
          const lineMesh = this.createThickLineMesh(
            starWorldPositions[i1],
            starWorldPositions[i2],
            tubeRadius,
            lineColorHex,
            lineOpacity
          );
          this.constellationGroup.add(lineMesh);
        }
      });
    });
  }

  /**
   * [핵심] NASA 실사 고화질 사진을 원형 소프트 마스크로 가공하여 AR 천문 3D 좌표에 직접 렌더링
   * + [4px 굵기 24시간 공전 궤도 튜브선 & 공전 광자 렌더링]
   */
  setupStellarObject(starData, astroEngine) {
    this.currentStarData = starData;

    // 기존 렌더링 청소
    while (this.stellarObjectGroup.children.length > 0) {
      const child = this.stellarObjectGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      this.stellarObjectGroup.remove(child);
    }
    while (this.orbitGroup.children.length > 0) {
      const child = this.orbitGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      this.orbitGroup.remove(child);
    }
    this.interactiveObjects = [];

    // 1. 해당 별의 실시간 3D 데카르트 천문 좌표 계산 (거리 50 고정 구면 투영)
    const cart = astroEngine.getCartesianFromEquatorial(starData.ra, starData.dec, 50);
    const starPos = new THREE.Vector3(cart.x, cart.y, cart.z);
    this.currentStarPos.copy(starPos);

    // 2. [4px 굵기 24시간 실제 공전 궤도 튜브선 (Diurnal Orbit Path)]
    const orbitPoints = astroEngine.getDiurnalOrbitPath(starData.ra, starData.dec, 50, 96);
    this.fullOrbitCurve = new THREE.CatmullRomCurve3(orbitPoints, true);

    // 4px 두께(radius 0.20)의 순백 발광 궤도 튜브 메쉬
    const orbitTubeGeo = new THREE.TubeGeometry(this.fullOrbitCurve, 96, 0.20, 8, true);
    const orbitTubeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.orbitGroup.add(new THREE.Mesh(orbitTubeGeo, orbitTubeMat));

    // 공전 궤도 위를 유영하는 28개 광점 입자
    this.orbitFlowCount = 28;
    this.orbitFlowOffsets = new Float32Array(this.orbitFlowCount);
    const orbitFlowPos = new Float32Array(this.orbitFlowCount * 3);
    for (let i = 0; i < this.orbitFlowCount; i++) {
      this.orbitFlowOffsets[i] = i / this.orbitFlowCount;
    }
    const orbitFlowGeo = new THREE.BufferGeometry();
    orbitFlowGeo.setAttribute('position', new THREE.BufferAttribute(orbitFlowPos, 3));
    const orbitFlowMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.4,
      map: this.starDiscTex,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.orbitFlowPoints = new THREE.Points(orbitFlowGeo, orbitFlowMat);
    this.orbitGroup.add(this.orbitFlowPoints);

    // 3. [NASA 실사 사진 원형 3D 빌보드 컨테이너]
    const container = new THREE.Group();
    container.position.copy(starPos);

    const photoScale = 11.0; // 웅장한 NASA 우주 사진 크기
    const spriteMat = new THREE.SpriteMaterial({
      map: this.defaultGlowTex,
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending, // 밤하늘과 자연스럽게 융합
      depthWrite: false
    });
    const stellarSprite = new THREE.Sprite(spriteMat);
    stellarSprite.scale.set(photoScale, photoScale, 1);
    container.add(stellarSprite);
    this.stellarSprite = stellarSprite;

    // NASA 고화질 이미지 원형 가공 및 텍스처 로딩 (캐싱 지원)
    if (starData.image) {
      if (this.loadedTextureCache[starData.image]) {
        spriteMat.map = this.loadedTextureCache[starData.image];
        spriteMat.needsUpdate = true;
      } else {
        this.createCircularStellarTexture(
          starData.image,
          (circularTex) => {
            this.loadedTextureCache[starData.image] = circularTex;
            spriteMat.map = circularTex;
            spriteMat.needsUpdate = true;
          },
          (err) => {
            console.warn("NASA image circular load fallback to standard loader:", err);
            this.textureLoader.load(starData.image, (tex) => {
              tex.premultiplyAlpha = true;
              this.loadedTextureCache[starData.image] = tex;
              spriteMat.map = tex;
              spriteMat.needsUpdate = true;
            });
          }
        );
      }
    }

    // 4. 중심 샤프한 초고휘도 핵
    const coreMat = new THREE.SpriteMaterial({
      map: this.starDiscTex,
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const coreSprite = new THREE.Sprite(coreMat);
    coreSprite.scale.set(2.2, 2.2, 1);
    container.add(coreSprite);

    // 5. [인터랙티브 터치 히트박스 & 미래형 타겟 링]
    // 모바일 터치 편의성을 위해 넉넉한 14.0 반경의 히트박스 구체 배치
    const hitGeo = new THREE.SphereGeometry(14.0, 8, 8);
    const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.userData = { isStellarPin: true, starData: starData };
    container.add(hitMesh);
    this.interactiveObjects.push(hitMesh);

    // 메인 타겟팅 헤일로 링 (원형 사진 외곽을 감싸는 5.8 반경)
    const ringGeo = new THREE.RingGeometry(5.8, 5.96, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.50,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    container.add(ringMesh);
    this.targetHaloMesh = ringMesh;

    // 외곽 보조 브래킷 링
    const subRingGeo = new THREE.RingGeometry(6.8, 6.90, 64);
    const subRingMat = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const subRingMesh = new THREE.Mesh(subRingGeo, subRingMat);
    container.add(subRingMesh);

    this.stellarObjectGroup.add(container);
  }

  bindEvents() {
    const handlePointerInteraction = (clientX, clientY, target) => {
      // 온보딩 화면이나 바텀 시트, 상단 HUD 버튼 터치 시 3D 레이캐스팅 무시
      if (target && (target.closest('#onboarding-screen') || target.closest('#bottom-sheet') || target.closest('.hud-card') || target.closest('.hud-controls'))) {
        return;
      }

      this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData && hit.userData.isStellarPin && this.options.onStarClick) {
          this.options.onStarClick(hit.userData.starData);
        } else if (hit.userData && hit.userData.isConstellationPin && this.options.onConstellationClick) {
          this.options.onConstellationClick(hit.userData.constellationData);
        }
      }
    };

    window.addEventListener('click', (e) => {
      handlePointerInteraction(e.clientX, e.clientY, e.target);
    });

    window.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches.length > 0) {
        handlePointerInteraction(e.changedTouches[0].clientX, e.changedTouches[0].clientY, e.target);
      }
    }, { passive: true });

    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    if (this.options.onUpdate) {
      this.options.onUpdate(delta, time);
    }

    // 타겟팅 헤일로 링 은은한 숨쉬기
    if (this.targetHaloMesh) {
      const ringScale = 1.0 + Math.sin(time * 2.0) * 0.05;
      this.targetHaloMesh.scale.set(ringScale, ringScale, ringScale);
      this.targetHaloMesh.lookAt(this.camera.position);
    }

    // [공전 궤도 광자 유영 (속도 0.004)]
    if (this.fullOrbitCurve && this.orbitFlowPoints && this.orbitFlowPoints.geometry.attributes.position) {
      const flowPos = this.orbitFlowPoints.geometry.attributes.position.array;
      const speed = 0.004;
      for (let i = 0; i < this.orbitFlowCount; i++) {
        const u = (this.orbitFlowOffsets[i] + time * speed) % 1.0;
        const pt = this.fullOrbitCurve.getPoint(u);
        flowPos[i * 3] = pt.x;
        flowPos[i * 3 + 1] = pt.y;
        flowPos[i * 3 + 2] = pt.z;
      }
      this.orbitFlowPoints.geometry.attributes.position.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.StellarEngine = StellarEngine;
