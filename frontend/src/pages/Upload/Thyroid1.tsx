import React, { useState } from "react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIntake } from "../../components/IntakeContext";

const THYROID_FIELDS = [
  { label: "TSH", key: "TSH", unitOptions: ["µIU/mL", "mIU/L"] },
  { label: "Free_T3", key: "Free_T3", unitOptions: ["pg/mL", "pmol/L"] },
  { label: "Free_T4", key: "Free_T4", unitOptions: ["ng/dL", "pmol/L"] },
  { label: "Reverse_T3", key: "Reverse_T3", unitOptions: ["ng/dL", "pmol/L"] },
  { label: "T3", key: "T3", unitOptions: ["ng/dL", "nmol/L"] },
];

const Thyroid1: React.FC = () => {
  const navigate = useNavigate();
  const { intakeData, setIntakeData, getNextReportPage } = useIntake();

  const thyroid =
    intakeData &&
    typeof intakeData.thyroid === "object" &&
    !Array.isArray(intakeData.thyroid)
      ? (intakeData.thyroid as {
          [key: string]: {
            value?: string | number | null;
            unit?: string | null;
          };
        })
      : {};

  const [formData, setFormData] = useState(() => {
    return THYROID_FIELDS.reduce((acc, field) => {
      const val = thyroid[field.key]?.value;
      acc[field.key] = val != null && val !== "" ? String(val) : "0";
      return acc;
    }, {} as Record<string, string>);
  });

  const [units, setUnits] = useState(() => {
    return THYROID_FIELDS.reduce((acc, field) => {
      const unit = thyroid[field.key]?.unit;
      acc[field.key] =
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
      thyroid: {
        TSH: { value: formData.TSH, unit: units.TSH },
        Free_T4: { value: formData.Free_T4, unit: units.Free_T4 },
        Free_T3: { value: formData.Free_T3, unit: units.Free_T3 },
        Reverse_T3: { value: formData.Reverse_T3, unit: units.Reverse_T3 },
        T3: { value: formData.T3, unit: units.T3 },
      },
    }));
    navigate("/upload/thyroid2");
  };

  return (
    <div className="grid gap-16">
      <section className="card text-align-center">
        {/* Icon */}
        <div className="mb-4 text-align-center">
          <FileText className="icon-lg" color="#4b5fd0" />
        </div>

        {/* Title */}
        <h2 className="cbc-title">Thyroid Panel</h2>

        {/* Subtitle */}
        <p className="cbc-subtext">
          Please enter your thyroid test results below.
        </p>

        {/* ✅ Form */}
        <form onSubmit={handleSubmit} className="cbc-form">
          {THYROID_FIELDS.map((test, index) => (
            <div className="cbc-row" key={index}>
              <label className="cbc-label">{test.label}</label>
              <div className="cbc-field-line">
                <input
                  type="text"
                  placeholder="Enter Value"
                  className="cbc-input"
                  value={formData[test.key as keyof typeof formData]}
                  onChange={(e) => handleChange(test.key, e.target.value)}
                />
                <select
                  value={units[test.key as keyof typeof units]}
                  onChange={(e) => handleUnitChange(test.key, e.target.value)}
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

export default Thyroid1;
