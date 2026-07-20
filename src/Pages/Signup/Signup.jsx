import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../Components/Navbar/Navbar";
import Button from "../../Components/Button/Button";
import GoogleIcon from "../../Components/GoogleIcon/GoogleIcon";
import usePageTitle from "../../hooks/usePageTitle";
import { signUp, signInWithGoogle } from "../../Store/useAuthStore";
import "../Login/Login.css";

export default function Signup() {
  const { t } = useTranslation();
  usePageTitle(t("auth.signup_title"));
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const { data, error: signUpError } = await signUp(email, password, fullName);
    setSubmitting(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data.session) {
      navigate("/projects", { replace: true });
    } else {
      setCheckEmail(true);
    }
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
        {checkEmail ? (
          <div className="auth-card">
            <h1 className="auth-card__title">{t("auth.check_email_title")}</h1>
            <p className="auth-card__subtitle">{t("auth.check_email_body", { email })}</p>
            <Link to="/login" className="auth-switch">
              {t("auth.link_login")}
            </Link>
          </div>
        ) : (
          <form className="auth-card" onSubmit={handleSubmit}>
            <h1 className="auth-card__title">{t("auth.signup_title")}</h1>
            <p className="auth-card__subtitle">{t("auth.signup_subtitle")}</p>

            <label className="auth-field">
              <span>{t("auth.full_name")}</span>
              <input
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </label>

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
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error && <p className="auth-error">{error}</p>}

            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? t("auth.loading") : t("auth.btn_signup")}
            </Button>

            <div className="auth-divider">
              <span>{t("auth.or")}</span>
            </div>

            <button type="button" className="auth-google-btn" onClick={handleGoogle}>
              <GoogleIcon /> {t("auth.continue_google")}
            </button>

            <p className="auth-switch">
              {t("auth.have_account")} <Link to="/login">{t("auth.link_login")}</Link>
            </p>
          </form>
        )}
      </main>
    </div>
  );
}
