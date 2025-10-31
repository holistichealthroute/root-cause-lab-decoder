import React from "react";
import { config } from "../utils/config";
import { Upload } from "lucide-react";
import { Link } from "react-router-dom";
import UploadIcon from "../assets/icons/upload.svg";
import { useAuth } from "../auth/AuthContext";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="grid gap-16">
      <section className="card">
        <h2 className="card-title ">Welcome {user?.name || "User"} 👋</h2>
        <p className="card-text">
          This tool is educational only. It highlights lab patterns for
          awareness and provides guidance for general support. It does not
          diagnose, treat, or give medical advice. Always consult your
          healthcare provider for personal care. This tool is not for urgent or
          emergency use. If you have severe, worsening, or concerning symptoms,
          call your provider or emergency services immediately.
        </p>
        <p className="card-text">
          Some labs may use different measurement units than what we reference
          here. If that happens, the ranges in this report may not match
          perfectly. Always compare your results with the units on your lab
          report and check with your licensed provider if you have questions.
        </p>
        <p className="card-text">
          This tool is not for urgent or emergency use. If you have severe,
          worsening, or concerning symptoms, call your provider or emergency
          services immediately.
        </p>
      </section>

      {/* Getting Started card */}
      <section className="card small">
        <h3 className="card-subtitle">Getting Started</h3>
        <div className="actions">
          <Link to="/upload" className="btn btn-primary">
            <img src={UploadIcon} alt="Upload" />
            Upload Test Results
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
