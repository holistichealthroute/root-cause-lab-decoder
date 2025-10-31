import React, { useState } from "react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIntake } from "../../components/IntakeContext";

const CMP_FIELDS = [
  { label: "Glucose", unitOptions: ["mg/dL", "mg/L"] },
  { label: "Calcium", unitOptions: ["g/dL", "mmol/L"] },
  { label: "Sodium", unitOptions: ["mmol/L", "mEq/L"] },
  { label: "Potassium", unitOptions: ["mmol/L", "mEq/L"] },
  { label: "Chloride", unitOptions: ["mmol/L", "mEq/L"] },
];

const CMB141: React.FC = () => {
  const navigate = useNavigate();
  const { intakeData, setIntakeData } = useIntake();

  const [formData, setFormData] = useState(() => {
    const cmb =
      intakeData &&
      typeof intakeData.cmb === "object" &&
      !Array.isArray(intakeData.cmb)
        ? (intakeData.cmb as {
            [key: string]: { value?: string | number; unit?: string };
          })
        : {};
    return CMP_FIELDS.reduce((acc, field) => {
      acc[field.label] =
        cmb[field.label]?.value != null && cmb[field.label]?.value !== ""
          ? String(cmb[field.label].value)
          : "0";
      return acc;
    }, {} as Record<string, string>);
  });

  const [units, setUnits] = useState(() => {
    const cmb =
      intakeData &&
      typeof intakeData.cmb === "object" &&
      !Array.isArray(intakeData.cmb)
        ? (intakeData.cmb as {
            [key: string]: { value?: string | number; unit?: string };
          })
        : {};
    return CMP_FIELDS.reduce((acc, field) => {
      const unit = cmb[field.label]?.unit;
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
      cmb: {
        ...(prev.cmb || {}),
        Glucose: { value: formData.Glucose, unit: units.Glucose },
        Calcium: { value: formData.Calcium, unit: units.Calcium },
        Sodium: { value: formData.Sodium, unit: units.Sodium },
        Potassium: { value: formData.Potassium, unit: units.Potassium },
        Chloride: { value: formData.Chloride, unit: units.Chloride },
      },
    }));

    navigate("/upload/cmb142");
  };

  return (
    <div className="grid gap-16">
      <section className="card text-align-center">
        {/* Icon */}
        <div className="mb-4 text-align-center">
          <FileText className="icon-lg" color="#4b5fd0" />
        </div>

        {/* Title */}
        <h2 className="cbc-title">Comprehensive Metabolic Panel (CMP-14)</h2>

        {/* Subtitle */}
        <p className="cbc-subtext">
          The Complete Blood Count with Differentials (CBC with Differentials)
          and Comprehensive Metabolic Panel (CMP-14) are required.. These other
          tests will be analyzed if provided:
        </p>

        {/* ✅ Form */}
        <form onSubmit={handleSubmit} className="cbc-form">
          {CMP_FIELDS.map((test, index) => (
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

export default CMB141;
