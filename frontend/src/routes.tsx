import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastWatcher } from "./components/ToastWatcher";

import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import ForgetPassword from "./pages/Auth/ForgetPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import OAuthCallback from "./pages/Auth/OAuthCallback";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

import Disclaimer from "./pages/Upload/Disclaimer";

import AgeConsent from "./pages/Upload/AgeConsent";
import BloodTestResult from "./pages/Upload/BloodTestResult";
import Gender from "./pages/Upload/Gender";
import PregnancyStatus from "./pages/Upload/PregnancyStatus";
import MenstruationStatus from "./pages/Upload/MenstruationStatus";
import BowelMovements from "./pages/Upload/BowelMovements";
import Reports from "./pages/Upload/Reports";
import UploadReports from "./pages/Upload/UploadReports";

import CBC1 from "./pages/Upload/CBC1";
import CBC2 from "./pages/Upload/CBC2";
import CBC3 from "./pages/Upload/CBC3";

import CMB141 from "./pages/Upload/CMB141";
import CMB142 from "./pages/Upload/CMB142";
import CMB143 from "./pages/Upload/CMB143";

import Thyroid1 from "./pages/Upload/Thyroid1";
import Thyroid2 from "./pages/Upload/Thyroid2";

import Iron from "./pages/Upload/Iron";
import Lipid from "./pages/Upload/Lipid";
import Hemoglobin from "./pages/Upload/Hemoglobin";
import Magnesium from "./pages/Upload/Magnesium";
import VitaminD from "./pages/Upload/VitaminD";

import GenerateReport from "./pages/Upload/GenerateReport";
import ReportViewer from "./pages/ReportViewer";

import AppLayout from "./layouts/AppLayout";
import { useAuth } from "./auth/AuthContext";

import GenderAtBirth from "./pages/Upload/GenderAtBirth";

import AdminLayout from "./pages/Admin/Layout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminSuppliments from "./pages/Admin/Suppliments";
import RequireAdmin from "./pages/Auth/RequireAdmin";
import AdminProfile from "./pages/Admin/Profile";

// Only allow admin users
function RequireAdminRoute({ children }: { children: JSX.Element }) {
  return <RequireAdmin>{children}</RequireAdmin>;
}

// Only allow normal users
function RequireNormalUser({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user?.is_admin === 0 ? (
    children
  ) : (
    <Navigate to="/admin/dashboard" replace />
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      <ToastWatcher />
      <Routes>
        {/* public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* protected layout */}
        <Route
          element={
            <RequireAuth>
              <RequireNormalUser>
                <AppLayout />
              </RequireNormalUser>
            </RequireAuth>
          }
        >
          {/* All normal user routes here */}
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/upload" element={<Disclaimer />} />
          <Route path="/upload/age-consent" element={<AgeConsent />} />
          <Route path="/upload/blood-test" element={<BloodTestResult />} />
          <Route path="/upload/gender" element={<Gender />} />
          <Route path="/upload/gender-at-birth" element={<GenderAtBirth />} />

          <Route
            path="/upload/pregnancy-status"
            element={<PregnancyStatus />}
          />
          <Route
            path="/upload/menstruation-status"
            element={<MenstruationStatus />}
          />
          <Route path="/upload/reports-to-analyze" element={<Reports />} />
          <Route path="/upload/upload-reports" element={<UploadReports />} />
          <Route path="/upload/bowel-movements" element={<BowelMovements />} />

          <Route path="/upload/cbc1" element={<CBC1 />} />
          <Route path="/upload/cbc2" element={<CBC2 />} />
          <Route path="/upload/cbc3" element={<CBC3 />} />

          <Route path="/upload/cmb141" element={<CMB141 />} />
          <Route path="/upload/cmb142" element={<CMB142 />} />
          <Route path="/upload/cmb143" element={<CMB143 />} />

          <Route path="/upload/thyroid1" element={<Thyroid1 />} />
          <Route path="/upload/thyroid2" element={<Thyroid2 />} />

          <Route path="/upload/iron" element={<Iron />} />
          <Route path="/upload/lipid" element={<Lipid />} />
          <Route path="/upload/hemoglobin" element={<Hemoglobin />} />
          <Route path="/upload/magnesium" element={<Magnesium />} />
          <Route path="/upload/vitaminD" element={<VitaminD />} />
          <Route path="/upload/generate-report" element={<GenerateReport />} />

          <Route path="/reports" element={<ReportViewer />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* admin protected routes */}
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            </RequireAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="suppliments" element={<AdminSuppliments />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
