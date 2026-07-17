import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionLayout from "../../Components/QuestionLayout/QuestionLayout";

const OPTIONS = [
  {
    id: "independent",
    title: "مجلس رجال بمدخل مستقل",
    desc: "يشمل تلقائيًا: حمام ومغاسل للضيوف + مقطع طعام قريب",
  },
  {
    id: "split",
    title: "مجلسان — رجال ونساء",
    desc: "فصل كامل لضيافة الرجال والنساء بمدخلين ومرافق مستقلة",
  },
  {
    id: "living-room",
    title: "تكفي الصالة",
    desc: "بدون مجلس منفصل — الضيافة في صالة المعيشة",
  },
];

export default function Question4() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("independent");

  return (
    <QuestionLayout
      stepLabel="السؤال 4 من 6 — عن أسرتك وبيتك"
      progress={4 / 6}
      title="كيف تستقبل ضيوفك؟"
      subtitle="اختيارك هنا يحدد خصوصية بيتك — أهم سؤال في القائمة"
      onBack={() => navigate(-1)}
      onNext={() => navigate("/questions/5")}
    >
      <div className="stepper-stack">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`option-card ${selected === option.id ? "option-card--selected" : ""}`}
            onClick={() => setSelected(option.id)}
          >
            <p className="option-card__title">{option.title}</p>
            <p className="option-card__desc">{option.desc}</p>
          </button>
        ))}
      </div>
    </QuestionLayout>
  );
}
