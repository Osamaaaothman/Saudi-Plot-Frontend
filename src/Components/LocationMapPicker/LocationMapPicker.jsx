import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./LocationMapPicker.css";

// Free, no-signup basemaps only:
// - OpenFreeMap "liberty" — a full vector style, unlimited free hosting.
// - Esri World Imagery — free raster satellite tiles, no key required.
const STREET_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const SATELLITE_STYLE = {
  version: 8,
  // Reuse OpenFreeMap's free public glyph (font) server so the plot-size
  // label still renders in satellite mode, which has no vector tiles of
  // its own to source fonts from.
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sources: {
    esri: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Esri, Maxar, Earthstar Geographics",
    },
  },
  layers: [{ id: "esri", type: "raster", source: "esri" }],
};

const DEFAULT_CENTER = { lat: 24.7136, lng: 46.6753 }; // Riyadh
const DEFAULT_ZOOM = 11;
const PICKED_ZOOM = 16;

const RECT_SOURCE_ID = "land-plot-rect";
const RECT_FILL_LAYER = "land-plot-rect-fill";
const RECT_LINE_LAYER = "land-plot-rect-line";
const RECT_LABEL_SOURCE_ID = "land-plot-label";
const RECT_LABEL_LAYER = "land-plot-label-text";

const EMPTY_FEATURE_COLLECTION = { type: "FeatureCollection", features: [] };

/**
 * Build a rectangle (as GeoJSON) representing the land plot footprint,
 * centered on the picked point. `width` runs east-west, `height` runs
 * north-south — the deed only gives two raw measurements, not orientation,
 * so this is a best-effort visual approximation, not a survey-accurate plot.
 * Longitude degrees shrink with latitude, so the conversion has to account
 * for cos(lat); latitude degrees are ~constant across the earth's surface.
 */
function buildPlotRectangle(lat, lng, widthM, heightM) {
  const metersPerDegLat = 111320;
  const metersPerDegLng = 111320 * Math.cos((lat * Math.PI) / 180);
  const dLat = heightM / 2 / metersPerDegLat;
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

// Always treated as "open" while mounted — the parent controls visibility by
// conditionally mounting/unmounting this component (see ConfirmData /
// ExtractionFailed), which is also what keeps MapLibre out of the initial
// bundle: it's lazy-imported and only fetched once the user opens the map.
export default function LocationMapPicker({
  initialLat,
  initialLng,
  landWidth,
  landHeight,
  onConfirm,
  onClose,
}) {
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const searchAbortRef = useRef(null);

  const [style, setStyle] = useState("street");
  const [picked, setPicked] = useState(() =>
    initialLat != null && initialLng != null ? { lat: initialLat, lng: initialLng } : null
  );

  const widthM = Number(landWidth);
  const heightM = Number(landHeight);
  const hasPlotSize = widthM > 0 && heightM > 0;
  const plotLabel = hasPlotSize ? t("map.dims_label", { width: landWidth, height: landHeight }) : "";
  // Refs so the map-load/click/drag handlers (created once on mount) always
  // read the latest size/label without needing to be recreated.
  const plotSizeRef = useRef({ widthM, heightM, hasPlotSize, plotLabel });
  useEffect(() => {
    plotSizeRef.current = { widthM, heightM, hasPlotSize, plotLabel };
  }, [widthM, heightM, hasPlotSize, plotLabel]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);

  // Init / teardown the map once, on mount (parent mounts this component
  // only while the picker should be visible).
  useEffect(() => {
    if (!containerRef.current) return undefined;

    const startCenter = picked ?? DEFAULT_CENTER;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STREET_STYLE_URL,
      center: [startCenter.lng, startCenter.lat],
      zoom: picked ? PICKED_ZOOM : DEFAULT_ZOOM,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");

    const marker = new maplibregl.Marker({ draggable: true, color: "#25231d" }).setLngLat([
      startCenter.lng,
      startCenter.lat,
    ]);
    if (picked) marker.addTo(map);
    markerRef.current = marker;

    // Draw the land plot footprint as a real-scale rectangle around the
    // marker. `setStyle` (street/satellite toggle) wipes any layers not part
    // of the style itself, so this re-adds them on every style load, not
    // just the first one.
    function ensurePlotLayers() {
      if (!map.getSource(RECT_SOURCE_ID)) {
        map.addSource(RECT_SOURCE_ID, { type: "geojson", data: EMPTY_FEATURE_COLLECTION });
        map.addLayer({
          id: RECT_FILL_LAYER,
          type: "fill",
          source: RECT_SOURCE_ID,
          paint: { "fill-color": "#9d5b3e", "fill-opacity": 0.22 },
        });
        map.addLayer({
          id: RECT_LINE_LAYER,
          type: "line",
          source: RECT_SOURCE_ID,
          paint: { "line-color": "#9d5b3e", "line-width": 2.5, "line-dasharray": [2, 1] },
        });
      }
      if (!map.getSource(RECT_LABEL_SOURCE_ID)) {
        map.addSource(RECT_LABEL_SOURCE_ID, { type: "geojson", data: EMPTY_FEATURE_COLLECTION });
        map.addLayer({
          id: RECT_LABEL_LAYER,
          type: "symbol",
          source: RECT_LABEL_SOURCE_ID,
          layout: {
            "text-field": ["get", "label"],
            "text-size": 13,
            "text-font": ["Noto Sans Regular"],
          },
          paint: {
            "text-color": "#3f2a1f",
            "text-halo-color": "#fff9ee",
            "text-halo-width": 1.6,
          },
        });
      }
    }

    function syncPlotRectangle(lat, lng) {
      ensurePlotLayers();
      const { widthM: w, heightM: h, hasPlotSize: has, plotLabel: label } = plotSizeRef.current;
      const rectSource = map.getSource(RECT_SOURCE_ID);
      const labelSource = map.getSource(RECT_LABEL_SOURCE_ID);
      if (!has) {
        rectSource?.setData(EMPTY_FEATURE_COLLECTION);
        labelSource?.setData(EMPTY_FEATURE_COLLECTION);
        return;
      }
      rectSource?.setData({
        type: "FeatureCollection",
        features: [{ type: "Feature", properties: {}, geometry: buildPlotRectangle(lat, lng, w, h) }],
      });
      labelSource?.setData({
        type: "FeatureCollection",
        features: [
          { type: "Feature", properties: { label }, geometry: { type: "Point", coordinates: [lng, lat] } },
        ],
      });
    }

    map.on("load", () => syncPlotRectangle(startCenter.lat, startCenter.lng));
    map.on("style.load", () => {
      const pos = markerRef.current?.getLngLat();
      syncPlotRectangle(pos?.lat ?? startCenter.lat, pos?.lng ?? startCenter.lng);
    });

    marker.on("dragend", () => {
      const { lat, lng } = marker.getLngLat();
      setPicked({ lat, lng });
      syncPlotRectangle(lat, lng);
    });

    map.on("click", (e) => {
      const { lat, lng } = e.lngLat;
      marker.setLngLat([lng, lat]);
      if (!marker.getElement().isConnected) marker.addTo(map);
      setPicked({ lat, lng });
      syncPlotRectangle(lat, lng);
    });

    mapRef.current.syncPlotRectangle = syncPlotRectangle;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once on mount only
  }, []);

  // Swap basemap without tearing the map down.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(style === "street" ? STREET_STYLE_URL : SATELLITE_STYLE);
  }, [style]);

  function flyTo(lat, lng, zoom = PICKED_ZOOM) {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    marker.setLngLat([lng, lat]);
    if (!marker.getElement().isConnected) marker.addTo(map);
    map.flyTo({ center: [lng, lat], zoom });
    setPicked({ lat, lng });
    map.syncPlotRectangle?.(lat, lng);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setGeoError(t("map.geo_unsupported"));
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        flyTo(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setLocating(false);
        setGeoError(t("map.geo_denied"));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Debounced free-text search via OSM's free Nominatim geocoder. Only
  // schedules a fetch (and only setState from inside its callback) — the
  // "query too short" case is handled at render time via `visibleResults`
  // below instead of clearing state synchronously from the effect.
  useEffect(() => {
    if (query.trim().length < 3) {
      searchAbortRef.current?.abort();
      return undefined;
    }
    const timer = setTimeout(async () => {
      searchAbortRef.current?.abort();
      const controller = new AbortController();
      searchAbortRef.current = controller;
      setSearching(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&accept-language=${i18n.language}&countrycodes=sa&q=${encodeURIComponent(query)}`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        setResults(data);
      } catch {
        // aborted or offline — leave previous results
      } finally {
        setSearching(false);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [query, i18n.language]);

  const visibleResults = query.trim().length < 3 ? [] : results;

  return (
    <div className="map-picker-overlay" role="dialog" aria-modal="true" aria-label={t("map.title")}>
      <div className="map-picker">
        <header className="map-picker__header">
          <div>
            <h2 className="map-picker__title">{t("map.title")}</h2>
            {landWidth && landHeight && (
              <p className="map-picker__dims-badge">
                {t("map.dims_badge", { width: landWidth, height: landHeight })}
              </p>
            )}
          </div>
          <button type="button" className="map-picker__close" onClick={onClose} aria-label={t("map.close")}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="map-picker__search-row">
          <div className="map-picker__search">
            <svg className="map-picker__search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              className="map-picker__search-input"
              placeholder={t("map.search_placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {visibleResults.length > 0 && (
              <ul className="map-picker__results">
                {visibleResults.map((r) => (
                  <li key={r.place_id}>
                    <button
                      type="button"
                      onClick={() => {
                        flyTo(Number(r.lat), Number(r.lon), 15);
                        setQuery(r.display_name);
                        setResults([]);
                      }}
                    >
                      {r.display_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {searching && <span className="map-picker__search-spinner" aria-hidden="true" />}
          </div>

          <button type="button" className="map-picker__locate-btn" onClick={useMyLocation} disabled={locating}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M12 2v3M12 19v3M2 12h3M19 12h3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            {locating ? t("map.locating") : t("map.use_my_location")}
          </button>
        </div>

        {geoError && <p className="map-picker__geo-error">{geoError}</p>}

        <div className="map-picker__map-wrap">
          <div ref={containerRef} className="map-picker__map" />
          <div className="map-picker__style-toggle">
            <button
              type="button"
              className={style === "street" ? "is-active" : ""}
              onClick={() => setStyle("street")}
            >
              {t("map.style_street")}
            </button>
            <button
              type="button"
              className={style === "satellite" ? "is-active" : ""}
              onClick={() => setStyle("satellite")}
            >
              {t("map.style_satellite")}
            </button>
          </div>
        </div>

        <footer className="map-picker__footer">
          <span className="map-picker__coords">
            {picked
              ? t("map.selected_coords", { lat: picked.lat.toFixed(6), lon: picked.lng.toFixed(6) })
              : t("map.no_selection")}
          </span>
          <div className="map-picker__actions">
            <button type="button" className="map-picker__cancel" onClick={onClose}>
              {t("map.cancel")}
            </button>
            <button
              type="button"
              className="map-picker__confirm"
              disabled={!picked}
              onClick={() => picked && onConfirm(picked)}
            >
              {t("map.confirm")}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
