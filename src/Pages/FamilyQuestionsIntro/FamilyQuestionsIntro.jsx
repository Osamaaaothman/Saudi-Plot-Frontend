import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionLayout from "../../Components/QuestionLayout/QuestionLayout";

const OPTIONS = ["2 – 4", "5 – 7", "8 – 10", "أكثر من 10"];

export default function FamilyQuestionsIntro() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("5 – 7");

  return (
    <QuestionLayout
      stepLabel="السؤال 1 من 5 — عن أسرتك"
      progress={0.2}
      title="كم عدد أفراد أسرتك؟"
      subtitle="يساعدنا هذا على اقتراح عدد الغرف المناسب — يمكنك تعديله لاحقًا"
      onBack={() => navigate(-1)}
      onNext={() => navigate("/questions/1")}
    >
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
    </QuestionLayout>
  );
}
