import { AuthProvider } from "../auth/AuthContext";
import AppRoutes from "../routes";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

// 🔹 ToastWatcher inside router context
export function ToastWatcher() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.toastMessage) {
      if (location.state.type === "success")
        toast.success(location.state.toastMessage);
      else if (location.state.type === "error")
        toast.error(location.state.toastMessage);
      else if (location.state.type === "warning")
        toast.warning(location.state.toastMessage);
      else toast.info(location.state.toastMessage);
      // clean up so it doesn't persist
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return null;
}
