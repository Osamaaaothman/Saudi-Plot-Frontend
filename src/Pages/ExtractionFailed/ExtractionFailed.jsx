import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../Components/Navbar/Navbar";
import Button from "../../Components/Button/Button";
import usePageTitle from "../../hooks/usePageTitle";
import { useFormStore } from "../../Store/useFormStore";
import "./ExtractionFailed.css";

export default function ExtractionFailed() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const FIELDS = [
    { key: "width", label: t("manual.width"), placeholder: t("manual.placeholder_width"), required: true },
    { key: "height", label: t("manual.height"), placeholder: t("manual.placeholder_height"), required: true },
    { key: "street", label: t("manual.street"), placeholder: t("manual.placeholder_street"), required: true },
  ];
  // The error banner only shows when we actually failed to read the deed
  // (backend/OCR error). Choosing "enter manually" from Upload shows just the form.
  const extractionFailed = Boolean(location.state?.extractionFailed);
  const errorMessage = location.state?.errorMessage || t("extraction_failed.title");
  const setLandDimensions = useFormStore((state) => state.setLandDimensions);
  const setLandCoordinates = useFormStore((state) => state.setLandCoordinates);
  const [values, setValues] = useState({ width: "", height: "", street: "" });
  const [coords, setCoords] = useState({ lat: "", lng: "" });
  const [coordsTouched, setCoordsTouched] = useState(false);

  const isComplete = FIELDS.every((field) => values[field.key].trim() !== "");
  const coordsComplete =
    coords.lat.trim() !== "" &&
    coords.lng.trim() !== "" &&
    !isNaN(Number(coords.lat)) &&
    !isNaN(Number(coords.lng));

  function handleChange(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleContinue() {
    if (!isComplete || !coordsComplete) {
      setCoordsTouched(true);
      return;
    }
    setLandDimensions({ width: values.width, height: values.height });
    setLandCoordinates({ lat: Number(coords.lat), lng: Number(coords.lng) });
    navigate("/questions/1", { state: { landData: values } });
  }

  return (
    <div className="page">
      <Navbar />
      <main className="extraction-failed">
        {extractionFailed && (
          <>
            <div className="error-banner">
              <p className="error-banner__mark">!</p>
              <div className="error-banner__text">
                <p className="error-banner__title">{t("extraction_failed.title")}</p>
                <p className="error-banner__subtitle">{errorMessage}</p>
              </div>
            </div>

            <Button variant="secondary" onClick={() => navigate("/upload")}>
              {t("extraction_failed.retry")}
            </Button>

            <p className="extraction-failed__divider">{t("extraction_failed.divider")}</p>
          </>
        )}

        <div className="manual-form">
          <p className="manual-form__title">{t("manual.title")}</p>
          <p className="manual-form__subtitle">{t("manual.subtitle")}</p>

          {FIELDS.map((field) => (
            <label className="manual-form__field" key={field.key}>
              <span className="manual-form__label">{field.label}</span>
              <input
                type="number"
                className="manual-form__input"
                placeholder={field.placeholder}
                value={values[field.key]}
                onChange={(event) => handleChange(field.key, event.target.value)}
              />
            </label>
          ))}

          <div className="manual-form__divider" />

          <p className="manual-form__hint">
            {t("manual.coords_hint")}
          </p>

          <label className="manual-form__field">
            <span className="manual-form__label">{t("manual.coords_lat")}</span>
            <input
              type="number"
              step="any"
              inputMode="decimal"
              className={`manual-form__input${
                coordsTouched && coords.lat.trim() === "" ? " manual-form__input--error" : ""
              }`}
              placeholder={t("manual.coords_placeholder_lat")}
              value={coords.lat}
              onChange={(e) => setCoords((c) => ({ ...c, lat: e.target.value }))}
            />
          </label>
          <label className="manual-form__field">
            <span className="manual-form__label">{t("manual.coords_lng")}</span>
            <input
              type="number"
              step="any"
              inputMode="decimal"
              className={`manual-form__input${
                coordsTouched && coords.lng.trim() === "" ? " manual-form__input--error" : ""
              }`}
              placeholder={t("manual.coords_placeholder_lng")}
              value={coords.lng}
              onChange={(e) => setCoords((c) => ({ ...c, lng: e.target.value }))}
            />
          </label>

          {coordsTouched && !coordsComplete && (
            <p className="manual-form__error">{t("manual.coords_error")}</p>
          )}

          <Button fullWidth disabled={!isComplete || !coordsComplete} onClick={handleContinue}>
            {t("manual.btn")}
          </Button>
        </div>
      </main>
    </div>
  );
}
