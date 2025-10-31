import React, { useState } from "react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIntake } from "../../components/IntakeContext";

interface CBC1Props {
  setIntakeData: (fn: (prev: any) => any) => void;
}

const CBC1: React.FC = () => {
  const navigate = useNavigate();
  const { intakeData, setIntakeData } = useIntake();
  const initialFields = [
    { label: "MCHC", unitOptions: ["g/dL"] },
    { label: "RDW", unitOptions: ["%"] },
    { label: "Platelets", unitOptions: ["x10³/μL"] },
    { label: "Neutrophils", unitOptions: ["%"] },
    { label: "Lymphocytes", unitOptions: ["%"] },
    { label: "WBC", unitOptions: ["x10³/µL", "x10³/L"] },
    { label: "Hemoglobin (HGB)", unitOptions: ["g/dL", "g/L"] },
    { label: "Hematocrit (HCT)", unitOptions: ["%", "fraction (0–1)"] },
    { label: "MCV", unitOptions: ["fL"] },
    { label: "MCH", unitOptions: ["pg"] },
  ];

  const [cbcData, setCbcData] = useState(() => {
    const intakeCbc =
      intakeData &&
      typeof intakeData.cbc === "object" &&
      !Array.isArray(intakeData.cbc)
        ? (intakeData.cbc as Record<
            string,
            { value?: string | number; unit?: string }
          >)
        : ({} as Record<string, { value?: string | number; unit?: string }>);
    return initialFields.reduce((acc, field) => {
      const fieldData =
        intakeCbc[field.label] && typeof intakeCbc[field.label] === "object"
          ? intakeCbc[field.label]
          : {};
      acc[field.label] = {
        value: fieldData.value != null ? String(fieldData.value) : "0",
        unit: fieldData.unit != null ? fieldData.unit : field.unitOptions[0],
      };
      return acc;
    }, {} as Record<string, { value: string; unit: string }>);
  });

  const handleChange = (field: string, value: string) => {
    setCbcData((prev) => ({
      ...prev,
      [field]: { ...prev[field], value },
    }));
  };

  const handleUnitChange = (field: string, unit: string) => {
    setCbcData((prev) => ({
      ...prev,
      [field]: { ...prev[field], unit },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add cbcData to intake data
    setIntakeData((prev: any) => ({
      ...prev,
      cbc: cbcData,
    }));
    navigate("/upload/cbc2");
  };

  return (
    <div className="grid gap-16">
      <section className="card text-align-center">
        {/* Icon */}
        <div className="mb-4 text-align-center">
          <FileText className="icon-lg" color="#4b5fd0" />
        </div>

        {/* Title */}
        <h2 className="cbc-title">
          The Complete Blood Count with Differentials (CBC with Differentials)
        </h2>

        {/* Subtitle */}
        <p className="cbc-subtext">
          The Complete Blood Count with Differentials (CBC with Differentials)
          and Comprehensive Metabolic Panel (CMP-14) are required.. These other
          tests will be analyzed if provided:
        </p>

        {/* ✅ Form */}
        <form onSubmit={handleSubmit} className="cbc-form">
          {initialFields.map((test, index) => (
            <div className="cbc-row" key={index}>
              <label className="cbc-label">{test.label}</label>
              <div className="cbc-field-line">
                <input
                  type="text"
                  placeholder="Enter Range"
                  className="cbc-input"
                  value={cbcData[test.label].value}
                  onChange={(e) => handleChange(test.label, e.target.value)}
                />
                <select
                  value={cbcData[test.label].unit}
                  onChange={(e) => handleUnitChange(test.label, e.target.value)}
                  className="cbc-select"
                >
                  {test.unitOptions.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <div className="button-row">
            <button type="submit" className="btn btn-primary float-right">
              Next
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default CBC1;
