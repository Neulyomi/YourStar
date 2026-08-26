/**
 * 천문 계산 엔진 (AstroEngine)
 * - 관측자의 GPS 위치(위도, 경도) 및 현재 시간(UTC)을 기반으로 지방 항성시(LST) 계산
 * - 천체의 적도 좌표계(적경 RA, 적위 Dec)를 실시간 지평 좌표계(방위각 Azimuth, 고도 Altitude)로 변환
 * - 지평 좌표를 Three.js 3D 가상 천구(Celestial Sphere) 좌표 (X, Y, Z)로 투영
 * - 24시간 실제 일주 운동 궤적(Diurnal Celestial Orbit Track) 계산 (천구 북극 축 기반 무꼬임 기하학)
 */

class AstroEngine {
  constructor(latitude = 37.5665, longitude = 126.9780) { // 기본값: 서울
    this.latitude = latitude;
    this.longitude = longitude;
    this.rad = Math.PI / 180;
    this.deg = 180 / Math.PI;
  }

  setLocation(lat, lon) {
    this.latitude = lat;
    this.longitude = lon;
  }

  getJulianDate(date = new Date()) {
    return (date.getTime() / 86400000) + 2440587.5;
  }

  getGMST(date = new Date()) {
    const jd = this.getJulianDate(date);
    const d = jd - 2451545.0;
    let gmst = 280.46061837 + 360.98564736629 * d;
    gmst = ((gmst % 360) + 360) % 360;
    return gmst;
  }

  getLST(date = new Date()) {
    const gmst = this.getGMST(date);
    let lst = gmst + this.longitude;
    lst = ((lst % 360) + 360) % 360;
    return lst;
  }

  equatorialToHorizontal(ra, dec, date = new Date()) {
    const lstDeg = this.getLST(date);
    const raDeg = ra * 15;
    let haDeg = lstDeg - raDeg;
    haDeg = ((haDeg % 360) + 360) % 360;

    const latRad = this.latitude * this.rad;
    const decRad = dec * this.rad;
    const haRad = haDeg * this.rad;

    const sinAlt = Math.sin(decRad) * Math.sin(latRad) +
                   Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
    const altRad = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
    const altitude = altRad * this.deg;

    const cosAlt = Math.cos(altRad);
    let azimuth = 0;

    if (Math.abs(cosAlt) > 1e-6) {
      const y = -Math.cos(decRad) * Math.sin(haRad);
      const x = Math.sin(decRad) * Math.cos(latRad) - Math.cos(decRad) * Math.sin(latRad) * Math.cos(haRad);
      azimuth = Math.atan2(y, x) * this.deg;
      azimuth = ((azimuth % 360) + 360) % 360;
    }

    return {
      altitude: Number(altitude.toFixed(2)),
      azimuth: Number(azimuth.toFixed(2)),
      isAboveHorizon: altitude > 0
    };
  }

  horizontalToCartesian(altitude, azimuth, radius = 380) {
    const altRad = altitude * this.rad;
    const azRad = azimuth * this.rad;

    const rCosAlt = radius * Math.cos(altRad);
    const x = rCosAlt * Math.sin(azRad);
    const y = radius * Math.sin(altRad);
    const z = -rCosAlt * Math.cos(azRad);

    return { x, y, z };
  }

  getCartesianFromEquatorial(ra, dec, radius = 380, date = new Date()) {
    const horiz = this.equatorialToHorizontal(ra, dec, date);
    const cart = this.horizontalToCartesian(horiz.altitude, horiz.azimuth, radius);
    return {
      ...cart,
      altitude: horiz.altitude,
      azimuth: horiz.azimuth,
      isAboveHorizon: horiz.isAboveHorizon
    };
  }

  /**
   * [천구 북극 자전축 기반 24시간 무꼬임 일주 운동 궤적]
   * - 천구 북극 벡터: (0, R*sin(lat), -R*cos(lat))
   * - 북극 축을 중심으로 반경 R*cos(dec)의 완벽한 3D 원형 궤도 생성
   * - 삼각함수 경계값 꼬임(Self-intersection) 및 점프 0%
   */
  getDiurnalOrbitPath(ra, dec, radius = 380, segments = 96) {
    const points = [];
    const latRad = this.latitude * this.rad;
    const decRad = dec * this.rad;

    // 천구 북극 단위 벡터 nPole in Three.js (X:0, Y:sin(Lat), Z:-cos(Lat))
    const nPole = new THREE.Vector3(0, Math.sin(latRad), -Math.cos(latRad)).normalize();

    // 궤도 평면의 기준 직교 벡터 u, v
    const u = new THREE.Vector3(1, 0, 0); // 동쪽 축
    const v = new THREE.Vector3().crossVectors(nPole, u).normalize(); // 남-북 틸트 축

    // 궤도 원의 중심 위치 및 반지름
    const centerDist = radius * Math.sin(decRad);
    const ringRadius = radius * Math.cos(decRad);
    const center = nPole.clone().multiplyScalar(centerDist);

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const pt = center.clone()
        .add(u.clone().multiplyScalar(ringRadius * Math.sin(angle)))
        .add(v.clone().multiplyScalar(ringRadius * Math.cos(angle)));
      points.push(pt);
    }

    return points;
  }

  getObservationStatus(ra, dec, date = new Date()) {
    const horiz = this.equatorialToHorizontal(ra, dec, date);
    const isVisibleNow = horiz.altitude > 0;

    if (isVisibleNow) {
      return {
        isVisibleNow: true,
        altitude: horiz.altitude,
        azimuth: horiz.azimuth,
        statusTitle: "✨ 현재 하늘에서 관측 가능",
        statusDesc: `현재 당신의 하늘(고도 ${horiz.altitude}°, ${this.getCardinalDirection(horiz.azimuth)})에 떠 있어 지구에 가려지지 않고 직접 마주할 수 있습니다.`
      };
    }

    let hoursUntilRise = null;
    for (let h = 1; h <= 24; h++) {
      const futureDate = new Date(date.getTime() + h * 3600000);
      const futureHoriz = this.equatorialToHorizontal(ra, dec, futureDate);
      if (futureHoriz.altitude > 0) {
        hoursUntilRise = h;
        break;
      }
    }

    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const bestDayOfYear = Math.floor(((ra + 12) % 24) * (365 / 24));
    let daysUntilPrimeSeason = (bestDayOfYear - dayOfYear + 365) % 365;
    if (daysUntilPrimeSeason === 0) daysUntilPrimeSeason = 1;

    let timeMsg = "";
    if (hoursUntilRise !== null) {
      timeMsg = `오늘 밤 약 ${hoursUntilRise}시간 후 지구에 가려지지 않고 지평선 위로 떠오릅니다.`;
    } else {
      timeMsg = `약 ${daysUntilPrimeSeason}일 후 밤하늘 가장 높은 정점에서 지구에 가려지지 않고 찬란히 빛납니다.`;
    }

    return {
      isVisibleNow: false,
      altitude: horiz.altitude,
      azimuth: horiz.azimuth,
      hoursUntilRise: hoursUntilRise,
      daysUntilPrimeSeason: daysUntilPrimeSeason,
      statusTitle: "🌐 현재 지구 반대편 위치",
      statusDesc: `현재는 지구 반대편(지평선 아래 ${horiz.altitude}°)에 있습니다. ${timeMsg}`
    };
  }

  getCardinalDirection(azimuth) {
    const dirs = ["북 (N)", "북동 (NE)", "동 (E)", "남동 (SE)", "남 (S)", "남서 (SW)", "서 (W)", "북서 (NW)"];
    const idx = Math.round(azimuth / 45) % 8;
    return dirs[idx];
  }
}

window.AstroEngine = AstroEngine;
window.astroEngine = new AstroEngine();
