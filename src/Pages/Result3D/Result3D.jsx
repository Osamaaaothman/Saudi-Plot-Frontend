import { lazy, Suspense, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../../Components/Navbar/Navbar";
import Button from "../../Components/Button/Button";
import { AccessibilityIcon } from "../../Components/WizardIcons/WizardIcons";
import usePageTitle from "../../hooks/usePageTitle";
import { useFormStore } from "../../Store/useFormStore";
import "./Result3D.css";

// MapLibre GL is a heavy dependency (~1MB) — only fetch it once someone
// actually opens the map tab, instead of bundling it into every page load.
const PlotMapView = lazy(() => import("../../Components/PlotMapView/PlotMapView"));

const RECEPTION_LABEL_KEYS = {
  independent: "q3.option1",
  split: "q3.option2",
  "living-room": "q3.option3",
};

// Rough per-space footprint used only to size the illustrative space plan —
// not a real architectural layout, just a proportional block per room type
// the family actually chose in the Room Catalog.
const ROOM_BLOCKS = [
  { id: "master", labelKey: "room_catalog.master", color: "pink", span: 5 },
  { id: "bedroom", labelKey: "room_catalog.bedroom", color: "green", span: 4 },
  { id: "living", labelKey: "room_catalog.living", color: "gray", span: 6 },
  { id: "kitchen", labelKey: "room_catalog.kitchen", color: "yellow", span: 4 },
  { id: "prepKitchen", labelKey: "room_catalog.prep_kitchen", color: "yellow", span: 3 },
  { id: "majlis", labelKey: "room_catalog.majlis", color: "blue", span: 5 },
  { id: "dining", labelKey: "room_catalog.dining", color: "blue", span: 3 },
  { id: "bathroom", labelKey: "room_catalog.bathroom", color: "purple", span: 3 },
  { id: "guestBath", labelKey: "room_catalog.guest_bath", color: "purple", span: 3 },
  { id: "closet", labelKey: "room_catalog.closet", color: "pink", span: 3 },
  { id: "driver", labelKey: "room_catalog.driver_room", color: "gray", span: 3 },
  { id: "laundry", labelKey: "room_catalog.laundry", color: "gray", span: 3 },
  { id: "storage", labelKey: "room_catalog.storage", color: "gray", span: 3 },
];

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M12 3.5 20 8v8l-8 4.5L4 16V8l8-4.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M4 8l8 4.5L20 8M12 12.5V21" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M12 3v12m0 0-4-4m4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <circle cx="18" cy="5" r="2.4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="6" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="18" cy="19" r="2.4" stroke="currentColor" strokeWidth="1.7" />
      <path d="m8.1 10.8 7.8-4.4M8.1 13.2l7.8 4.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

const Result3D = () => {
  const { t } = useTranslation();
  usePageTitle(t("result3d.title"));
  const [viewMode, setViewMode] = useState("2D");

  const landCoordinates = useFormStore((state) => state.landCoordinates);
  const landDimensions = useFormStore((state) => state.landDimensions);
  const landRotation = useFormStore((state) => state.landRotation);
  const familyMembers = useFormStore((state) => state.familyMembers);
  const hasElderly = useFormStore((state) => state.hasElderly);
  const guestReceptionId = useFormStore((state) => state.guestReceptionId);
  const kitchenType = useFormStore((state) => state.kitchenType);
  const roomCatalog = useFormStore((state) => state.roomCatalog);

  const width = Number(landDimensions?.width) || 0;
  const height = Number(landDimensions?.height) || 0;
  const areaM2 = width * height;
  const dimsLabel =
    width && height
      ? t("map.dims_label", { width: formatNumber(width), height: formatNumber(height) })
      : "—";
  const areaLabel = areaM2 ? t("result3d.unit_m2", { value: formatNumber(areaM2) }) : "—";
  const totalFamily = (familyMembers?.adults || 0) + (familyMembers?.children || 0);
  const totalBedrooms = (roomCatalog?.master || 0) + (roomCatalog?.bedroom || 0);
  const receptionLabel = t(RECEPTION_LABEL_KEYS[guestReceptionId] || "q3.option1");

  const roomBlocks = useMemo(
    () => ROOM_BLOCKS.filter((block) => (roomCatalog?.[block.id] || 0) > 0),
    [roomCatalog]
  );

  return (
    <div className="page">
      <Navbar />
      <div className="house-plan-wrapper" dir="rtl">
        <div className="house-plan-container">
          {/* Header */}
          <div className="house-plan-header">
            <span className="house-plan-eyebrow">{t("result3d.eyebrow")}</span>
            <h1 className="house-plan-title">{t("result3d.title")}</h1>
            <p className="house-plan-subtitle">{t("result3d.subtitle")}</p>
          </div>

          {/* Main Layout */}
          <div className="house-plan-layout">
            {/* LEFT COLUMN (visually): view area — placed SECOND in DOM */}
            <div className="house-plan-view">
              <div className="view-toggle">
                <button
                  type="button"
                  className={`toggle-btn ${viewMode === "2D" ? "toggle-btn-active" : ""}`}
                  onClick={() => setViewMode("2D")}
                >
                  <GridIcon /> {t("result3d.toggle_2d")}
                </button>
                <button type="button" className="toggle-btn toggle-btn--disabled" disabled>
                  <CubeIcon /> {t("result3d.toggle_3d")}
                  <span className="toggle-btn-badge">{t("result3d.soon")}</span>
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${viewMode === "MAP" ? "toggle-btn-active" : ""}`}
                  onClick={() => setViewMode("MAP")}
                >
                  <PinIcon /> {t("result3d.toggle_map")}
                </button>
              </div>

              {viewMode === "MAP" ? (
                <div className="view-container view-container-map">
                  <Suspense fallback={null}>
                    <PlotMapView
                      lat={landCoordinates?.lat ? Number(landCoordinates.lat) : null}
                      lng={landCoordinates?.lng ? Number(landCoordinates.lng) : null}
                      widthM={width}
                      heightM={height}
                      rotationDeg={landRotation || 0}
                    />
                  </Suspense>
                </div>
              ) : (
                <div className="view-container view-container-plan">
                  <div className="plan-plot-tag">
                    <span>{t("result3d.plan_land_label")}</span>
                    <strong>{dimsLabel}</strong>
                  </div>

                  {roomBlocks.length > 0 ? (
                    <div className="plan-grid">
                      {roomBlocks.map((block) => {
                        const count = roomCatalog[block.id];
                        return (
                          <div
                            key={block.id}
                            className={`plan-room plan-room--${block.color}`}
                            style={{ gridColumn: `span ${block.span}` }}
                          >
                            <span className="plan-room__label">{t(block.labelKey)}</span>
                            {count > 1 && <span className="plan-room__count">×{count}</span>}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="plan-empty">{t("result3d.plan_empty")}</p>
                  )}
                </div>
              )}

              <div className="view-footer">
                <span>{t("result3d.footer")}</span>
              </div>
            </div>

            {/* RIGHT COLUMN (visually): sidebar — placed FIRST in DOM */}
            <div className="house-plan-sidebar">
              <div className="summary-card">
                <h3 className="summary-card__title">{t("result3d.summary_title")}</h3>

                <div className="summary-row">
                  <span className="summary-row__label">{t("result3d.summary_total")}</span>
                  <span className="summary-row__value">{areaLabel}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-row__label">{t("result3d.summary_dims")}</span>
                  <span className="summary-row__value">{dimsLabel}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-row__label">{t("result3d.summary_bedrooms")}</span>
                  <span className="summary-row__value">{totalBedrooms}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-row__label">{t("result3d.summary_kitchen")}</span>
                  <span className="summary-row__value">{kitchenType}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-row__label">{t("result3d.summary_reception")}</span>
                  <span className="summary-row__value">{receptionLabel}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-row__label">{t("result3d.summary_family")}</span>
                  <span className="summary-row__value">{totalFamily}</span>
                </div>

                {hasElderly && (
                  <div className="summary-badge">
                    <AccessibilityIcon />
                    <span>{t("result3d.elderly_badge")}</span>
                  </div>
                )}
              </div>

              <Button fullWidth>
                <DownloadIcon /> {t("result3d.btn_pdf")}
              </Button>

              <Button fullWidth variant="secondary">
                <ShareIcon /> {t("result3d.btn_share")}
              </Button>

              <div className="file-formats">
                <p className="file-formats-title">{t("result3d.files_title")}</p>
                <div className="file-formats-buttons">
                  <button type="button" className="format-btn format-btn--disabled" disabled>
                    DWG <span className="format-btn-badge">{t("result3d.soon")}</span>
                  </button>
                  <button type="button" className="format-btn format-btn--disabled" disabled>
                    DXF <span className="format-btn-badge">{t("result3d.soon")}</span>
                  </button>
                  <button type="button" className="format-btn">SVG</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result3D;
