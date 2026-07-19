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

// Always treated as "open" while mounted — the parent controls visibility by
// conditionally mounting/unmounting this component (see ConfirmData /
// ExtractionFailed), which is also what keeps MapLibre out of the initial
// bundle: it's lazy-imported and only fetched once the user opens the map.
export default function LocationMapPicker({ initialLat, initialLng, onConfirm, onClose }) {
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const searchAbortRef = useRef(null);

  const [style, setStyle] = useState("street");
  const [picked, setPicked] = useState(() =>
    initialLat != null && initialLng != null ? { lat: initialLat, lng: initialLng } : null
  );
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

    marker.on("dragend", () => {
      const { lat, lng } = marker.getLngLat();
      setPicked({ lat, lng });
    });

    map.on("click", (e) => {
      const { lat, lng } = e.lngLat;
      marker.setLngLat([lng, lat]);
      if (!marker.getElement().isConnected) marker.addTo(map);
      setPicked({ lat, lng });
    });

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
          <h2 className="map-picker__title">{t("map.title")}</h2>
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
