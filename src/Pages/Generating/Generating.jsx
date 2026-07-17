import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import "./Generating.css";

const STEPS = [
  "قرأنا بيانات أرضك من الصك",
  "جرّبنا 38 توزيعًا مختلفًا للغرف",
  "نقيّم الآن الخصوصية والإضاءة والتهوية...",
  "نختار الأفضل ونجهّز المخطط",
];

const MIN_STEP_DELAY = 1000;
const MAX_STEP_DELAY = 5000;

function randomStepDelay() {
  return MIN_STEP_DELAY + Math.random() * (MAX_STEP_DELAY - MIN_STEP_DELAY);
}

export default function Generating() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= STEPS.length) {
      const timeout = setTimeout(() => navigate("/result"), 800);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setActiveIndex((prev) => prev + 1), randomStepDelay());
    return () => clearTimeout(timeout);
  }, [activeIndex, navigate]);

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
