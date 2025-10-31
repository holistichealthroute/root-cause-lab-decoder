import { AuthProvider } from "./auth/AuthContext";
import AppRoutes from "./routes";
import { ToastWatcher } from "./components/ToastWatcher";
import { ToastContainer, toast, Slide } from "react-toastify";
import { IntakeProvider } from "./components/IntakeContext";

import "react-toastify/dist/ReactToastify.css";

import "./App.css";
export default function App() {
  return (
    <AuthProvider>
      <IntakeProvider>
        <ToastContainer
          position="top-right"
          autoClose={6000}
          closeOnClick
          transition={Slide}
          theme="colored" // ✅ gives red/green/yellow/blue backgrounds
        />

        <AppRoutes />
      </IntakeProvider>
    </AuthProvider>
  );
}
