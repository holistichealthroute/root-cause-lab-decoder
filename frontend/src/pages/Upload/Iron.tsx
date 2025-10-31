import React, { useState } from "react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIntake } from "../../components/IntakeContext";

const IRON_FIELDS = [
  { label: "Ferritin", unitOptions: ["ng/mL", "µg/L"] },
  { label: "Iron", unitOptions: ["U/L"] },
  { label: "TIBC", unitOptions: ["µg/dL", "µmol/L"] },
];

const Iron: React.FC = () => {
  const navigate = useNavigate();
  const { intakeData, setIntakeData, getNextReportPage } = useIntake();

  const [formData, setFormData] = useState(() => {
    const iron =
      intakeData &&
      typeof intakeData.iron === "object" &&
      !Array.isArray(intakeData.iron)
        ? (intakeData.iron as {
            [key: string]: {
              value?: string | number | null;
              unit?: string | null;
            };
          })
        : {};
    return IRON_FIELDS.reduce((acc, field) => {
      const val = iron[field.label]?.value;
      acc[field.label] = val != null && val !== "" ? String(val) : "0";
      return acc;
    }, {} as Record<string, string>);
  });

  const [units, setUnits] = useState(() => {
    const iron =
      intakeData &&
      typeof intakeData.iron === "object" &&
      !Array.isArray(intakeData.iron)
        ? (intakeData.iron as {
            [key: string]: {
              value?: string | number | null;
              unit?: string | null;
            };
          })
        : {};
    return IRON_FIELDS.reduce((acc, field) => {
      const unit = iron[field.label]?.unit;
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
      iron: {
        Ferritin: { value: formData.Ferritin, unit: units.Ferritin },
        Iron: { value: formData.Iron, unit: units.Iron },
        TIBC: { value: formData.TIBC, unit: units.TIBC },
      },
    }));
    const nextPage = getNextReportPage("ironPanel") ?? "/dashboard";
    navigate(nextPage);
  };

  return (
    <div className="grid gap-16">
      <section className="card text-align-center">
        {/* Icon */}
        <div className="mb-4 text-align-center">
          <FileText className="icon-lg" color="#4b5fd0" />
        </div>

        {/* Title */}
        <h2 className="cbc-title">Iron Panel</h2>

        {/* Subtitle */}
        <p className="cbc-subtext">
          The Complete Blood Count with Differentials (CBC with Differentials)
          and Comprehensive Metabolic Panel (CMP-14) are required.. These other
          tests will be analyzed if provided:
        </p>

        {/* ✅ Form */}
        <form onSubmit={handleSubmit} className="cbc-form">
          {IRON_FIELDS.map((test, index) => (
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

export default Iron;
