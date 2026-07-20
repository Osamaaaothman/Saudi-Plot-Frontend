import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../Components/Navbar/Navbar";
import Button from "../../Components/Button/Button";
import GoogleIcon from "../../Components/GoogleIcon/GoogleIcon";
import usePageTitle from "../../hooks/usePageTitle";
import { signIn, signInWithGoogle } from "../../Store/useAuthStore";
import "./Login.css";

export default function Login() {
  const { t } = useTranslation();
  usePageTitle(t("auth.login_title"));
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/projects";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: signInError } = await signIn(email, password);
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    navigate(redirectTo, { replace: true });
  }

  async function handleGoogle() {
    setError("");
    const { error: googleError } = await signInWithGoogle();
    if (googleError) setError(googleError.message);
  }

  return (
    <div className="page auth-page">
      <Navbar />
      <main className="auth">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h1 className="auth-card__title">{t("auth.login_title")}</h1>
          <p className="auth-card__subtitle">{t("auth.login_subtitle")}</p>

          <label className="auth-field">
            <span>{t("auth.email")}</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="auth-field">
            <span>{t("auth.password")}</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? t("auth.loading") : t("auth.btn_login")}
          </Button>

          <div className="auth-divider">
            <span>{t("auth.or")}</span>
          </div>

          <button type="button" className="auth-google-btn" onClick={handleGoogle}>
            <GoogleIcon /> {t("auth.continue_google")}
          </button>

          <p className="auth-switch">
            {t("auth.no_account")} <Link to="/signup">{t("auth.link_signup")}</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
