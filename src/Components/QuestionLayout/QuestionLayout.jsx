import Navbar from "../Navbar/Navbar";
import Button from "../Button/Button";
import "./QuestionLayout.css";

export default function QuestionLayout({
  stepLabel,
  progress,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  nextDisabled = false,
  nextLabel = "التالي",
  backLabel = "السابق",
}) {
  return (
    <div className="page">
      <Navbar />
      <main className="question">
        <div className="question__progress">
          <p className="question__step">{stepLabel}</p>
          <div className="question__track">
            <div className="question__fill" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>

        <h1 className="question__title">{title}</h1>
        {subtitle && <p className="question__subtitle">{subtitle}</p>}

        <div className="question__content">{children}</div>

        <div className="question__nav">
          {/* Next renders first so RTL flex (justify-content: space-between)
              places it on the visual right, Back on the visual left — matching the design. */}
          <Button onClick={onNext} disabled={nextDisabled}>
            {nextLabel}
          </Button>
          <Button variant="secondary" onClick={onBack}>
            {backLabel}
          </Button>
        </div>
      </main>
    </div>
  );
}
