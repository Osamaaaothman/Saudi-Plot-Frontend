import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionLayout from "../../Components/QuestionLayout/QuestionLayout";
import Stepper from "../../Components/Stepper/Stepper";

export default function Question1() {
  const navigate = useNavigate();
  const [adults, setAdults] = useState(4);
  const [children, setChildren] = useState(3);

  return (
    <QuestionLayout
      stepLabel="السؤال 1 من 6 — عن أسرتك وبيتك"
      progress={1 / 6}
      title="كم عدد أفراد أسرتك؟"
      subtitle="يساعدنا هذا على حساب عدد الغرف المناسب"
      onBack={() => navigate(-1)}
      onNext={() => navigate("/questions/2")}
    >
      <div className="stepper-stack">
        <Stepper label="البالغون" value={adults} onChange={setAdults} min={1} />
        <Stepper label="الأطفال" value={children} onChange={setChildren} min={0} />
      </div>
    </QuestionLayout>
  );
}
