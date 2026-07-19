import { useNavigate } from "react-router-dom";
import QuestionLayout from "../../Components/QuestionLayout/QuestionLayout";
import usePageTitle from "../../hooks/usePageTitle";
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
      onNext={() => navigate("/generating")}
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

      <button type="button" className="space-edit-btn" onClick={() => navigate("/room-catalog")}>
        {/* DOM order (text, icon) so RTL flex places the text at the visual
            right and the pencil icon at the visual left, matching the design. */}
        تعديل
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
          <path
            d="M4 20l1.1-4.4L16.5 4.2a1.5 1.5 0 0 1 2.1 0l1.2 1.2a1.5 1.5 0 0 1 0 2.1L8.4 18.9 4 20Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <p className="space-summary">الإجمالي 242م² — يناسب أرضك (2,892م²) بارتياح ✓</p>
    </QuestionLayout>
  );
}
