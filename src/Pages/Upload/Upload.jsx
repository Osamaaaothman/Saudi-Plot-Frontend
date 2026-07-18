import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import Button from "../../Components/Button/Button";
import "./Upload.css";

export default function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);

  function handleFile(file) {
    if (!file || isReading) return;
    setIsReading(true);
    setTimeout(() => {
      navigate("/confirm-data", { state: { fileName: file.name } });
    }, 900);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="page">
      <Navbar />
      <main className="upload">
        <p className="upload__step">الخطوة 1 من 3 — الصك</p>
        <h1 className="upload__title">صمّم فكرة فيلتك من صكّك</h1>
        <p className="upload__subtitle">
          ارفع صورة الصك وسنقرأ بيانات أرضك تلقائيًا — بلا أي إدخال يدوي
        </p>

        <div
          className={`upload-card ${isDragging ? "upload-card--dragging" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="upload-card__icon">
            <span>⬆</span>
          </div>
          <p className="upload-card__label">
            {isReading ? "جارٍ قراءة الصك..." : "اسحب ملف الصك وأفلته هنا"}
          </p>
          <Button onClick={() => fileInputRef.current?.click()} disabled={isReading}>
            اختر ملفًا من جهازك
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/*"
            hidden
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          <p className="upload-card__hint">PDF أو صورة — وثيقة البورصة العقارية أو الصك التقليدي</p>
        </div>

        <svg
          className="upload__manual-icon"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 20l1.1-4.4L16.5 4.2a1.5 1.5 0 0 1 2.1 0l1.2 1.2a1.5 1.5 0 0 1 0 2.1L8.4 18.9 4 20Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.5 6.2l3.3 3.3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <button
          type="button"
          className="upload__manual-link"
          onClick={() => navigate("/extraction-failed")}
        >
          أو أدخل بيانات الأرض يدويًا ←
        </button>
        <p className="upload__privacy">🔒 بيانات صكّك تُعالج بأمان ولا تُشارك مع أي جهة خارجية</p>
      </main>
    </div>
  );
}
