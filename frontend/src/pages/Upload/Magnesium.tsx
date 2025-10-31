import React, { useState } from "react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIntake } from "../../components/IntakeContext";

const MAGNESIUM_FIELDS = [
  { label: "Magnesium", unitOptions: ["mg/dL", "mmol/L"] },
];

const Magnesium: React.FC = () => {
  const navigate = useNavigate();
  const { intakeData, setIntakeData, getNextReportPage } = useIntake();

  const magnesium =
    intakeData &&
    typeof intakeData.magnesium === "object" &&
    !Array.isArray(intakeData.magnesium)
      ? (intakeData.magnesium as {
          [key: string]: {
            value?: string | number | null;
            unit?: string | null;
          };
        })
      : {};

  const [formData, setFormData] = useState(() => {
    return MAGNESIUM_FIELDS.reduce((acc, field) => {
      const val = magnesium[field.label]?.value;
      acc[field.label] = val != null && val !== "" ? String(val) : "0";
      return acc;
    }, {} as Record<string, string>);
  });

  const [units, setUnits] = useState(() => {
    return MAGNESIUM_FIELDS.reduce((acc, field) => {
      const unit = magnesium[field.label]?.unit;
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
      magnesium: {
        Magnesium: { value: formData.Magnesium, unit: units.Magnesium },
      },
    }));
    const nextPage = getNextReportPage("magnesium") ?? "/dashboard";
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
        <h2 className="cbc-title">Magnesium Panel</h2>

        {/* Subtitle */}
        <p className="cbc-subtext">
          Please enter your magnesium test result below.
        </p>

        {/* ✅ Form */}
        <form onSubmit={handleSubmit} className="cbc-form">
          <div className="cbc-row">
            <label className="cbc-label">Magnesium</label>
            <div className="cbc-field-line">
              <input
                type="text"
                placeholder="Enter Value"
                className="cbc-input"
                value={formData.Magnesium}
                onChange={(e) => handleChange("Magnesium", e.target.value)}
              />
              <select
                value={units.Magnesium}
                onChange={(e) => handleUnitChange("Magnesium", e.target.value)}
                className="cbc-select"
              >
                <option value="mg/dL">mg/dL</option>
                <option value="mmol/L">mmol/L</option>
              </select>
            </div>
          </div>

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

export default Magnesium;
