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

export default function Generating() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(2);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 900);
    const timeout = setTimeout(() => navigate("/result"), 900 * (STEPS.length - 2) + 700);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="page">
      <Navbar />
      <main className="generating">
        <div className="generating__spinner" aria-hidden="true" />
        <h1 className="generating__title">نصمّم مخططك الآن...</h1>

        <div className="generating__card">
          {STEPS.map((step, index) => (
            <div
              className={`generating__row ${index > activeIndex ? "generating__row--pending" : ""}`}
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
