import { useNavigate } from "react-router-dom";
import QuestionLayout from "../../Components/QuestionLayout/QuestionLayout";
import Stepper from "../../Components/Stepper/Stepper";
import usePageTitle from "../../hooks/usePageTitle";
import { useFormStore } from "../../Store/useFormStore";

export default function Question1() {
  const navigate = useNavigate();
  const familyMembers = useFormStore((state) => state.familyMembers);
  const setFamilyMembers = useFormStore((state) => state.setFamilyMembers);
  const { adults, children } = familyMembers;

  return (
    <QuestionLayout
      stepIndex={1}
      stepLabel="السؤال 1 من 6"
      title="كم عدد أفراد أسرتك؟"
      subtitle="يساعدنا هذا على حساب عدد الغرف المناسب"
      onBack={() => navigate(-1)}
      onNext={() => navigate("/questions/2")}
    >
      <div className="stepper-stack">
        <Stepper
          label="البالغون"
          value={adults}
          onChange={(value) => setFamilyMembers({ adults: value, children })}
          min={1}
        />
        <Stepper
          label="الأطفال"
          value={children}
          onChange={(value) => setFamilyMembers({ adults, children: value })}
          min={0}
        />
      </div>
    </QuestionLayout>
  );
}
