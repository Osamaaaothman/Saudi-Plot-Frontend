import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <p className="navbar__title">تصميم أرضي</p>
      <button type="button" className="navbar__lang" aria-label="English">
        EN
      </button>
    </header>
  );
}
