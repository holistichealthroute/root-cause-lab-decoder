import React, { useState } from "react";
import PregnantIcon from "../../assets/icons/PregnantIcon.svg";
import { useNavigate } from "react-router-dom";
import { useIntake } from "../../components/IntakeContext";

const PregnancyStatus: React.FC = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const { intakeData, setIntakeData } = useIntake();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIntakeData((prev) => ({
      ...prev,
      pregnantOrNursing: value === "yes",
    }));
    if (value === "yes") {
      navigate("/upload/bowel-movements", {
        state: {
          type: "warning",
          toastMessage:
            "If you are pregnant or nursing, this report is for educational awareness only. Do not make changes to food, lifestyle, or supplements without first talking with your licensed healthcare provider. Always get personalized guidance to make sure choices are safe for you and your baby.",
        },
      });
    } else {
      navigate("/upload/menstruation-status");
    }
  };

  return (
    <div className="grid gap-16">
      <section className="card text-align-center">
        {/* Icon */}
        <div className="mb-4 text-align-center">
          <img src={PregnantIcon} alt="Age Consent" className="icon-lg" />
        </div>
        {/* Title */}
        <h2 className="card-title">Preganancy Status</h2>

        {/* Question */}
        <p className="card-text text-align-center">
          Are you currently pregnant or nursing?
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
          </select>

          <button type="submit" className="btn btn-primary" disabled={!value}>
            Next
          </button>
        </form>
      </section>
    </div>
  );
};

export default PregnancyStatus;
