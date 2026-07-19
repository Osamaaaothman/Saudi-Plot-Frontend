import { useNavigate } from "react-router-dom";
import QuestionLayout from "../../Components/QuestionLayout/QuestionLayout";
import usePageTitle from "../../hooks/usePageTitle";
import { useFormStore } from "../../Store/useFormStore";

const OPTIONS = ["مفتوح على الصالة", "مغلق", "مغلق + مطبخ تحضيري"];

export default function Question4() {
  const navigate = useNavigate();
  const selected = useFormStore((state) => state.kitchenType);
  const setSelected = useFormStore((state) => state.setKitchenType);

  return (
    <QuestionLayout
      stepIndex={4}
      stepLabel="السؤال 4 من 6"
      title="كيف تفضّل مطبخك؟"
      subtitle="المطبخ المغلق مع تحضيري خيار شائع في الفلل السعودية"
      onBack={() => navigate(-1)}
      onNext={() => navigate("/questions/5")}
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
