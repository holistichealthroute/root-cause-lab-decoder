import React, { useState } from "react";
import GenderIcon from "../../assets/icons/gender.svg";
import { useNavigate } from "react-router-dom";
import { useIntake } from "../../components/IntakeContext";

const GenderAtBirth: React.FC = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const { intakeData, setIntakeData } = useIntake();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIntakeData((prev) => ({ ...prev, gender: value }));
    navigate("/upload/bowel-movements");
  };

  return (
    <div className="grid gap-16">
      <section className="card text-align-center">
        {/* Icon */}

        <div className="mb-4 text-align-center">
          <img src={GenderIcon} alt="Age Consent" className="icon-lg" />
        </div>
        {/* Title */}
        <h2 className="card-title">Gender at Birth</h2>
        {/* Question */}
        <p className="card-text text-align-center">
          What’ was your Gender at birth?
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
            <option value="female">Female at birth</option>
            <option value="male">Male at birth</option>
          </select>

          <button type="submit" className="btn btn-primary" disabled={!value}>
            Next
          </button>
        </form>
      </section>
    </div>
  );
};

export default GenderAtBirth;
