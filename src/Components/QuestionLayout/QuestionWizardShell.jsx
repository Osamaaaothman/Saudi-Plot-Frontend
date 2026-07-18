import { useNavigate } from "react-router-dom";
import WizardHeader from "../WizardHeader/WizardHeader";
import { WIZARD_STEPS } from "./wizardSteps";
import "./QuestionLayout.css";

// Persistent chrome for the question wizard: header + sidebar are derived
// purely from the current route, so this never remounts while navigating
// between /questions/1..6 — only the card content (children) animates.
export default function QuestionWizardShell({ pathname, children }) {
  const navigate = useNavigate();
  const stepIndex = WIZARD_STEPS.findIndex((step) => step.path === pathname) + 1;
  const isLastStep = stepIndex === WIZARD_STEPS.length;
  const progress = stepIndex / WIZARD_STEPS.length;

  return (
    <div className="page">
      <WizardHeader
        progress={progress}
        onBack={() => navigate(-1)}
        onNext={isLastStep ? undefined : () => navigate(WIZARD_STEPS[stepIndex]?.path)}
      />
      <main className="question-wizard">
        {/* Sidebar is first in DOM so RTL flex places it on the visual RIGHT,
            with the question card on the LEFT — matching the design. */}
        <aside className="wizard-sidebar">
          <p className="wizard-sidebar__title">أسئلة بيتك</p>
          <p className="wizard-sidebar__subtitle">6 أسئلة قصيرة — دقيقتان</p>

          <div className="wizard-sidebar__list">
            {WIZARD_STEPS.map(({ path, label, Icon }, idx) => {
              const num = idx + 1;
              const status = num < stepIndex ? "done" : num === stepIndex ? "active" : "pending";
              return (
                <div className={`wizard-sidebar__item wizard-sidebar__item--${status}`} key={path}>
                  {/* DOM order reversed (label, icon, badge) so RTL flex places
                      the label at the visual right and the badge at the left. */}
                  <span className="wizard-sidebar__label">{label}</span>
                  <span className="wizard-sidebar__icon">
                    <Icon />
                  </span>
                  <span className="wizard-sidebar__badge">{status === "done" ? "✓" : num}</span>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="question-wizard__card-slot">{children}</div>
      </main>
    </div>
  );
}
