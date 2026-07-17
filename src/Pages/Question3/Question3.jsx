import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionLayout from "../../Components/QuestionLayout/QuestionLayout";
import Stepper from "../../Components/Stepper/Stepper";

export default function Question3() {
  const navigate = useNavigate();
  const [bedrooms, setBedrooms] = useState(4);
  const [masterBedrooms, setMasterBedrooms] = useState(1);

  return (
    <QuestionLayout
      stepLabel="السؤال 3 من 6 — عن أسرتك وبيتك"
      progress={3 / 6}
      title="كم غرفة نوم تحتاج؟"
      subtitle="اقترحنا الأرقام بناءً على عدد أفراد أسرتك — عدّلها كما تشاء"
      onBack={() => navigate(-1)}
      onNext={() => navigate("/questions/4")}
    >
      <span className="badge-hint">✨ مقترح تلقائي من إجاباتك</span>
      <div className="stepper-stack">
        <Stepper label="غرف النوم" value={bedrooms} onChange={setBedrooms} min={1} />
        <Stepper
          label="منها رئيسية (ماستر) بحمّام خاص"
          value={masterBedrooms}
          onChange={setMasterBedrooms}
          min={0}
          max={bedrooms}
        />
      </div>
    </QuestionLayout>
  );
}
