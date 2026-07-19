// Shared by LocationMapPicker (editable) and PlotMapView (read-only) so both
// draw the exact same land-plot rectangle from a center point + size.

const METERS_PER_DEG_LAT = 111320;

/**
 * Build a rectangle (as GeoJSON geometry) representing the land plot
 * footprint, centered on the given point. `width` runs east-west, `height`
 * runs north-south — the deed only gives two raw measurements, not
 * orientation, so this is a best-effort visual approximation, not a
 * survey-accurate plot. Longitude degrees shrink with latitude, so the
 * conversion accounts for cos(lat); latitude degrees are ~constant.
 */
export function buildPlotRectangle(lat, lng, widthM, heightM) {
  const metersPerDegLng = METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);
  const dLat = heightM / 2 / METERS_PER_DEG_LAT;
  const dLng = widthM / 2 / metersPerDegLng;
  const corners = [
    [lng - dLng, lat - dLat],
    [lng + dLng, lat - dLat],
    [lng + dLng, lat + dLat],
    [lng - dLng, lat + dLat],
    [lng - dLng, lat - dLat],
  ];
  return { type: "Polygon", coordinates: [corners] };
}
