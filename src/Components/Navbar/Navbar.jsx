import BrandMark from "../BrandMark/BrandMark";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__brand">
        <BrandMark size="sm" />
        <p className="navbar__title">عمّر أرضك</p>
      </div>
      <button type="button" className="navbar__lang" aria-label="English">
        EN
      </button>
    </header>
  );
}
