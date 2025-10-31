import React, { useState } from "react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIntake } from "../../components/IntakeContext";

const CMB143: React.FC = () => {
  const navigate = useNavigate();
  const { intakeData, setIntakeData } = useIntake();
  const { getNextReportPage } = useIntake();
  const CMB143_FIELDS = [
    { label: "AST", key: "AST_SGOT", unitOptions: ["U/L"] },
    { label: "ALT", key: "ALT_SGPT", unitOptions: ["U/L"] },
    { label: "ALP", key: "Alkaline_Phosphatase", unitOptions: ["U/L"] },
    {
      label: "BilirubinTotal",
      key: "Total_Bilirubin",
      unitOptions: ["mg/dL", "µmol/L"],
    },
    {
      label: "BilirubinDirect",
      key: "Direct_Bilirubin",
      unitOptions: ["mg/dL", "µmol/L"],
    },
  ];

  const [formData, setFormData] = useState(() => {
    const cmb =
      intakeData &&
      typeof intakeData.cmb === "object" &&
      !Array.isArray(intakeData.cmb)
        ? (intakeData.cmb as {
            [key: string]: {
              value?: string | number | null;
              unit?: string | null;
            };
          })
        : {};
    return CMB143_FIELDS.reduce((acc, field) => {
      const val = cmb[field.key]?.value;
      acc[field.label] = val != null && val !== "" ? String(val) : "0";
      return acc;
    }, {} as Record<string, string>);
  });

  const [units, setUnits] = useState(() => {
    const cmb =
      intakeData &&
      typeof intakeData.cmb === "object" &&
      !Array.isArray(intakeData.cmb)
        ? (intakeData.cmb as {
            [key: string]: {
              value?: string | number | null;
              unit?: string | null;
            };
          })
        : {};
    return CMB143_FIELDS.reduce((acc, field) => {
      const unit = cmb[field.key]?.unit;
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
        AST_SGOT: { value: formData.AST, unit: units.AST },
        ALT_SGPT: { value: formData.ALT, unit: units.ALT },
        Alkaline_Phosphatase: { value: formData.ALP, unit: units.ALP },
        Total_Bilirubin: {
          value: formData.BilirubinTotal,
          unit: units.BilirubinTotal,
        },
        Direct_Bilirubin: {
          value: formData.BilirubinDirect,
          unit: units.BilirubinDirect,
        },
      },
    }));
    const nextPage = getNextReportPage("cmp") ?? "/dashboard";

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
        <h2 className="cbc-title">
          Comprehensive Metabolic Panel (CMP-14) - Part 3
        </h2>

        {/* Subtitle */}
        <p className="cbc-subtext">
          The Complete Blood Count with Differentials (CBC with Differentials)
          and Comprehensive Metabolic Panel (CMP-14) are required.. These other
          tests will be analyzed if provided:
        </p>

        {/* ✅ Form */}
        <form onSubmit={handleSubmit} className="cbc-form">
          {CMB143_FIELDS.map((test, index) => (
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

export default CMB143;
