import React, { useState } from "react";
import ZigZagIcon from "../../assets/icons/ZigZagIcon.svg";
import { useNavigate } from "react-router-dom";
import { useIntake } from "../../components/IntakeContext";
const BowelMovements: React.FC = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const { intakeData, setIntakeData } = useIntake();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIntakeData((prev) => ({ ...prev, bowelMovement: value }));
    navigate("/upload/reports-to-analyze");
  };

  return (
    <div className="grid gap-16">
      <section className="card text-align-center">
        {/* Icon */}
        <div className="mb-4 text-align-center">
          <img src={ZigZagIcon} alt="Age Consent" className="icon-lg" />
        </div>
        {/* Title */}
        <h2 className="card-title">Bowel Movements</h2>

        {/* Question */}
        <p className="card-text text-align-center">
          Are you having daily bowel movements that are easy to eliminate?
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
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="sometimes">Sometimes</option>
          </select>

          <button type="submit" className="btn btn-primary" disabled={!value}>
            Next
          </button>
        </form>
      </section>
    </div>
  );
};

export default BowelMovements;
