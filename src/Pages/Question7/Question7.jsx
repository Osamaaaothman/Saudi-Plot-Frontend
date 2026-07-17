import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import Button from "../../Components/Button/Button";
import "./Question7.css";

const SUMMARY_ROWS = [
  "حمام ومغاسل خاصة للضيوف قرب المجلس",
  "مقطع طعام متصل بالمجلس",
  "مطبخ تحضيري ملحق بالمطبخ الرئيسي",
  "غرفة ملابس للغرفة الرئيسية",
  "حمام مشترك لغرف الأطفال",
  "غرفة نوم أرضية ميسّرة لكبار السن",
];

export default function Question7() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <Navbar />
      <main className="summary">
        <h1 className="summary__title">جهّزنا لك هذه التفاصيل تلقائيًا</h1>
        <p className="summary__subtitle">
          بناءً على إجاباتك — راجعها وعدّل ما تشاء، أو ابدأ التصميم مباشرة
        </p>

        <div className="summary-card">
          {SUMMARY_ROWS.map((row, index) => (
            <div className={`summary-row ${index === 0 ? "summary-row--first" : ""}`} key={row}>
              <div className="summary-row__info">
                <span className="summary-row__mark">✓</span>
                <p className="summary-row__text">{row}</p>
              </div>
              <button type="button" className="summary-row__edit">
                تعديل
              </button>
            </div>
          ))}
        </div>

        <Button fullWidth onClick={() => navigate("/generating")}>
          ابدأ تصميم مخططي ←
        </Button>
      </main>
    </div>
  );
}
