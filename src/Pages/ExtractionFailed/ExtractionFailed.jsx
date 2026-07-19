import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import Button from "../../Components/Button/Button";
import usePageTitle from "../../hooks/usePageTitle";
import { useFormStore } from "../../Store/useFormStore";
import "./ExtractionFailed.css";

// width & height are the mandatory plot dimensions; street is extra context.
const FIELDS = [
  { key: "width", label: "عرض الأرض (متر)", placeholder: "مثال: 70", required: true },
  { key: "height", label: "طول الأرض (متر)", placeholder: "مثال: 42", required: true },
  { key: "street", label: "عرض الشارع الرئيسي (متر)", placeholder: "مثال: 20", required: true },
];

export default function ExtractionFailed() {
  const navigate = useNavigate();
  const location = useLocation();
  // The error banner only shows when we actually failed to read the deed
  // (backend/OCR error). Choosing "enter manually" from Upload shows just the form.
  const extractionFailed = Boolean(location.state?.extractionFailed);
  const errorMessage = location.state?.errorMessage || "لم نستطع قراءة بيانات الصك";
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
                <p className="error-banner__title">لم نستطع قراءة بيانات الصك</p>
                <p className="error-banner__subtitle">{errorMessage}</p>
              </div>
            </div>

            <Button variant="secondary" onClick={() => navigate("/upload")}>
              إعادة المحاولة بصورة أوضح
            </Button>

            <p className="extraction-failed__divider">— أو —</p>
          </>
        )}

        <div className="manual-form">
          <p className="manual-form__title">أدخل بيانات أرضك يدويًا</p>
          <p className="manual-form__subtitle">املأ المعلومات الأساسية من صكّك وإحداثيات الأرض إن أمكن.</p>

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
            إحداثيات الأرض — أدخلها إن أمكن لإظهار موقع أرضك على الخريطة في النتيجة النهائية.
          </p>

          <label className="manual-form__field">
            <span className="manual-form__label">خط العرض (Latitude)</span>
            <input
              type="number"
              step="any"
              inputMode="decimal"
              className={`manual-form__input${
                coordsTouched && coords.lat.trim() === "" ? " manual-form__input--error" : ""
              }`}
              placeholder="مثال: 24.7136"
              value={coords.lat}
              onChange={(e) => setCoords((c) => ({ ...c, lat: e.target.value }))}
            />
          </label>
          <label className="manual-form__field">
            <span className="manual-form__label">خط الطول (Longitude)</span>
            <input
              type="number"
              step="any"
              inputMode="decimal"
              className={`manual-form__input${
                coordsTouched && coords.lng.trim() === "" ? " manual-form__input--error" : ""
              }`}
              placeholder="مثال: 46.6753"
              value={coords.lng}
              onChange={(e) => setCoords((c) => ({ ...c, lng: e.target.value }))}
            />
          </label>

          {coordsTouched && !coordsComplete && (
            <p className="manual-form__error">الرجاء إدخال خط العرض وخط الطول (أرقام) قبل المتابعة.</p>
          )}

          <Button fullWidth disabled={!isComplete || !coordsComplete} onClick={handleContinue}>
            متابعة إلى أسئلة الأسرة
          </Button>
        </div>
      </main>
    </div>
  );
}
