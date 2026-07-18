import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import Button from "../../Components/Button/Button";
import { useFormStore } from "../../Store/useFormStore";
import "./ConfirmData.css";

const FALLBACK_FIELDS = [
  { id: "area", label: "المساحة الإجمالية", value: "2,892.3 م²" },
  { id: "north", label: "الحد الشمالي", value: "70 م — على شارع عرض 20 م" },
  { id: "south", label: "الحد الجنوبي", value: "68.78 م — على شارع عرض 15 م" },
  { id: "east", label: "الحد الشرقي", value: "41.92 م — على ممر مشاة عرض 8 م" },
  { id: "west", label: "الحد الغربي", value: "42.5 م — على شارع عرض 41 م" },
];

function buildFieldsFromDeed(deed) {
  if (!deed) return null;
  const { property, boundaries } = deed;
  if (!property && !boundaries) return null;

  return [
    {
      id: "area",
      label: "المساحة الإجمالية",
      value: property?.area_m2 != null ? `${property.area_m2} م²` : "—",
    },
    {
      id: "north",
      label: "الحد الشمالي",
      value: boundaries?.north || "—",
    },
    {
      id: "south",
      label: "الحد الجنوبي",
      value: boundaries?.south || "—",
    },
    {
      id: "east",
      label: "الحد الشرقي",
      value: boundaries?.east || "—",
    },
    {
      id: "west",
      label: "الحد الغربي",
      value: boundaries?.west || "—",
    },
  ];
}

export default function ConfirmData() {
  const navigate = useNavigate();
  const extractedDeedRaw = useFormStore((state) => state.extractedDeedRaw);
  const deedFields = buildFieldsFromDeed(extractedDeedRaw);

  const [fields, setFields] = useState(deedFields ?? FALLBACK_FIELDS);
  const [editingId, setEditingId] = useState(null);

  const docNumber = extractedDeedRaw?.document?.document_number;

  function updateValue(id, value) {
    setFields((prev) => prev.map((field) => (field.id === id ? { ...field, value } : field)));
  }

  return (
    <div className="page">
      <Navbar />
      <main className="confirm-data">
        <span className="confirm-data__badge">قرأنا صكّك بنجاح ✓</span>
        <h1 className="confirm-data__title">تأكّد من بيانات أرضك</h1>
        <p className="confirm-data__subtitle">
          هذه البيانات كما وردت في الصك — راجعها وعدّل ما تحتاج قبل المتابعة
        </p>

        <div className="confirm-card">
          {fields.map((field, index) => (
            <div
              className={`confirm-row ${index === 0 ? "confirm-row--first" : ""}`}
              key={field.id}
            >
              <div className="confirm-row__info">
                {editingId === field.id ? (
                  <input
                    autoFocus
                    className="confirm-row__input"
                    value={field.value}
                    onChange={(event) => updateValue(field.id, event.target.value)}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") setEditingId(null);
                    }}
                  />
                ) : (
                  <p className="confirm-row__value">{field.value}</p>
                )}
                <p className="confirm-row__label">{field.label}</p>
              </div>
              <button
                type="button"
                className="confirm-row__edit"
                onClick={() => setEditingId(field.id)}
              >
                تعديل
              </button>
            </div>
          ))}
        </div>

        <p className="confirm-data__source">
          {docNumber
            ? `المصدر: صك إلكتروني رقم ${docNumber} — وزارة العدل`
            : "المصدر: وزارة العدل"}
        </p>

        <Button fullWidth onClick={() => navigate("/questions/1")}>
          البيانات صحيحة — متابعة إلى أسئلة الأسرة
        </Button>
      </main>
    </div>
  );
}
