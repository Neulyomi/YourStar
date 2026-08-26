/**
 * 3D 천문 렌더링 엔진 (StellarEngine)
 * - [원거리 웅장 천구 돔 매핑: R = 380]
 * - 근거리 타원 왜곡(Perspective Distortion) 및 시각적 180도 플립 착시 완전 제거
 * - 4px 굵기 별자리 튜브선, 4px 24시간 공전 궤도선, 3px 나침반 토러스 메쉬
 * - NASA 제임스웹 초고해상도 실사 사진 원형 소프트 가우시안 마스킹 3D 빌보드
 */

class StellarEngine {
  constructor(containerId, options = {}) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!this.container) {
      this.container = document.getElementById('canvas-container') || document.body;
    }
    this.options = Object.assign({
      onStarClick: null,
      onConstellationClick: null,
      onUpdate: null
    }, options);

    // 씬 그래프 그룹 분리
    this.horizonGroup = new THREE.Group();
    this.starFieldGroup = new THREE.Group();
    this.orbitGroup = new THREE.Group();
    this.constellationGroup = new THREE.Group();
    this.stellarObjectGroup = new THREE.Group();

    this.interactiveObjects = [];
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.clock = new THREE.Clock();
    this.loadedTextureCache = {};
    this.textureLoader = new THREE.TextureLoader();

    this.init();
  }

  init() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. 씬 & 원거리 원근 카메라 (near: 0.5, far: 4000)
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.5, 4000);
    this.camera.position.set(0, 0, 0.01);
    this.camera.rotation.reorder('YXZ');

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

    // 4. 배경 심우주 별무리 (2,800개, R = 900~1500)
    this.buildBackgroundStarField();

    // 5. 지평선 콤파스 그리드 (R = 380)
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
   * [원거리 비례 4px 굵기 실린더 튜브 라인 생성기]
   */
  createThickLineMesh(p1, p2, radius = 1.2, colorHex = 0x38bdf8, opacity = 0.65) {
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

        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 512, 512);

        // 원형 소프트 가우시안 알파 마스킹
        ctx.globalCompositeOperation = 'destination-in';
        const mask = ctx.createRadialGradient(256, 256, 100, 256, 256, 248);
        mask.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
        mask.addColorStop(0.70, 'rgba(0, 0, 0, 0.95)');
        mask.addColorStop(0.92, 'rgba(0, 0, 0, 0.40)');
        mask.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

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

  /**
   * [원거리 지평선 나침반 그리드: R = 380]
   */
  buildHorizonGrid() {
    const radius = 380;
    
    // 3px 굵기 나침반 원형 튜브 토러스 메쉬
    const torusGeo = new THREE.TorusGeometry(radius, 0.9, 6, 128);
    torusGeo.rotateX(Math.PI / 2); // 수평 지평선(XZ 평면)으로 눕힘

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
      const innerPt = new THREE.Vector3((radius - 8.0) * Math.sin(rad), 0, -(radius - 8.0) * Math.cos(rad));
      const outerPt = new THREE.Vector3((radius + 8.0) * Math.sin(rad), 0, -(radius + 8.0) * Math.cos(rad));
      const tickMesh = this.createThickLineMesh(innerPt, outerPt, 0.8, 0x38bdf8, 0.70);
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
      const labelDist = radius + (isMajor ? 12.0 : 8.0);
      labelSprite.position.set(
        labelDist * Math.sin(rad),
        isMajor ? 4.0 : 2.5,
        -labelDist * Math.cos(rad)
      );
      this.horizonGroup.add(labelSprite);
    }
  }

  createHorizonLabelSprite(text, isMajor = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 256, 96);

    ctx.font = isMajor ? 'bold 44px "Plus Jakarta Sans", sans-serif' : '34px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = isMajor ? '#38bdf8' : 'rgba(224, 242, 254, 0.50)';
    ctx.fillText(text, 128, 48);

    const texture = new THREE.CanvasTexture(canvas);
    texture.premultiplyAlpha = true;

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const sprite = new THREE.Sprite(spriteMat);
    const scale = isMajor ? 24.0 : 16.0;
    sprite.scale.set(scale, scale * 0.375, 1);
    return sprite;
  }

  buildBackgroundStarField() {
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2800;
    const starPos = new Float32Array(starCount * 3);
    const starCol = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const r = 800 + Math.random() * 400;
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
      size: 7.0,
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
   * [원거리 4px 굵기 별자리 튜브 선 & 별자리 항성 렌더링: R = 380]
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
      const tubeRadius = isHighlighted ? 1.5 : 1.0; // 4px 굵기 튜브

      const starWorldPositions = [];

      // 1. 별자리 항성 렌더링 (R = 380)
      constellation.stars.forEach((s) => {
        const cart = astroEngine.getCartesianFromEquatorial(s.ra, s.dec, 380);
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
        const starScale = isHighlighted ? 14.0 : 10.0;
        starSprite.scale.set(starScale, starScale, 1);
        this.constellationGroup.add(starSprite);

        // [모바일 별자리 터치 히트박스] 넉넉한 45.0 반경 구체
        const starHitGeo = new THREE.SphereGeometry(45.0, 8, 8);
        const starHitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
        const starHitMesh = new THREE.Mesh(starHitGeo, starHitMat);
        starHitMesh.position.copy(starPos);
        starHitMesh.userData = { isConstellationPin: true, constellationData: constellation };
        this.constellationGroup.add(starHitMesh);
        this.interactiveObjects.push(starHitMesh);
      });

      // 2. 두 별 사이를 잇는 굵은 3D 튜브 메쉬
      if (constellation.lines && constellation.lines.length > 0) {
        constellation.lines.forEach(([idx1, idx2]) => {
          if (starWorldPositions[idx1] && starWorldPositions[idx2]) {
            const tubeMesh = this.createThickLineMesh(
              starWorldPositions[idx1],
              starWorldPositions[idx2],
              tubeRadius,
              lineColorHex,
              lineOpacity
            );
            this.constellationGroup.add(tubeMesh);
          }
        });
      }
    });
  }

  /**
   * [원거리 생일 별 & 24시간 공전 궤도선 렌더링: R = 380]
   */
  setupStellarObject(starData, astroEngine) {
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

    if (!starData) return;

    // 1. 생일 별의 실시간 3D 위치 산출 (R = 380)
    const orbitRadius = 380;
    const cart = astroEngine.getCartesianFromEquatorial(starData.ra, starData.dec, orbitRadius);
    const starPos = new THREE.Vector3(cart.x, cart.y, cart.z);

    // 2. 24시간 실제 일주 운동 궤적 튜브 렌더링
    const orbitPoints = astroEngine.getDiurnalOrbitPath(starData.ra, starData.dec, orbitRadius, 72);
    const orbitVectors = orbitPoints.map(p => new THREE.Vector3(p.x, p.y, p.z));
    
    this.fullOrbitCurve = new THREE.CatmullRomCurve3(orbitVectors, true);
    const orbitTubeGeo = new THREE.TubeGeometry(this.fullOrbitCurve, 128, 1.2, 8, true);
    const orbitTubeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
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
      size: 8.0,
      map: this.starDiscTex,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.orbitFlowPoints = new THREE.Points(orbitFlowGeo, orbitFlowMat);
    this.orbitGroup.add(this.orbitFlowPoints);

    // 3. NASA 실사 사진 원형 3D 빌보드 컨테이너
    const container = new THREE.Group();
    container.position.copy(starPos);

    const photoScale = 75.0; // 웅장한 NASA 우주 사진 크기
    const spriteMat = new THREE.SpriteMaterial({
      map: this.defaultGlowTex,
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const stellarSprite = new THREE.Sprite(spriteMat);
    stellarSprite.scale.set(photoScale, photoScale, 1);
    container.add(stellarSprite);
    this.stellarSprite = stellarSprite;

    // NASA 고화질 이미지 로딩
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

    // 타겟팅 헤일로 링 메쉬
    const haloGeo = new THREE.RingGeometry(photoScale * 0.58, photoScale * 0.62, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.80,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.targetHaloMesh = new THREE.Mesh(haloGeo, haloMat);
    container.add(this.targetHaloMesh);

    // 모바일 생일 별 터치 히트박스 (75.0 반경 구체)
    const hitGeo = new THREE.SphereGeometry(75.0, 8, 8);
    const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.userData = { isPrimeStar: true, starData: starData };
    container.add(hitMesh);
    this.interactiveObjects.push(hitMesh);

    this.stellarObjectGroup.add(container);
  }

  bindEvents() {
    const handlePointerInteraction = (clientX, clientY, target) => {
      if (target && (target.closest('#onboarding-screen') || target.closest('#bottom-sheet') || target.closest('.hud-controls'))) {
        return;
      }

      this.pointer.x = (clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveObjects, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData && hit.userData.isPrimeStar && this.options.onStarClick) {
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

    if (this.targetHaloMesh) {
      const ringScale = 1.0 + Math.sin(time * 2.0) * 0.05;
      this.targetHaloMesh.scale.set(ringScale, ringScale, ringScale);
      this.targetHaloMesh.lookAt(this.camera.position);
    }

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
