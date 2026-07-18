import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import Button from "../../Components/Button/Button";
import "./ExtractionFailed.css";

const FIELDS = [
  { key: "length", label: "طول الأرض (متر)", placeholder: "مثال: 70" },
  { key: "width", label: "عرض الأرض (متر)", placeholder: "مثال: 42" },
  { key: "street", label: "عرض الشارع الرئيسي (متر)", placeholder: "مثال: 20" },
];

export default function ExtractionFailed() {
  const navigate = useNavigate();
  const location = useLocation();
  // The error banner only shows when we actually failed to read the deed
  // (backend/OCR error). Choosing "enter manually" from Upload shows just the form.
  const extractionFailed = Boolean(location.state?.extractionFailed);
  const errorMessage = location.state?.errorMessage || "لم نستطع قراءة بيانات الصك";
  const [values, setValues] = useState({ length: "", width: "", street: "" });

  const isComplete = FIELDS.every((field) => values[field.key].trim() !== "");

  function handleChange(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleContinue() {
    if (!isComplete) return;
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

            <Button variant="secondary" onClick={() => navigate("/")}>
              إعادة المحاولة بصورة أوضح
            </Button>

            <p className="extraction-failed__divider">— أو —</p>
          </>
        )}

        <div className="manual-form">
          <p className="manual-form__title">أدخل بيانات أرضك يدويًا</p>
          <p className="manual-form__subtitle">ثلاث معلومات فقط — تجدها كلها مكتوبة في صكّك</p>

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

          <Button fullWidth disabled={!isComplete} onClick={handleContinue}>
            متابعة إلى أسئلة الأسرة
          </Button>
        </div>
      </main>
    </div>
  );
}
