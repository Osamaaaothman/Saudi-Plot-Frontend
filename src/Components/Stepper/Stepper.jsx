import "./Stepper.css";

export default function Stepper({ label, value, onChange, min = 0, max = 20 }) {
  return (
    <div className="stepper-row">
      <p className="stepper-row__label">{label}</p>
      <div className="stepper-row__controls">
        <button
          type="button"
          className="stepper-btn"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label="تقليل"
        >
          −
        </button>
        <span className="stepper-row__value">{value}</span>
        <button
          type="button"
          className="stepper-btn"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label="زيادة"
        >
          +
        </button>
      </div>
    </div>
  );
}
