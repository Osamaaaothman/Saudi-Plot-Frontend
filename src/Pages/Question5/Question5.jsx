import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionLayout from "../../Components/QuestionLayout/QuestionLayout";

const ROW_1 = ["غسيل وكيّ", "غرفة عاملة منزلية بحمّام", "غرفة سائق بحمّام"];
const ROW_2 = ["لا شيء", "مدخل خدمة مستقل", "مستودع"];

export default function Question5() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(["غرفة عاملة منزلية بحمّام", "غرفة سائق بحمّام"]);

  function toggle(option) {
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  }

  function renderChip(option) {
    const isSelected = selected.includes(option);
    return (
      <button
        key={option}
        type="button"
        className={`chip ${isSelected ? "chip--selected" : ""}`}
        onClick={() => toggle(option)}
      >
        {isSelected ? `${option} ✓` : option}
      </button>
    );
  }

  return (
    <QuestionLayout
      stepIndex={5}
      stepLabel="السؤال 5 من 6"
      title="هل تحتاج غرف خدمات؟"
      subtitle="اختر كل ما ينطبق — غرف السائق والعاملة تكون بمداخل مستقلة"
      onBack={() => navigate(-1)}
      onNext={() => navigate("/questions/6")}
    >
      <div className="stepper-stack">
        <div className="chip-row">{ROW_1.map(renderChip)}</div>
        <div className="chip-row">{ROW_2.map(renderChip)}</div>
      </div>
    </QuestionLayout>
  );
}
