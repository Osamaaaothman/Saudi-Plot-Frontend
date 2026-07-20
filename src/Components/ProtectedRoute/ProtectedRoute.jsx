import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../Store/useAuthStore";

// Renders children once the session has resolved and someone is signed in;
// redirects to /login (preserving the intended destination) otherwise.
// Session starts as `undefined` while Supabase resolves the initial
// session, so we render nothing rather than bouncing to /login too early.
export default function ProtectedRoute({ children }) {
  const session = useAuthStore((state) => state.session);
  const location = useLocation();

  if (session === undefined) return null;

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
