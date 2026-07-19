import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import usePageTitle from "../../hooks/usePageTitle";
import { useFormStore } from "../../Store/useFormStore";
import "./Generating.css";

const STEPS = [
  "قرأنا بيانات أرضك من الصك",
  "جرّبنا 38 توزيعًا مختلفًا للغرف",
  "نقيّم الآن الخصوصية والإضاءة والتهوية...",
  "نختار الأفضل ونجهّز المخطط",
];

const MIN_STEP_DELAY = 1000;
const MAX_STEP_DELAY = 5000;
const SUCCESS_DISPLAY_TIME = 1800;

function randomStepDelay() {
  return MIN_STEP_DELAY + Math.random() * (MAX_STEP_DELAY - MIN_STEP_DELAY);
}

export default function Generating() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState("progress");

  useEffect(() => {
    if (activeIndex >= STEPS.length) {
      const timeout = setTimeout(() => setPhase("success"), 300);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setActiveIndex((prev) => prev + 1), randomStepDelay());
    return () => clearTimeout(timeout);
  }, [activeIndex]);

  useEffect(() => {
    if (phase !== "success") return undefined;
    // Assemble the full form payload (objects/format.json shape) that will be
    // POSTed to the backend later, and log it as the result screen appears.
    const payload = useFormStore.getState().buildPayload();
    console.log("Saudi Plot — form payload for backend:", payload);
    console.log(JSON.stringify(payload, null, 2));
    const timeout = setTimeout(() => navigate("/result-3d"), SUCCESS_DISPLAY_TIME);
    return () => clearTimeout(timeout);
  }, [phase, navigate]);

  if (phase === "success") {
    return (
      <div className="page">
        <Navbar />
        <main className="generating">
          <div className="success-check">
            <svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">
              <circle className="success-check__circle" cx="40" cy="40" r="36" fill="none" />
              <path className="success-check__mark" fill="none" d="M24 41 L35 52 L57 28" />
            </svg>
          </div>
          <h1 className="generating__title generating__title--success">اكتمل تصميم مخططك!</h1>
          <p className="generating__hint">جارٍ نقلك إلى النتيجة...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar />
      <main className="generating">
        <div className="generating__spinner" aria-hidden="true" />
        <h1 className="generating__title">نصمّم مخططك الآن...</h1>

        <div className="generating__card">
          {STEPS.map((step, index) => (
            <div
              className={`generating__row ${
                index === activeIndex
                  ? "generating__row--active"
                  : index > activeIndex
                    ? "generating__row--pending"
                    : ""
              }`}
              key={step}
            >
              <span
                className={`generating__mark ${
                  index < activeIndex
                    ? "generating__mark--done"
                    : index === activeIndex
                      ? "generating__mark--active"
                      : "generating__mark--pending"
                }`}
              >
                {index < activeIndex ? "✓" : ""}
              </span>
              <p className="generating__text">{step}</p>
            </div>
          ))}
        </div>

        <p className="generating__hint">عادةً يستغرق هذا أقل من دقيقة</p>
      </main>
    </div>
  );
}
