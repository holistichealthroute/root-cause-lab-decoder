import { useAuth } from "../../auth/AuthContext";
import { Navigate } from "react-router-dom";

export default function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user?.is_admin === 1 ? children : <Navigate to="/dashboard" replace />;
}
