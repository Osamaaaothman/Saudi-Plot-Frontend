import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

const steps = [
  {
    number: "١",
    title: "ارفع صك الأرض",
    text: "نقرأ الأبعاد والحدود تلقائيًا، ويمكنك إدخالها يدويًا في أي وقت.",
  },
  {
    number: "٢",
    title: "أخبرنا عن بيتك",
    text: "أسئلة قصيرة عن الأسرة، المجلس، الخدمات، ونمط الحياة.",
  },
  {
    number: "٣",
    title: "استلم تصورك",
    text: "مخطط مبدئي ثنائي الأبعاد وكتلة ثلاثية الأبعاد قابلة للتطوير.",
  },
];

const features = [
  ["قراءة ذكية للصك", "نستخرج مساحة الأرض وحدودها وواجهاتها لنبدأ من بيانات صحيحة."],
  ["مصمم حول أسرتك", "كل اقتراح يتشكل وفق عدد أفراد الأسرة واحتياجاتهم اليومية."],
  ["طابع سعودي أصيل", "حلول تراعي الخصوصية والمجلس والضيافة والمناخ المحلي."],
];

export default function Landing() {
  const uploadRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const chooseFile = () => uploadRef.current?.click();

  return (
    <main className="landing-page">
      <section className="landing-hero" id="home">
        <div className="landing-hero-image" aria-hidden="true" />
        <div className="landing-hero-shade" aria-hidden="true" />

        <header className="landing-site-header">
          <a className="landing-brand" href="#home" aria-label="عَمِّر أرضك - الرئيسية">
            <span className="landing-brand-mark" aria-hidden="true">ع</span>
            <span>عَمِّر أرضك</span>
          </a>

          <button
            className="landing-menu-button"
            type="button"
            aria-label="فتح القائمة"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((value) => !value)}
          >
            <span />
            <span />
          </button>

          <nav
            className={isMenuOpen ? "landing-nav landing-nav-open" : "landing-nav"}
            aria-label="التنقل الرئيسي"
          >
            <a href="#how" onClick={() => setIsMenuOpen(false)}>كيف يعمل؟</a>
            <a href="#features" onClick={() => setIsMenuOpen(false)}>لماذا عَمِّر أرضك؟</a>
            <a href="#results" onClick={() => setIsMenuOpen(false)}>النتائج</a>
            <Link className="landing-nav-cta" to="/upload" onClick={() => setIsMenuOpen(false)}>
              ابدأ الآن
            </Link>
          </nav>
        </header>

        <div className="landing-hero-content">
          <div className="landing-eyebrow"><span /> من أرضٍ خالية إلى بيتٍ يشبهك</div>
          <h1>صمّم بداية<br />بيتك السعودي</h1>
          <p>
            ارفع صك أرضك، وأجب عن أسئلة بسيطة، واحصل على تصور معماري مبدئي
            يراعي احتياجات أسرتك وخصوصية حياتك.
          </p>
          <div className="landing-hero-actions">
            <Link className="landing-primary-button" to="/upload">
              ابدأ من صكّك <span aria-hidden="true">←</span>
            </Link>
            <a className="landing-text-button" href="#how">شاهد كيف يعمل <span aria-hidden="true">↓</span></a>
          </div>
          <div className="landing-trust-line">
            <span aria-hidden="true">✓</span> تجربة أولية مجانية
            <i />
            <span aria-hidden="true">◇</span> بياناتك تبقى خاصة
          </div>
        </div>

        <a className="landing-scroll-cue" href="#how" aria-label="انتقل إلى القسم التالي">
          <span>اكتشف التجربة</span>
          <b aria-hidden="true">⌄</b>
        </a>
      </section>

      <section className="landing-how landing-section" id="how">
        <div className="landing-section-intro">
          <span className="landing-kicker">كيف يعمل؟</span>
          <h2>ثلاث خطوات تفصل أرضك<br />عن أول تصور لبيتك</h2>
          <p>لا تحتاج إلى خبرة معمارية؛ نرشدك بوضوح من أول معلومة إلى أول مخطط.</p>
        </div>

        <div className="landing-steps-grid">
          {steps.map((step, index) => (
            <article className="landing-step-card" key={step.title}>
              <div className="landing-step-top">
                <span className="landing-step-number">{step.number}</span>
                <span className="landing-step-icon" aria-hidden="true">
                  {index === 0 ? "⌁" : index === 1 ? "⌂" : "▱"}
                </span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              {index < steps.length - 1 && (
                <span className="landing-step-connector" aria-hidden="true">←</span>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="landing-start-section landing-section" id="start">
        <div className="landing-start-copy">
          <span className="landing-kicker landing-kicker--light">الخطوة الأولى</span>
          <h2>كل بيت جميل<br />يبدأ بأرضه</h2>
          <p>
            ارفع صورة واضحة أو ملف PDF للصك. سنحلل بيانات الأرض ونطلب منك
            مراجعتها قبل الانتقال لأي خطوة.
          </p>
          <ul>
            <li><span>✓</span> يدعم الصك الإلكتروني والتقليدي</li>
            <li><span>✓</span> لا نشارك ملفاتك مع أي جهة خارجية</li>
            <li><span>✓</span> يمكنك تعديل كل معلومة يدويًا</li>
          </ul>
        </div>

        <div className="landing-upload-card">
          <div className="landing-upload-header">
            <div>
              <small>صك الأرض</small>
              <h3>{fileName ? "الملف جاهز للمراجعة" : "ارفع ملف الصك"}</h3>
            </div>
            <span className="landing-secure-badge">آمن</span>
          </div>

          <button
            className={fileName ? "landing-drop-zone landing-drop-zone--chosen" : "landing-drop-zone"}
            type="button"
            onClick={chooseFile}
          >
            <span className="landing-upload-icon" aria-hidden="true">{fileName ? "✓" : "↑"}</span>
            <strong>{fileName || "اسحب الملف هنا أو اضغط للاختيار"}</strong>
            <span>{fileName ? "اضغط لاختيار ملف مختلف" : "PDF أو JPG أو PNG — حتى 10 ميجابايت"}</span>
          </button>
          <input
            ref={uploadRef}
            className="landing-visually-hidden"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(event) => setFileName(event.target.files?.[0]?.name || "")}
          />

          <button className="landing-upload-action" type="button" onClick={chooseFile}>
            {fileName ? "متابعة ومراجعة البيانات" : "اختر ملفًا من جهازك"}
          </button>
          <button className="landing-manual-action" type="button">أو أدخل أبعاد الأرض يدويًا</button>
          <p className="landing-privacy-note"><span aria-hidden="true">◇</span> يُحذف ملفك بعد انتهاء المعالجة</p>
        </div>
      </section>

      <section className="landing-features landing-section" id="features">
        <div className="landing-section-intro landing-split-intro">
          <div>
            <span className="landing-kicker">مصمم لحياة حقيقية</span>
            <h2>العمارة تبدأ من الناس،<br />لا من الجدران</h2>
          </div>
          <p>
            نجمع بين بيانات أرضك واحتياجات الأسرة لنقترح تنظيمًا منطقيًا للمساحات،
            مع مراعاة الخصوصية والضيافة وطبيعة البيت السعودي.
          </p>
        </div>

        <div className="landing-feature-grid">
          {features.map(([title, text], index) => (
            <article className="landing-feature-card" key={title}>
              <span className="landing-feature-index">٠{index + 1}</span>
              <div className="landing-feature-glyph" aria-hidden="true">
                {index === 0 ? "⌗" : index === 1 ? "◎" : "✦"}
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-results landing-section" id="results">
        <div className="landing-result-visual" aria-hidden="true">
          <div className="landing-blueprint-frame">
            <span className="landing-room landing-room-one">مجلس</span>
            <span className="landing-room landing-room-two">صالة</span>
            <span className="landing-room landing-room-three">مطبخ</span>
            <span className="landing-room landing-room-four">جناح رئيسي</span>
          </div>
          <div className="landing-result-tag"><b>٢٬٨٩٢</b><span>م² مساحة الأرض</span></div>
        </div>

        <div className="landing-result-copy">
          <span className="landing-kicker landing-kicker--light">النتيجة الأولى</span>
          <h2>تصور تفهمه<br />وتبني عليه</h2>
          <p>
            شاهد توزيع المساحات وعلاقتها ببعضها، ثم انتقل إلى الكتلة الثلاثية
            الأبعاد. النتيجة ليست مخططًا تنفيذيًا، بل نقطة بداية ذكية للنقاش مع المعماري.
          </p>
          <div className="landing-result-stats">
            <div><strong>2D</strong><span>مخطط واضح</span></div>
            <div><strong>3D</strong><span>كتلة مبدئية</span></div>
            <div><strong>PDF</strong><span>ملف للمشاركة</span></div>
          </div>
          <Link className="landing-outline-button" to="/upload">
            ابدأ تصور بيتك <span aria-hidden="true">←</span>
          </Link>
        </div>
      </section>

      <section className="landing-final-cta landing-section">
        <span className="landing-kicker">خطوتك الأولى أسهل مما تتخيل</span>
        <h2>أرضك تحمل حكاية بيتك.<br />لنبدأ برسمها.</h2>
        <Link className="landing-primary-button" to="/upload">
          ابدأ الآن مجانًا <span aria-hidden="true">←</span>
        </Link>
      </section>

      <footer className="landing-footer">
        <a className="landing-brand landing-footer-brand" href="#home">
          <span className="landing-brand-mark" aria-hidden="true">ع</span>
          <span>عَمِّر أرضك</span>
        </a>
        <p>تصور معماري مبدئي يساعدك على بدء الرحلة بثقة.</p>
        <div className="landing-footer-links">
          <a href="#how">كيف يعمل؟</a>
          <a href="#features">عن التجربة</a>
          <a href="#start">ابدأ الآن</a>
        </div>
        <small>© ٢٠٢٦ عَمِّر أرضك — جميع الحقوق محفوظة</small>
      </footer>
    </main>
  );
}
