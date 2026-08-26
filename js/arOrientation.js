/**
 * Web AR & 모바일 디바이스 방향 추적 시스템 (AROrientationManager)
 * - [SunTracker / Stellarium Web 표준: Three.js 오리지널 DeviceOrientationControls 구현]
 * - W3C Tait-Bryan Z-X-Y 디바이스 각도를 Three.js YXZ 쿼터니언으로 1:1 완벽 변환
 * - camera.rotation.reorder('YXZ')로 짐벌락 100% 배제
 * - iOS Safari webkitCompassHeading 진북 연동 및 스크린 회전 보정
 */

class AROrientationManager {
  constructor(threeCamera, domElement, options = {}) {
    this.camera = threeCamera;
    this.domElement = domElement || window;
    this.options = Object.assign({
      onOrientationUpdate: null,
      onCameraStarted: null,
      onCameraError: null
    }, options);

    this.isSensorActive = false;
    this.isCameraActive = false;
    this.videoElement = null;
    this.stream = null;

    // 수동 나침반 보정 (라디안)
    this.alphaOffset = 0;
    this.screenOrientation = 0;

    // Three.js 공식 표준 변환 수학 객체
    this.zee = new THREE.Vector3(0, 0, 1);
    this.euler = new THREE.Euler();
    this.q0 = new THREE.Quaternion();
    this.q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // -PI/2 around X
    this.targetQuaternion = new THREE.Quaternion();

    // 카메라 회전 순서 YXZ 강제 (짐벌락 방지)
    this.camera.rotation.reorder('YXZ');

    // PC 마우스 컨트롤러
    this.isUserInteracting = false;
    this.onPointerDownPointerX = 0;
    this.onPointerDownPointerY = 0;
    this.onPointerDownLon = 0;
    this.onPointerDownLat = 0;
    this.lon = 0;
    this.lat = 0;
    this.targetLon = 0;
    this.targetLat = 0;
    this.fov = 50;

    this.initScreenOrientation();
    this.initPCMouseControls();
  }

  initScreenOrientation() {
    this.onScreenOrientationChange = () => {
      if (window.screen && window.screen.orientation && typeof window.screen.orientation.angle === 'number') {
        this.screenOrientation = window.screen.orientation.angle;
      } else if (typeof window.orientation === 'number') {
        this.screenOrientation = window.orientation;
      } else {
        this.screenOrientation = 0;
      }
    };
    window.addEventListener('orientationchange', this.onScreenOrientationChange, false);
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', this.onScreenOrientationChange, false);
    }
    this.onScreenOrientationChange();
  }

  initPCMouseControls() {
    const onPointerDown = (event) => {
      if (event.target && (event.target.closest('#onboarding-screen') || event.target.closest('#bottom-sheet'))) {
        return;
      }
      this.isUserInteracting = true;
      const clientX = event.clientX !== undefined ? event.clientX : 0;
      const clientY = event.clientY !== undefined ? event.clientY : 0;

      this.onPointerDownPointerX = clientX;
      this.onPointerDownPointerY = clientY;
      this.onPointerDownLon = this.targetLon;
      this.onPointerDownLat = this.targetLat;
    };

    const onPointerMove = (event) => {
      if (!this.isUserInteracting) return;
      const clientX = event.clientX !== undefined ? event.clientX : 0;
      const clientY = event.clientY !== undefined ? event.clientY : 0;

      const speed = 0.22;
      this.targetLon = (this.onPointerDownPointerX - clientX) * speed + this.onPointerDownLon;
      this.targetLat = (clientY - this.onPointerDownPointerY) * speed + this.onPointerDownLat;
      this.targetLat = Math.max(-89.9, Math.min(89.9, this.targetLat));
    };

    const onPointerUp = () => {
      this.isUserInteracting = false;
    };

    const onWheel = (event) => {
      if (event.target && event.target.closest('#onboarding-screen')) return;
      this.fov += event.deltaY * 0.05;
      this.fov = Math.max(25, Math.min(75, this.fov));
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('contextmenu', (e) => {
      if (e.target && !e.target.closest('#onboarding-screen')) e.preventDefault();
    });
    window.addEventListener('wheel', onWheel, { passive: true });
  }

  async startARSession(videoElementId = 'ar-video-feed') {
    this.videoElement = typeof videoElementId === 'string' ? document.getElementById(videoElementId) : videoElementId;
    await this.startCamera();
    await this.enableDeviceSensors();
  }

  async startCamera() {
    if (this.isCameraActive && this.videoElement && this.videoElement.srcObject) {
      return true;
    }
    if (this.stream && this.stream.active) {
      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        try { await this.videoElement.play(); } catch (e) { /* ignore */ }
      }
      this.isCameraActive = true;
      return true;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("Camera API not supported in this browser.");
      if (this.options.onCameraError) this.options.onCameraError("카메라를 지원하지 않는 브라우저입니다.");
      return false;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.stream = stream;
      if (this.videoElement) {
        this.videoElement.srcObject = stream;
        await this.videoElement.play();
        this.isCameraActive = true;
        if (this.options.onCameraStarted) this.options.onCameraStarted(stream);
      }
      return true;
    } catch (err) {
      console.warn("Camera access denied or desktop environment:", err);
      if (this.options.onCameraError) this.options.onCameraError(err.message || "카메라 권한이 거부되었습니다.");
      return false;
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      if (this.videoElement.srcObject && typeof this.videoElement.srcObject.getTracks === 'function') {
        this.videoElement.srcObject.getTracks().forEach(track => track.stop());
      }
      this.videoElement.srcObject = null;
      try { this.videoElement.pause(); } catch (e) { /* ignore */ }
    }
    this.isCameraActive = false;
  }

  async enableDeviceSensors() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permissionState = await DeviceOrientationEvent.requestPermission();
        if (permissionState === 'granted') {
          this.bindSensorEvents();
          return true;
        }
      } catch (e) {
        console.warn("DeviceOrientation permission error:", e);
      }
    } else {
      this.bindSensorEvents();
      return true;
    }
    return false;
  }

  bindSensorEvents() {
    this.handleDeviceOrientation = this.handleDeviceOrientation.bind(this);
    window.addEventListener('deviceorientation', this.handleDeviceOrientation, true);
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', this.handleDeviceOrientation, true);
    }
  }

  /**
   * [SunTracker / Stellarium 표준 쿼터니언 변환]
   * @param {THREE.Quaternion} quaternion 결과 쿼터니언
   * @param {number} alpha Z 회전 (라디안)
   * @param {number} beta X' 회전 (라디안)
   * @param {number} gamma Y'' 회전 (라디안)
   * @param {number} orient 스크린 방향 (라디안)
   */
  setObjectQuaternion(quaternion, alpha, beta, gamma, orient) {
    this.euler.set(beta, alpha, -gamma, 'YXZ');
    quaternion.setFromEuler(this.euler);
    quaternion.multiply(this.q1); // 카메라가 기기 뒷면을 보도록 X축 -90도 회전
    quaternion.multiply(this.q0.setFromAxisAngle(this.zee, -orient)); // 화면 방향 보정
  }

  handleDeviceOrientation(event) {
    if (event.alpha === null && event.beta === null && event.gamma === null) return;
    if (event.alpha === 0 && event.beta === 0 && event.gamma === 0 && event.webkitCompassHeading === undefined) return;

    this.isSensorActive = true;

    // 1. 방위각 (Alpha: 진북 0도 시계방향)
    let alphaDeg = event.alpha || 0;
    if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
      alphaDeg = 360 - event.webkitCompassHeading;
    }

    const betaDeg = event.beta || 0;
    const gammaDeg = event.gamma || 0;

    // 라디안 변환
    const alphaRad = alphaDeg * THREE.MathUtils.DEG2RAD + this.alphaOffset;
    const betaRad = betaDeg * THREE.MathUtils.DEG2RAD;
    const gammaRad = gammaDeg * THREE.MathUtils.DEG2RAD;
    const orientRad = this.screenOrientation * THREE.MathUtils.DEG2RAD;

    // 표준 변환 실행
    this.setObjectQuaternion(this.targetQuaternion, alphaRad, betaRad, gammaRad, orientRad);

    if (this.options.onOrientationUpdate) {
      this.options.onOrientationUpdate({
        alpha: alphaDeg,
        beta: betaDeg,
        gamma: gammaDeg
      });
    }
  }

  adjustCompassOffset(deltaDeg) {
    this.alphaOffset += deltaDeg * THREE.MathUtils.DEG2RAD;
  }

  /**
   * 매 프레임 업데이트 (SLERP 보간)
   */
  update() {
    if (this.isSensorActive) {
      this.camera.quaternion.slerp(this.targetQuaternion, 0.20);
    } else {
      // PC 모드 마우스 둘러보기
      this.lon += (this.targetLon - this.lon) * 0.12;
      this.lat += (this.targetLat - this.lat) * 0.12;

      const phi = THREE.MathUtils.degToRad(90 - this.lat);
      const theta = THREE.MathUtils.degToRad(this.lon + 90);

      const targetX = 100 * Math.sin(phi) * Math.cos(theta);
      const targetY = 100 * Math.cos(phi);
      const targetZ = -100 * Math.sin(phi) * Math.sin(theta);

      this.camera.lookAt(targetX, targetY, targetZ);
    }
  }

  lookAtPosition(targetPos) {
    const r = Math.sqrt(targetPos.x * targetPos.x + targetPos.y * targetPos.y + targetPos.z * targetPos.z);
    if (r > 0.001) {
      const lat = THREE.MathUtils.radToDeg(Math.asin(targetPos.y / r));
      const theta = THREE.MathUtils.radToDeg(Math.atan2(targetPos.z, targetPos.x));
      const lon = theta - 90;
      this.targetLat = Math.max(-85, Math.min(85, lat));
      this.targetLon = lon;
      this.lat = this.targetLat;
      this.lon = this.targetLon;
    }
  }
}

window.AROrientationManager = AROrientationManager;
