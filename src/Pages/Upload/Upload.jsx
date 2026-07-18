import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import Button from "../../Components/Button/Button";
import { useFormStore } from "../../Store/useFormStore";
import { analyzeDeed, validateFile } from "../../utils/geminiService";
import { scanQRCodesFromImage } from "../../utils/qrScanner";
import "./Upload.css";

const STEPS = [
  { id: "reading", label: "قراءة الملف" },
  { id: "sending", label: "التواصل مع الذكاء الاصطناعي" },
  { id: "parsing", label: "استخراج بيانات الصك" },
];

const STEP_ORDER = ["reading", "sending", "parsing"];
const QR_SCAN_TIMEOUT_MS = 8000;
const EMPTY_QR_RESULT = { codes: [], coordinates: null };

function withTimeout(promise, ms, fallback) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

function getStepState(stepId, currentStatus) {
  if (currentStatus === "done") return "done";
  const stepIdx = STEP_ORDER.indexOf(stepId);
  const currentIdx = STEP_ORDER.indexOf(currentStatus);
  if (currentIdx === -1) return "pending";
  if (currentIdx > stepIdx) return "done";
  if (currentIdx === stepIdx) return "active";
  return "pending";
}

export default function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState("idle");
  const [fileError, setFileError] = useState(null);
  const setExtractedDeedRaw = useFormStore((state) => state.setExtractedDeedRaw);

  async function handleFile(file) {
    if (!file || analyzeStatus !== "idle") return;
    setFileError(null);

    try {
      validateFile(file);
    } catch (err) {
      setFileError(err.message);
      return;
    }

    // Start QR scan immediately (local) — runs in parallel with Gemini.
    // Capped with a timeout so a pathological PDF can never block navigation.
    const qrScanPromise = withTimeout(
      scanQRCodesFromImage(file),
      QR_SCAN_TIMEOUT_MS,
      EMPTY_QR_RESULT
    );

    try {
      const result = await analyzeDeed(file, (step) => setAnalyzeStatus(step));

      // QR scan is almost certainly done by now (Gemini takes much longer)
      const qrData = await qrScanPromise;

      // Inject browser-scanned QR data when Gemini couldn't decode QR codes
      if (qrData.codes.length > 0) {
        const geminiDecodedAny = result.qr_codes?.some((qr) => qr.decoded_text);
        if (!geminiDecodedAny) {
          result.qr_codes = qrData.codes.map((code) => ({
            exists: true,
            decoded_text: code,
            type: "browser_scan",
          }));
        }
      }
      // Store extracted coordinates separately for easy access in ConfirmData
      if (qrData.coordinates) {
        result._coordinates = qrData.coordinates;
      }

      setExtractedDeedRaw(result);
      setAnalyzeStatus("done");
      setTimeout(() => navigate("/confirm-data"), 950);
    } catch (err) {
      setAnalyzeStatus("idle");
      navigate("/manual-entry", {
        state: {
          extractionFailed: true,
          errorMessage: err.message || "لم نستطع قراءة بيانات الصك",
        },
      });
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  }

  const isAnalyzing = analyzeStatus !== "idle";

  return (
    <div className="page upload-page">
      <Navbar />
      <main className="upload">
        <p className="upload__step">الخطوة 1 من 3 — الصك</p>
        <h1 className="upload__title">صمّم فكرة فيلتك من صكّك</h1>
        <p className="upload__subtitle">
          ارفع صورة الصك وسنقرأ بيانات أرضك تلقائيًا — بلا أي إدخال يدوي
        </p>

        <div
          className={`upload-card${isDragging ? " upload-card--dragging" : ""}${isAnalyzing ? " upload-card--disabled" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            if (!isAnalyzing) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isAnalyzing && fileInputRef.current?.click()}
        >
          <div className="upload-card__icon">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" aria-hidden="true">
              <path
                d="M12 15.5V4m0 0 4 4m-4-4-4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 14.5v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="upload-card__label">اسحب ملف الصك وأفلته هنا</p>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            disabled={isAnalyzing}
          >
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

        {fileError && <p className="upload__file-error">{fileError}</p>}

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
          onClick={() => navigate("/manual-entry")}
          disabled={isAnalyzing}
        >
          أو أدخل بيانات الأرض يدويًا ←
        </button>

        <p className="upload__privacy">
          <svg
            className="upload__privacy-icon"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            aria-hidden="true"
          >
            <rect x="5" y="10.5" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M8 10.5V8a4 4 0 0 1 8 0v2.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          بيانات صكّك تُعالج بأمان ولا تُشارك مع أي جهة خارجية
        </p>
      </main>

      {/* ── Analyzing overlay ── */}
      {isAnalyzing && (
        <div className="upload-analyzing" role="dialog" aria-modal="true" aria-label="جارٍ تحليل الصك">
          <div className="upload-analyzing__card">
            {analyzeStatus === "done" ? (
              <div className="upload-analyzing__success">
                <div className="upload-analyzing__success-icon">
                  <svg viewBox="0 0 24 24" width="38" height="38" fill="none" aria-hidden="true">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="upload-analyzing__success-title">اكتمل التحليل!</p>
                <p className="upload-analyzing__success-sub">جارٍ الانتقال للتحقق من البيانات...</p>
              </div>
            ) : (
              <>
                <div className="upload-analyzing__header">
                  <div className="upload-analyzing__scan">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true">
                      <path
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <polyline
                        points="14 2 14 8 20 8"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3 className="upload-analyzing__title">جارٍ تحليل صكّك</h3>
                  <p className="upload-analyzing__subtitle">يرجى الانتظار قليلًا...</p>
                </div>

                <div className="upload-analyzing__steps">
                  {STEPS.map((step) => {
                    const state = getStepState(step.id, analyzeStatus);
                    return (
                      <div key={step.id} className={`analyze-step analyze-step--${state}`}>
                        <span className="analyze-step__label">{step.label}</span>
                        <div className="analyze-step__icon" aria-hidden="true">
                          {state === "done" && (
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                          {state === "active" && (
                            <svg className="analyze-step__spinner" viewBox="0 0 24 24" width="16" height="16" fill="none">
                              <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
                              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                          )}
                          {state === "pending" && (
                            <svg viewBox="0 0 24 24" width="8" height="8">
                              <circle cx="12" cy="12" r="5" fill="currentColor" />
                            </svg>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
