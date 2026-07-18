import jsQR from "jsqr";

/**
 * Try to parse GPS coordinates out of a QR code's decoded text.
 * Handles URL params, JSON objects, and bare decimal coordinate pairs.
 */
function tryParseCoordinates(text) {
  // URL with lat/lng query params
  try {
    const url = new URL(text);
    const lat =
      url.searchParams.get("lat") ||
      url.searchParams.get("latitude") ||
      url.searchParams.get("Lat");
    const lng =
      url.searchParams.get("lng") ||
      url.searchParams.get("lon") ||
      url.searchParams.get("longitude") ||
      url.searchParams.get("Lng");
    if (lat && lng) {
      return { lat: parseFloat(lat), lng: parseFloat(lng), from: "url_params" };
    }
  } catch {
    // not a valid URL, continue
  }

  // JSON object
  try {
    const obj = JSON.parse(text);
    const lat = obj.lat ?? obj.latitude ?? obj.Lat ?? obj.Latitude;
    const lng =
      obj.lng ?? obj.longitude ?? obj.lon ?? obj.Lng ?? obj.Longitude;
    if (lat != null && lng != null) {
      return {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        from: "json",
      };
    }
  } catch {
    // not JSON, continue
  }

  // Bare decimal pair: "24.7890, 46.6543" or "24.789 46.654"
  const match = text.match(/(-?\d{1,3}\.\d{4,})[,\s]+(-?\d{1,3}\.\d{4,})/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    // Sanity-check: must be inside the Arabian Peninsula bounding box
    if (lat > 15 && lat < 35 && lng > 34 && lng < 56) {
      return { lat, lng, from: "decimal_pattern" };
    }
  }

  return null;
}

/**
 * Run jsQR on a canvas sub-region and return the decoded string (or null).
 */
function scanCanvasRegion(sourceImg, sx, sy, sw, sh) {
  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(sourceImg, sx, sy, sw, sh, 0, 0, sw, sh);
  const imgData = ctx.getImageData(0, 0, sw, sh);
  const result = jsQR(imgData.data, imgData.width, imgData.height, {
    inversionAttempts: "attemptBoth",
  });
  return result?.data ?? null;
}

/**
 * Scan all QR codes from an image File (JPG/PNG).
 * Scans the full image and each of the four quadrants to maximise QR detection
 * when two QR codes appear in different parts of the deed.
 *
 * Returns { codes: string[], coordinates: { lat, lng, from } | null }
 */
export function scanQRCodesFromImage(file) {
  if (file.type === "application/pdf") {
    // PDF rendering in the browser requires PDF.js — skip for now.
    return Promise.resolve({ codes: [], coordinates: null });
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const found = new Set();

      const regions = [
        [0, 0, w, h],                                          // full image
        [0, 0, Math.ceil(w / 2), Math.ceil(h / 2)],            // top-left
        [Math.floor(w / 2), 0, Math.ceil(w / 2), Math.ceil(h / 2)],  // top-right
        [0, Math.floor(h / 2), Math.ceil(w / 2), Math.ceil(h / 2)],  // bottom-left
        [Math.floor(w / 2), Math.floor(h / 2), Math.ceil(w / 2), Math.ceil(h / 2)], // bottom-right
      ];

      for (const [sx, sy, sw, sh] of regions) {
        const code = scanCanvasRegion(img, sx, sy, sw, sh);
        if (code) found.add(code);
      }

      URL.revokeObjectURL(objectUrl);

      const codes = [...found];
      let coordinates = null;
      for (const code of codes) {
        const coord = tryParseCoordinates(code);
        if (coord) {
          coordinates = coord;
          break;
        }
      }

      resolve({ codes, coordinates });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ codes: [], coordinates: null });
    };

    img.src = objectUrl;
  });
}
