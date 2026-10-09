/**
 * Shared Mountain Geo-Polyline Generation Utility
 * Generates encoded Google polyline strings between coordinates with sinusoidal mountain curvature offset.
 */

export interface LatLngPoint {
  lat: number;
  lng: number;
}

/**
 * Helper to generate encoded polyline between two coordinates with mountain curvature
 */
export function generateInterpolatedPolyline(
  orig: LatLngPoint,
  dest: LatLngPoint
): string {
  const steps = 10;
  const points: Array<LatLngPoint> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Slight sinusoidal offset for winding mountain roads
    const curveOffset = Math.sin(t * Math.PI) * 0.008;
    const lat = orig.lat + (dest.lat - orig.lat) * t + curveOffset;
    const lng = orig.lng + (dest.lng - orig.lng) * t + curveOffset * 0.5;
    points.push({ lat, lng });
  }

  let encoded = '';
  let prevLat = 0;
  let prevLng = 0;

  for (const point of points) {
    const lat = Math.round(point.lat * 1e5);
    const lng = Math.round(point.lng * 1e5);
    const dLat = lat - prevLat;
    const dLng = lng - prevLng;
    prevLat = lat;
    prevLng = lng;

    const encodeNumber = (num: number) => {
      let sgn = num < 0 ? ~(num << 1) : (num << 1);
      let s = '';
      while (sgn >= 0x20) {
        s += String.fromCharCode((0x20 | (sgn & 0x1f)) + 63);
        sgn >>= 5;
      }
      s += String.fromCharCode(sgn + 63);
      return s;
    };

    encoded += encodeNumber(dLat) + encodeNumber(dLng);
  }
  return encoded;
}
