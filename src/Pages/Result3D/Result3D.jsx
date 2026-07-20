import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../Components/Navbar/Navbar";
import Button from "../../Components/Button/Button";
import usePageTitle from "../../hooks/usePageTitle";
import { useFormStore } from "../../Store/useFormStore";
import { useAuthStore } from "../../Store/useAuthStore";
import { saveProject, getProjectUsage } from "../../lib/projects";
import { uploadPlanImage } from "../../lib/cloudinary";
import "./Result3D.css";

// MapLibre GL is a heavy dependency (~1MB) — only fetch it once someone
// actually opens the map tab, instead of bundling it into every page load.
const PlotMapView = lazy(() => import("../../Components/PlotMapView/PlotMapView"));

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

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
      <path d="M12 15V4m0 0-3.5 3.5M12 4l3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 15v2.5A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5V15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.7" />
      <path d="m8 12.3 2.6 2.6L16.2 9" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const Result3D = () => {
  const { t } = useTranslation();
  usePageTitle(t("result3d.title"));
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("2D");
  const [projectName, setProjectName] = useState("");
  const [savingProject, setSavingProject] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedName, setSavedName] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");
  const [usage, setUsage] = useState(null); // { used, limit } | null while loading

  const session = useAuthStore((state) => state.session);
  const landCoordinates = useFormStore((state) => state.landCoordinates);
  const landDimensions = useFormStore((state) => state.landDimensions);
  const landRotation = useFormStore((state) => state.landRotation);
  const roomCatalog = useFormStore((state) => state.roomCatalog);
  const snapshotForSave = useFormStore((state) => state.snapshotForSave);
  const planImageUrl = useFormStore((state) => state.planImageUrl);
  const setPlanImageUrl = useFormStore((state) => state.setPlanImageUrl);

  const width = Number(landDimensions?.width) || 0;
  const height = Number(landDimensions?.height) || 0;
  const dimsLabel =
    width && height
      ? t("map.dims_label", { width: formatNumber(width), height: formatNumber(height) })
      : "—";

  const roomBlocks = useMemo(
    () => ROOM_BLOCKS.filter((block) => (roomCatalog?.[block.id] || 0) > 0),
    [roomCatalog]
  );

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImageError("");
    setUploadingImage(true);
    const { url, error } = await uploadPlanImage(file);
    setUploadingImage(false);
    if (error) {
      setImageError(error === "not_configured" ? t("result3d.image_not_configured") : t("result3d.image_upload_failed"));
      return;
    }
    setPlanImageUrl(url);
  }

  async function handleSaveProject(event) {
    event.preventDefault();
    if (!session) {
      navigate("/login", { state: { from: "/result-3d" } });
      return;
    }
    const name = projectName.trim();
    if (!name) return;
    setSavingProject(true);
    setSaveError("");
    setSavedName("");
    const { error } = await saveProject(session.user.id, name, snapshotForSave());
    setSavingProject(false);
    if (error) {
      if (error.message === "project_limit_reached") {
        // Our own optimistic count was stale (e.g. saved from another tab) —
        // resync it so the upgrade card replaces the form immediately.
        setUsage((prev) => (prev ? { ...prev, used: prev.limit } : prev));
      } else {
        setSaveError(error.message);
      }
      return;
    }
    setProjectName("");
    setSavedName(name);
    setUsage((prev) => (prev ? { ...prev, used: prev.used + 1 } : prev));
  }

  // Auto-dismiss the success toast after a few seconds; only ever calls
  // setState from inside the timeout callback, never synchronously in the
  // effect body (see the set-state-in-effect lint rule this repo enforces).
  useEffect(() => {
    if (!savedName) return undefined;
    const timer = setTimeout(() => setSavedName(""), 5000);
    return () => clearTimeout(timer);
  }, [savedName]);

  // Load how many projects this user has saved and their plan's limit, so
  // the save form can be replaced by an upgrade prompt once they hit it —
  // the real enforcement lives server-side (enforce_project_limit trigger),
  // this is purely for a friendly UI instead of a raw error after the fact.
  useEffect(() => {
    if (!session) return undefined;
    let ignore = false;
    getProjectUsage().then(({ used, limit, error }) => {
      if (ignore || error) return;
      setUsage({ used, limit });
    });
    return () => {
      ignore = true;
    };
  }, [session]);

  const atProjectLimit = usage && usage.limit !== null && usage.used >= usage.limit;

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
                <div className={planImageUrl ? "view-container view-container-plan-image" : "view-container view-container-plan"}>
                  {planImageUrl ? (
                    <img className="plan-image" src={planImageUrl} alt={t("result3d.plan_land_label")} />
                  ) : (
                    <>
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
                    </>
                  )}

                  <label className="plan-image-upload">
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                    <UploadIcon /> {uploadingImage ? t("auth.loading") : planImageUrl ? t("result3d.replace_image_btn") : t("result3d.upload_image_btn")}
                  </label>
                </div>
              )}
              {imageError && <p className="plan-image-error">{imageError}</p>}

              <div className="view-footer">
                <span>{t("result3d.footer")}</span>
              </div>
            </div>

            {/* RIGHT COLUMN (visually): sidebar — placed FIRST in DOM */}
            <div className="house-plan-sidebar">
              {atProjectLimit ? (
                <div className="save-limit">
                  <p className="save-limit__title">{t("result3d.limit_reached_title")}</p>
                  <p className="save-limit__body">{t("result3d.limit_reached_body", { limit: usage.limit })}</p>
                  <Link to="/#pricing" className="save-limit__cta">
                    {t("result3d.limit_upgrade_cta")}
                  </Link>
                </div>
              ) : (
                <>
                  <form className="save-project" onSubmit={handleSaveProject}>
                    <input
                      type="text"
                      className="save-project__input"
                      placeholder={t("result3d.save_placeholder")}
                      value={projectName}
                      onChange={(event) => setProjectName(event.target.value)}
                    />
                    <button type="submit" className="save-project__btn" disabled={savingProject || !projectName.trim()}>
                      {savingProject ? t("auth.loading") : t("result3d.save_btn")}
                    </button>
                  </form>
                  {usage && usage.limit !== null && (
                    <p className="save-project__usage">
                      {t("result3d.usage_label", { used: usage.used, limit: usage.limit })}
                    </p>
                  )}
                </>
              )}

              {saveError && <p className="save-project__error">{saveError}</p>}

              {savedName && (
                <div className="save-toast" role="status">
                  <span className="save-toast__icon">
                    <CheckCircleIcon />
                  </span>
                  <div className="save-toast__body">
                    <p className="save-toast__title">{t("result3d.save_success", { name: savedName })}</p>
                    <Link to="/projects" className="save-toast__link">
                      {t("result3d.save_view_projects")}
                    </Link>
                  </div>
                  <button
                    type="button"
                    className="save-toast__close"
                    aria-label={t("map.close")}
                    onClick={() => setSavedName("")}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              )}

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
                  <button type="button" className="format-btn format-btn--disabled" disabled>
                    IFC <span className="format-btn-badge">{t("result3d.soon")}</span>
                  </button>
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
