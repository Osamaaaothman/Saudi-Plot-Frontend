import "./WizardHeader.css";

export default function WizardHeader({ progress, onBack, onNext }) {
  return (
    <header className="wizard-header">
      {/* DOM order is reversed from the visual left-to-right order so that
          RTL flex (first child -> visual right) reproduces the design:
          icon, brand, mini-back, progress, mini-next, EN. */}
      <div className="wizard-header__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4 9.5h16" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 3v3M16 3v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>

      <div className="wizard-header__brand">
        <p className="wizard-header__title">عمّر أرضك</p>
        <p className="wizard-header__subtitle">من صكّك إلى بيتك في دقائق</p>
      </div>

      {onBack && (
        <button type="button" className="wizard-header__mini-nav" onClick={onBack}>
          ‹ السابق
        </button>
      )}

      <div className="wizard-header__progress">
        <div className="wizard-header__track">
          <div className="wizard-header__fill" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      {onNext && (
        <button type="button" className="wizard-header__mini-nav" onClick={onNext}>
          التالي ›
        </button>
      )}

      <button type="button" className="wizard-header__lang" aria-label="English">
        EN
      </button>
    </header>
  );
}
