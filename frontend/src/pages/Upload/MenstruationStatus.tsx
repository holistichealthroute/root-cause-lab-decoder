import React, { useState } from "react";
import FloIcon from "../../assets/icons/FloIcon.svg";
import { useNavigate } from "react-router-dom";
import { useIntake } from "../../components/IntakeContext";

const MenstruationStatus: React.FC = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const { intakeData, setIntakeData } = useIntake();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIntakeData((prev) => ({
      ...prev,
      menstruationStatus: value,
    }));
    navigate("/upload/bowel-movements");
  };

  return (
    <div className="grid gap-16">
      <section className="card text-align-center">
        {/* Icon */}
        <div className="mb-4 text-align-center">
          <img src={FloIcon} alt="Age Consent" className="icon-lg" />
        </div>
        {/* Title */}
        <h2 className="card-title">Menstruation Status</h2>

        {/* Question */}
        <p className="card-text text-align-center">
          Are you currently menstruating or post-menstruation?
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
            <option value="yes">Currently menstruating</option>
            <option value="no">Post-menstruation</option>
          </select>

          <button type="submit" className="btn btn-primary" disabled={!value}>
            Next
          </button>
        </form>
      </section>
    </div>
  );
};

export default MenstruationStatus;
