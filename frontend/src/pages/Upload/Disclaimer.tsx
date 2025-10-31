import React from "react";
import { TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Disclaimer: React.FC = () => {
  const navigate = useNavigate();

  const onAccept = () => {
    navigate("/upload/age-consent");
  };

  const onDecline = () => {
    navigate("/dashboard", {
      state: {
        type: "error",
        toastMessage:
          "You must accept the disclaimer to use this tool. Without agreement, we cannot provide a report. Please consult your licensed medical professional for support.",
      },
    });
  };
  return (
    <div className="grid gap-16">
      <section className="card text-center">
        {/* Icon */}
        <div className="mb-4 text-align-center">
          <TriangleAlert className="icon-lg" stroke="black" fill="goldenrod" />
        </div>

        {/* Title */}
        <h2 className="card-title text-align-center ">Disclaimer</h2>

        {/* Text */}
        <p className="card-text">
          Before we start, please agree: This tool is educational only. It
          highlights lab patterns for awareness and provides guidance for
          general support. It does not diagnose, treat, or give medical advice.
          Always consult your healthcare provider for personal care.
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

        {/* Actions */}
        <div
          className="actions"
          style={{ justifyContent: "center", marginTop: "1rem" }}
        >
          <button className="btn btn-danger m2" onClick={onDecline}>
            Decline
          </button>
          <button className="btn btn-success m2" onClick={onAccept}>
            Accept
          </button>
        </div>
      </section>
    </div>
  );
};

export default Disclaimer;
