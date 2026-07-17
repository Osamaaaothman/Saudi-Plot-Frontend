import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionLayout from "../../Components/QuestionLayout/QuestionLayout";

export default function Question2() {
  const navigate = useNavigate();
  const [needsAccessible, setNeedsAccessible] = useState(true);

  return (
    <QuestionLayout
      stepLabel="السؤال 2 من 6 — عن أسرتك وبيتك"
      progress={2 / 6}
      title="هل في أسرتك كبار سن أو من يحتاج سهولة حركة؟"
      subtitle="سنجعل لهم غرفة نوم بحمّام ميسّر في مكان مريح"
      onBack={() => navigate(-1)}
      onNext={() => navigate("/questions/3")}
    >
      <div className="chip-row">
        <button
          type="button"
          className={`chip ${needsAccessible ? "chip--selected" : ""}`}
          onClick={() => setNeedsAccessible(true)}
        >
          نعم
        </button>
        <button
          type="button"
          className={`chip ${!needsAccessible ? "chip--selected" : ""}`}
          onClick={() => setNeedsAccessible(false)}
        >
          لا
        </button>
      </div>
    </QuestionLayout>
  );
}
