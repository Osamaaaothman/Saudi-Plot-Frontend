import { useNavigate } from "react-router-dom";
import QuestionLayout from "../../Components/QuestionLayout/QuestionLayout";
import "./Question6.css";

const TAGS = [
  { label: "رئيسية · 28م²", color: "pink" },
  { label: "نوم ×3 · 46م²", color: "green" },
  { label: "حمامات ×3 · 19م²", color: "purple" },
  { label: "صالة · 38م²", color: "gray" },
  { label: "مطبخ تحضيري · 28م²", color: "yellow" },
  { label: "مجلس + مقلط · 46م²", color: "blue" },
  { label: "حمام ضيوف · 5م²", color: "purple" },
  { label: "سائق وعاملة · 24م²", color: "blue" },
  { label: "غسيل · 8م²", color: "gray" },
];

export default function Question6() {
  const navigate = useNavigate();

  return (
    <QuestionLayout
      stepIndex={6}
      stepLabel="الخطوة الأخيرة"
      title="جهّزنا قائمة فراغات بيتك"
      subtitle="من إجاباتك — عدّل بالعدّادات ما تشاء ثم ابدأ التصميم"
      onBack={() => navigate(-1)}
      onNext={() => navigate("/room-catalog")}
      nextLabel="ابدأ تصميم مخططي ←"
      singleAction
    >
      <div className="space-tags">
        {TAGS.map((tag) => (
          <span key={tag.label} className={`space-tag space-tag--${tag.color}`}>
            {tag.label}
          </span>
        ))}
      </div>

      <p className="space-summary">الإجمالي 242م² — يناسب أرضك (2,892م²) بارتياح ✓</p>
    </QuestionLayout>
  );
}
