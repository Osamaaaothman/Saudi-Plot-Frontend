import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionLayout from "../../Components/QuestionLayout/QuestionLayout";

const OPTIONS = ["مفتوح على الصالة", "مغلق", "مغلق + مطبخ تحضيري"];

export default function Question5() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("مغلق + مطبخ تحضيري");

  return (
    <QuestionLayout
      stepLabel="السؤال 5 من 6 — عن أسرتك وبيتك"
      progress={5 / 6}
      title="كيف تفضّل مطبخك؟"
      subtitle="المطبخ المغلق مع تحضيري خيار شائع في الفلل السعودية"
      onBack={() => navigate(-1)}
      onNext={() => navigate("/questions/6")}
    >
      <div className="chip-row">
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={`chip ${selected === option ? "chip--selected" : ""}`}
            onClick={() => setSelected(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </QuestionLayout>
  );
}
