import React, { useState } from "react";
import AgeIcon from "../../assets/icons/age.png";
import { useNavigate } from "react-router-dom";

const AgeConsent: React.FC = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === "yes") navigate("/upload/blood-test");
    else {
      navigate("/dashboard", {
        state: {
          type: "error",
          toastMessage:
            "This report is designed for adults 18 and older. If this report is for a child, please consult directly with your licensed medical professional for personalized guidance",
        },
      });
    }
  };

  return (
    <div className="grid gap-16">
      <section className="card text-align-center">
        {/* Icon */}
        <div className="mb-4 text-align-center">
          <img src={AgeIcon} alt="Age Consent" className="icon-lg" />
        </div>
        {/* Title */}
        <h2 className="card-title">Age Consent</h2>

        {/* Question */}
        <p className="card-text text-align-center">
          Is this report for a person over the age of 18?
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="form-inline mt-4">
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="form-select"
            required
          >
            <option value="">Select</option>
            <option value="yes">Yes, over 18</option>
            <option value="no">No, under 18</option>
          </select>

          <button type="submit" className="btn btn-primary" disabled={!value}>
            Next
          </button>
        </form>
      </section>
    </div>
  );
};

export default AgeConsent;
