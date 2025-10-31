import React, { useState } from "react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIntake } from "../../components/IntakeContext";

const CBC3: React.FC = () => {
  const navigate = useNavigate();
  const { intakeData, setIntakeData } = useIntake();

  const CBC3_FIELDS = [
    { label: "Monocytes", unitOptions: ["%", "Absolute (x10³/μL)"] },
    { label: "Eosinophils", unitOptions: ["%", "Absolute (x10³/μL)"] },
    { label: "Basophils", unitOptions: ["%", "Absolute (x10³/μL)"] },
    // Add more CBC3 fields as needed
  ];

  const [formData, setFormData] = useState(() => {
    const cbc =
      intakeData &&
      typeof intakeData.cbc === "object" &&
      !Array.isArray(intakeData.cbc)
        ? (intakeData.cbc as {
            [key: string]: {
              value?: string | number | null;
              unit?: string | null;
            };
          })
        : {};
    return CBC3_FIELDS.reduce((acc, field) => {
      const val = cbc[field.label]?.value;
      acc[field.label] = val != null && val !== "" ? String(val) : "0"; // <-- set to "0" if null/undefined
      return acc;
    }, {} as Record<string, string>);
  });

  const [units, setUnits] = useState(() => {
    const cbc =
      intakeData &&
      typeof intakeData.cbc === "object" &&
      !Array.isArray(intakeData.cbc)
        ? (intakeData.cbc as {
            [key: string]: {
              value?: string | number | null;
              unit?: string | null;
            };
          })
        : {};
    return CBC3_FIELDS.reduce((acc, field) => {
      const unit = cbc[field.label]?.unit;
      acc[field.label] =
        typeof unit === "string" && unit !== "" ? unit : field.unitOptions[0];
      return acc;
    }, {} as Record<string, string>);
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleUnitChange = (field: string, value: string) => {
    setUnits({ ...units, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIntakeData((prev: any) => ({
      ...prev,
      cbc: {
        ...(prev.cbc || {}),
        Monocytes: { value: formData.Monocytes, unit: units.Monocytes },
        Eosinophils: { value: formData.Eosinophils, unit: units.Eosinophils },
        Basophils: { value: formData.Basophils, unit: units.Basophils },
        // Add more CBC3 fields here as needed
      },
    }));
    navigate("/upload/cmb141");
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
          {CBC3_FIELDS.map((test, index) => (
            <div className="cbc-row" key={index}>
              <label className="cbc-label">{test.label}</label>
              <div className="cbc-field-line">
                <input
                  type="text"
                  placeholder="Enter Range"
                  className="cbc-input"
                  value={formData[test.label as keyof typeof formData]}
                  onChange={(e) => handleChange(test.label, e.target.value)}
                />
                <select
                  value={units[test.label as keyof typeof units]}
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

export default CBC3;
