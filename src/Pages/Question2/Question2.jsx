import { useNavigate } from "react-router-dom";
import QuestionLayout from "../../Components/QuestionLayout/QuestionLayout";
import usePageTitle from "../../hooks/usePageTitle";
import { useFormStore } from "../../Store/useFormStore";

export default function Question2() {
  const navigate = useNavigate();
  const hasElderly = useFormStore((state) => state.hasElderly);
  const setHasElderly = useFormStore((state) => state.setHasElderly);

  return (
    <QuestionLayout
      stepIndex={2}
      stepLabel="السؤال 2 من 6"
      title="هل في أسرتك كبار سن أو من يحتاج سهولة حركة؟"
      subtitle="سنجعل لهم غرفة نوم بحمّام ميسّر في مكان مريح"
      onBack={() => navigate(-1)}
      onNext={() => navigate("/questions/3")}
    >
      <div className="chip-row">
        <button
          type="button"
          className={`chip ${hasElderly ? "chip--selected" : ""}`}
          onClick={() => setHasElderly(true)}
        >
          نعم
        </button>
        <button
          type="button"
          className={`chip ${!hasElderly ? "chip--selected" : ""}`}
          onClick={() => setHasElderly(false)}
        >
          لا
        </button>
      </div>
    </QuestionLayout>
  );
}
