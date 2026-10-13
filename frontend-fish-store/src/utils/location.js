/**
 * Location and Google Maps helper utilities for Prince of the Seas
 */

/**
 * Normalizes or builds a valid Google Maps navigation link
 * Supports:
 * - Direct Google Maps URLs (https://maps.app.goo.gl/..., https://maps.google.com/?q=...)
 * - Coordinate strings (e.g. "30.0444, 31.2357" or "30.0444,31.2357")
 * - Plain text addresses as fallback
 */
export function buildGoogleMapsUrl(locationUrl, address) {
  const loc = (locationUrl || '').trim();
  if (loc) {
    if (/^https?:\/\//i.test(loc)) {
      return loc;
    }
    // Check if it's lat, lng coordinates
    if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(loc)) {
      const cleanCoords = loc.replace(/\s+/g, '');
      return `https://www.google.com/maps?q=${cleanCoords}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`;
  }

  const addr = (address || '').trim();
  if (addr) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
  }

  return null;
}

/**
 * Requests the current device GPS position using HTML5 Geolocation API
 * Returns { lat, lng, url }
 */
export function getCurrentGpsLocation(language = 'ar') {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const msg = language === 'ar'
        ? 'خاصية تحديد الموقع الجغرافي (GPS) غير مدعومة في متصفحك أو جهازك.'
        : 'Geolocation is not supported by your browser or device.';
      reject(new Error(msg));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        resolve({ lat, lng, url });
      },
      (error) => {
        let msg = language === 'ar' ? 'فشل تحديد الموقع الجغرافي الحالي.' : 'Failed to get current GPS location.';
        if (error.code === 1) {
          msg = language === 'ar'
            ? 'تم رفض إذن الوصول إلى الموقع. يرجى تفعيل الموقع (GPS) في إعدادات المتصفح.'
            : 'Location permission was denied. Please allow location access in your browser.';
        } else if (error.code === 2) {
          msg = language === 'ar'
            ? 'معلومات الموقع غير متوفرة حالياً. تأكد من إشارة GPS.'
            : 'Location information is unavailable. Please check your GPS signal.';
        } else if (error.code === 3) {
          msg = language === 'ar'
            ? 'استغرقت محاولة تحديد الموقع وقتاً طويلاً. يرجى المحاولة ثانية.'
            : 'Location request timed out. Please try again.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}
