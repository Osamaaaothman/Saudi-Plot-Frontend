import { motion } from "framer-motion";
import Button from "../Button/Button";
import { WIZARD_STEPS } from "./wizardSteps";
import { useSlideDirection } from "./SlideDirectionContext";
import { slideVariants, slideTransition } from "./slideVariants";
import "./QuestionLayout.css";

// Renders only the "variable" part of a question step — the card itself.
// The header + sidebar chrome is owned by QuestionWizardShell and stays
// mounted across question navigation, so only this card slides.
export default function QuestionLayout({
  stepIndex,
  stepLabel,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  nextDisabled = false,
  nextLabel = "التالي",
  backLabel = "السابق",
  singleAction = false,
}) {
  const StepIcon = WIZARD_STEPS[stepIndex - 1]?.Icon;
  const direction = useSlideDirection();

  return (
    <motion.div
      className="question-wizard__card"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
    >
      <div className="question__progress">
        {StepIcon && (
          <span className="question__icon">
            <StepIcon />
          </span>
        )}
        <p className="question__step">{stepLabel}</p>
      </div>

      <h1 className="question__title">{title}</h1>
      {subtitle && <p className="question__subtitle">{subtitle}</p>}

      <div className="question__content">{children}</div>

      {singleAction ? (
        <Button fullWidth onClick={onNext} disabled={nextDisabled}>
          {nextLabel}
        </Button>
      ) : (
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
      )}
    </motion.div>
  );
}
