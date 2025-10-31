import React, { useState } from "react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIntake } from "../../components/IntakeContext";

const LIPID_FIELDS = [
  {
    label: "TotalCholesterol",
    key: "Total_Cholesterol",
    unitOptions: ["mg/dL", "mmol/L"],
  },
  { label: "HDL", key: "HDL", unitOptions: ["mg/dL", "mmol/L"] },
  { label: "LDL", key: "LDL", unitOptions: ["mg/dL", "mmol/L"] },
  {
    label: "Triglycerides",
    key: "Triglycerides",
    unitOptions: ["mg/dL", "mmol/L"],
  },
];

const Lipid: React.FC = () => {
  const navigate = useNavigate();
  const { intakeData, setIntakeData, getNextReportPage } = useIntake();

  const [formData, setFormData] = useState(() => {
    const lipid =
      intakeData &&
      typeof intakeData.lipid === "object" &&
      !Array.isArray(intakeData.lipid)
        ? (intakeData.lipid as {
            [key: string]: {
              value?: string | number | null;
              unit?: string | null;
            };
          })
        : {};
    return LIPID_FIELDS.reduce((acc, field) => {
      const val = lipid[field.key]?.value;
      acc[field.label] = val != null && val !== "" ? String(val) : "0";
      return acc;
    }, {} as Record<string, string>);
  });

  const [units, setUnits] = useState(() => {
    const lipid =
      intakeData &&
      typeof intakeData.lipid === "object" &&
      !Array.isArray(intakeData.lipid)
        ? (intakeData.lipid as {
            [key: string]: {
              value?: string | number | null;
              unit?: string | null;
            };
          })
        : {};
    return LIPID_FIELDS.reduce((acc, field) => {
      const unit = lipid[field.key]?.unit;
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
      lipid: {
        Total_Cholesterol: {
          value: formData.TotalCholesterol,
          unit: units.TotalCholesterol,
        },
        HDL: { value: formData.HDL, unit: units.HDL },
        LDL: { value: formData.LDL, unit: units.LDL },
        Triglycerides: {
          value: formData.Triglycerides,
          unit: units.Triglycerides,
        },
      },
    }));
    const nextPage = getNextReportPage("lipidPanel") ?? "/dashboard";
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
        <h2 className="cbc-title">Lipid Panel</h2>

        {/* Subtitle */}
        <p className="cbc-subtext">
          The Complete Blood Count with Differentials (CBC with Differentials)
          and Comprehensive Metabolic Panel (CMP-14) are required.. These other
          tests will be analyzed if provided:
        </p>

        {/* ✅ Form */}
        <form onSubmit={handleSubmit} className="cbc-form">
          {LIPID_FIELDS.map((test, index) => (
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

export default Lipid;
