import { lazy, Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../Components/Navbar/Navbar";
import Button from "../../Components/Button/Button";
import usePageTitle from "../../hooks/usePageTitle";
import { useFormStore } from "../../Store/useFormStore";
import "./ConfirmData.css";

// MapLibre GL is a heavy dependency (~1MB) — only fetch it once someone
// actually opens the map picker, instead of bundling it into every page load.
const LocationMapPicker = lazy(() => import("../../Components/LocationMapPicker/LocationMapPicker"));

const FALLBACK_BOUNDARIES = [
  { id: "area", label: "المساحة الإجمالية", value: "2,892.3 م²" },
  { id: "north", label: "الحد الشمالي", value: "70 م — على شارع عرض 20 م" },
  { id: "south", label: "الحد الجنوبي", value: "68.78 م — على شارع عرض 15 م" },
  { id: "east", label: "الحد الشرقي", value: "41.92 م — على ممر مشاة عرض 8 م" },
  { id: "west", label: "الحد الغربي", value: "42.5 م — على شارع عرض 41 م" },
];

function buildBoundaryFields(deed) {
  if (!deed?.property && !deed?.boundaries) return null;
  const { property, boundaries } = deed;
  return [
    { id: "area", label: "المساحة الإجمالية", value: property?.area_m2 != null ? `${property.area_m2} م²` : "—" },
    { id: "north", label: "الحد الشمالي", value: boundaries?.north || "—" },
    { id: "south", label: "الحد الجنوبي", value: boundaries?.south || "—" },
    { id: "east", label: "الحد الشرقي", value: boundaries?.east || "—" },
    { id: "west", label: "الحد الغربي", value: boundaries?.west || "—" },
  ];
}

// Pull the first numeric value out of a boundary string like
// "70 م — على شارع عرض 20 م" -> "70". Used to pre-fill the dimension
// inputs when the deed happens to carry them; the user still must confirm.
function leadingNumber(text) {
  if (!text) return "";
  const match = String(text).match(/\d+(?:\.\d+)?/);
  return match ? match[0] : "";
}

function InfoRow({ label, value }) {
  if (value == null || value === "") return null;
  return (
    <div className="info-row">
      <span className="info-row__value">{value}</span>
      <span className="info-row__label">{label}</span>
    </div>
  );
}

export default function ConfirmData() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const extractedDeedRaw = useFormStore((state) => state.extractedDeedRaw);
  const setLandDimensions = useFormStore((state) => state.setLandDimensions);
  const setLandCoordinates = useFormStore((state) => state.setLandCoordinates);
  const deedBoundaryFields = buildBoundaryFields(extractedDeedRaw);

  const [fields, setFields] = useState(deedBoundaryFields ?? FALLBACK_BOUNDARIES);
  const [editingId, setEditingId] = useState(null);

  // Plot dimensions are mandatory. Pre-fill from the deed's boundaries when we
  // can, but the user must confirm both before continuing.
  const [dimensions, setDimensions] = useState(() => ({
    width: leadingNumber(extractedDeedRaw?.boundaries?.north),
    height: leadingNumber(extractedDeedRaw?.boundaries?.east),
  }));
  const [dimTouched, setDimTouched] = useState(false);

  // Coordinates are also mandatory — pulled from QR codes or entered manually.
  const initCoords = extractedDeedRaw?._coordinates;
  const [coords, setCoords] = useState({
    lat: initCoords ? String(initCoords.lat) : "",
    lng: initCoords ? String(initCoords.lng) : "",
  });
  const [coordsTouched, setCoordsTouched] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [pickedFromMap, setPickedFromMap] = useState(false);

  const dimensionsComplete =
    dimensions.width.trim() !== "" &&
    dimensions.height.trim() !== "" &&
    Number(dimensions.width) > 0 &&
    Number(dimensions.height) > 0;

  const coordsComplete = initCoords || (
    coords.lat.trim() !== "" &&
    coords.lng.trim() !== "" &&
    !isNaN(Number(coords.lat)) &&
    !isNaN(Number(coords.lng))
  );

  function handleContinue() {
    if (!dimensionsComplete || !coordsComplete) {
      setDimTouched(true);
      setCoordsTouched(true);
      return;
    }
    setLandDimensions(dimensions);
    if (!initCoords) {
      setLandCoordinates({ lat: Number(coords.lat), lng: Number(coords.lng) });
    }
    navigate("/questions/1");
  }

  const doc = extractedDeedRaw?.document;
  const property = extractedDeedRaw?.property;
  const owners = extractedDeedRaw?.owners?.filter((o) => o?.name || o?.id_number) ?? [];
  const qrCodes = extractedDeedRaw?.qr_codes?.filter((q) => q?.decoded_text) ?? [];
  const verificationUrl = extractedDeedRaw?.verification?.verification_url;
  const extraInfo = extractedDeedRaw?.extra_information ?? {};
  const extraEntries = Object.entries(extraInfo).filter(([, v]) => v != null && v !== "");

  const docNumber = doc?.document_number;

  function updateValue(id, value) {
    setFields((prev) => prev.map((field) => (field.id === id ? { ...field, value } : field)));
  }

  const mapsUrl = coords.lat && coords.lng ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}` : null;

  return (
    <div className="page">
      <Navbar />
      <main className="confirm-data">
        <span className="confirm-data__badge">{t("confirm.badge")}</span>
        <h1 className="confirm-data__title">{t("confirm.title")}</h1>
        <p className="confirm-data__subtitle">
          {t("confirm.subtitle")}
        </p>

        {/* ── Boundaries (editable) ── */}
        <div className="confirm-card">
          {fields.map((field, index) => (
            <div className={`confirm-row ${index === 0 ? "confirm-row--first" : ""}`} key={field.id}>
              <div className="confirm-row__info">
                {editingId === field.id ? (
                  <input
                    autoFocus
                    className="confirm-row__input"
                    value={field.value}
                    onChange={(event) => updateValue(field.id, event.target.value)}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") setEditingId(null);
                    }}
                  />
                ) : (
                  <p className="confirm-row__value">{field.value}</p>
                )}
                <p className="confirm-row__label">{field.label}</p>
              </div>
              <button type="button" className="confirm-row__edit" onClick={() => setEditingId(field.id)}>
                {t("confirm.edit")}
              </button>
            </div>
          ))}
        </div>

        {/* ── Coordinates from QR codes (required) ── */}
        <section className="confirm-section confirm-section--map">
          <h2 className="confirm-section__title">{t("confirm.coords_title")}</h2>
          <div className="confirm-section__body">
            {initCoords ? (
              <>
                <div className="coords-row">
                  <div className="coords-row__pair">
                    <span className="coords-row__value">{initCoords.lat.toFixed(6)}</span>
                    <span className="coords-row__label">{t("confirm.coords_lat")}</span>
                  </div>
                  <div className="coords-row__pair">
                    <span className="coords-row__value">{initCoords.lng.toFixed(6)}</span>
                    <span className="coords-row__label">{t("confirm.coords_lng")}</span>
                  </div>
                </div>
                {mapsUrl && (
                  <a className="coords-row__link" href={mapsUrl} target="_blank" rel="noreferrer">
                    {t("confirm.coords_map")}
                  </a>
                )}
              </>
            ) : (
              <>
                <p className="confirm-dims__hint">
                  {t("confirm.coords_hint")}
                </p>
                <button type="button" className="confirm-dims__map-btn" onClick={() => setMapOpen(true)}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                    <path
                      d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                  {t("map.pick_button")}
                </button>
                {pickedFromMap && <p className="confirm-dims__picked-hint">{t("map.picked_hint")}</p>}
                <div className="confirm-dims__grid">
                  <label className="confirm-dims__field">
                    <span className="confirm-dims__label">{t("confirm.coords_lat")}</span>
                    <input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      className={`confirm-dims__input${
                        coordsTouched && coords.lat.trim() === "" ? " confirm-dims__input--error" : ""
                      }`}
                      placeholder={t("confirm.coords_placeholder_lat")}
                      value={coords.lat}
                      onChange={(e) => {
                        setCoords((c) => ({ ...c, lat: e.target.value }));
                        setPickedFromMap(false);
                      }}
                    />
                  </label>
                  <label className="confirm-dims__field">
                    <span className="confirm-dims__label">{t("confirm.coords_lng")}</span>
                    <input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      className={`confirm-dims__input${
                        coordsTouched && coords.lng.trim() === "" ? " confirm-dims__input--error" : ""
                      }`}
                      placeholder={t("confirm.coords_placeholder_lng")}
                      value={coords.lng}
                      onChange={(e) => {
                        setCoords((c) => ({ ...c, lng: e.target.value }));
                        setPickedFromMap(false);
                      }}
                    />
                  </label>
                </div>
                {coordsTouched && !coordsComplete && (
                  <p className="confirm-dims__error">{t("confirm.coords_error")}</p>
                )}
              </>
            )}
          </div>
        </section>

        {/* ── Document info ── */}
        {doc && (
          <section className="confirm-section">
            <h2 className="confirm-section__title">{t("confirm.doc_title")}</h2>
            <div className="confirm-section__body info-grid">
              <InfoRow label="رقم الصك" value={doc.document_number} />
              <InfoRow label="نوع الصك" value={doc.document_type} />
              <InfoRow label="حالة الصك" value={doc.document_status} />
              <InfoRow label="نوع العملية" value={doc.operation_type} />
              <InfoRow label="تاريخ الإصدار (هجري)" value={doc.issue_date_hijri} />
              <InfoRow label="تاريخ الإصدار (ميلادي)" value={doc.issue_date_gregorian} />
              <InfoRow label="الصك السابق" value={doc.previous_document_number} />
              <InfoRow label="تاريخ الصك السابق" value={doc.previous_document_date} />
            </div>
          </section>
        )}

        {/* ── Property info ── */}
        {property && (
          <section className="confirm-section">
            <h2 className="confirm-section__title">{t("confirm.property_title")}</h2>
            <div className="confirm-section__body info-grid">
              <InfoRow label="رقم العقار" value={property.property_id} />
              <InfoRow label="نوع العقار" value={property.property_type} />
              <InfoRow label="المدينة" value={property.city} />
              <InfoRow label="الحي" value={property.district} />
              <InfoRow label="نوع المخطط" value={property.plan_type} />
              <InfoRow label="رقم المخطط" value={property.plan_number} />
              <InfoRow label="رقم المربع" value={property.block} />
              <InfoRow label="رقم القطعة" value={property.parcel_number} />
            </div>
          </section>
        )}

        {/* ── Owners ── */}
        {owners.length > 0 && (
          <section className="confirm-section">
            <h2 className="confirm-section__title">{t("confirm.owners_title")}</h2>
            <div className="confirm-section__body owners-list">
              {owners.map((owner, idx) => (
                <div className="owner-card" key={idx}>
                  <p className="owner-card__name">{owner.name || "—"}</p>
                  <div className="owner-card__meta">
                    {owner.id_number && <span>رقم الهوية: {owner.id_number}</span>}
                    {owner.ownership_percentage != null && (
                      <span>نسبة الملكية: {owner.ownership_percentage}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── QR codes + verification ── */}
        {(qrCodes.length > 0 || verificationUrl) && (
          <section className="confirm-section">
            <h2 className="confirm-section__title">{t("confirm.qr_title")}</h2>
            <div className="confirm-section__body">
              {verificationUrl && (
                <a className="qr-link" href={verificationUrl} target="_blank" rel="noreferrer">
                  {t("confirm.verify_link")}
                </a>
              )}
              {qrCodes.map((qr, idx) => (
                <p className="qr-code-text" key={idx}>{qr.decoded_text}</p>
              ))}
            </div>
          </section>
        )}

        {/* ── Extra information from Gemini ── */}
        {extraEntries.length > 0 && (
          <section className="confirm-section">
            <h2 className="confirm-section__title">{t("confirm.extra_title")}</h2>
            <div className="confirm-section__body info-grid">
              {extraEntries.map(([key, value]) => (
                <InfoRow key={key} label={key} value={String(value)} />
              ))}
            </div>
          </section>
        )}

        {/* ── Plot dimensions (required) ── */}
        <section className="confirm-section confirm-section--dims">
          <h2 className="confirm-section__title">{t("confirm.dims_title")}</h2>
          <p className="confirm-dims__hint">
            {t("confirm.dims_hint")}
          </p>
          <div className="confirm-dims__grid">
            <label className="confirm-dims__field">
              <span className="confirm-dims__label">{t("confirm.dims_width")}</span>
              <input
                type="number"
                min="0"
                inputMode="decimal"
                className={`confirm-dims__input${
                  dimTouched && dimensions.width.trim() === "" ? " confirm-dims__input--error" : ""
                }`}
                placeholder={t("confirm.dims_placeholder_width")}
                value={dimensions.width}
                onChange={(e) => setDimensions((d) => ({ ...d, width: e.target.value }))}
              />
            </label>
            <label className="confirm-dims__field">
              <span className="confirm-dims__label">{t("confirm.dims_height")}</span>
              <input
                type="number"
                min="0"
                inputMode="decimal"
                className={`confirm-dims__input${
                  dimTouched && dimensions.height.trim() === "" ? " confirm-dims__input--error" : ""
                }`}
                placeholder={t("confirm.dims_placeholder_height")}
                value={dimensions.height}
                onChange={(e) => setDimensions((d) => ({ ...d, height: e.target.value }))}
              />
            </label>
          </div>
          {dimTouched && !dimensionsComplete && (
            <p className="confirm-dims__error">{t("confirm.dims_error")}</p>
          )}
        </section>

        <p className="confirm-data__source">
          {docNumber ? t("confirm.source", { num: docNumber }) : t("confirm.source_fallback")}
        </p>

        <Button fullWidth disabled={!dimensionsComplete || !coordsComplete} onClick={handleContinue}>
          {t("confirm.btn")}
        </Button>
      </main>

      {mapOpen && (
        <Suspense fallback={null}>
          <LocationMapPicker
            initialLat={coords.lat ? Number(coords.lat) : null}
            initialLng={coords.lng ? Number(coords.lng) : null}
            onConfirm={({ lat, lng }) => {
              setCoords({ lat: String(lat), lng: String(lng) });
              setPickedFromMap(true);
              setMapOpen(false);
            }}
            onClose={() => setMapOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
