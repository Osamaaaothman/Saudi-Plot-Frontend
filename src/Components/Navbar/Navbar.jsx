import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BrandMark from "../BrandMark/BrandMark";
import LanguageToggle from "../LanguageToggle/LanguageToggle";
import { useAuthStore, signOut } from "../../Store/useAuthStore";
import "./Navbar.css";

export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = useAuthStore((state) => state.session);

  async function handleLogout() {
    await signOut();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <BrandMark size="sm" />
        <p className="navbar__title">{t("brand.title")}</p>
      </div>

      <div className="navbar__actions">
        {session === undefined ? null : session ? (
          <div className="navbar__account">
            <Link to="/projects" className="navbar__account-link">
              {t("auth.my_projects")}
            </Link>
            <button type="button" className="navbar__account-logout" onClick={handleLogout}>
              {t("auth.logout")}
            </button>
          </div>
        ) : (
          <Link to="/login" className="navbar__account-link navbar__account-link--cta">
            {t("auth.sign_in")}
          </Link>
        )}

        <LanguageToggle className="navbar__lang" />
      </div>
    </header>
  );
}
