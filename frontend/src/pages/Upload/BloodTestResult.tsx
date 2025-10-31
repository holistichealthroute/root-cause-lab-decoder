import React, { useState } from "react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BloodTestResult: React.FC = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === "no") {
      toast.error(
        <>
          Ask your provider for the following blood panels:
          <br />
          1. CBC with Differential
          <br />
          2. CMP-14 (Comprehensive Metabolic Panel)
          <br />
          3. Ferritin + Iron + TIBC (Iron Panel)
          <br />
          4. HbA1c
          <br />
          5. Lipid Panel
          <br />
          6. Magnesium
          <br />
          7. Thyroid Profile II
          <br />
          8. Vitamin D 25-Hydroxy
          <br />
          9. Order on your own:
          <br />
          10. First, visit LabCorp to determine if there is a location close to
          you. (Tests cannot be ordered at the location). Order the Wellness
          Blueprint Panel.
        </>
      );
    } else {
      navigate("/upload/gender");
    }
  };

  return (
    <div className="grid gap-16">
      <section className="card text-align-center">
        {/* Icon */}

        <div className="mb-4 text-align-center">
          <FileText className="icon-lg" color="#4b5fd0" />
        </div>

        {/* Title */}
        <h2 className="card-title">Blood Test Results</h2>
        {/* Question */}
        <p className="card-text text-align-center">
          Do you have current bloodwork results (within 6 months)
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

export default BloodTestResult;
