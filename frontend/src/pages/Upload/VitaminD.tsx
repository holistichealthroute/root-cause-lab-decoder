import React, { useState } from "react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIntake } from "../../components/IntakeContext";

const VITAMIN_D_FIELDS = [
  {
    label: "VitaminD",
    key: "25_Hydroxy_Vitamin_D",
    unitOptions: ["ng/mL", "nmol/L"],
  },
];

const VitaminD: React.FC = () => {
  const navigate = useNavigate();
  const { intakeData, setIntakeData, getNextReportPage } = useIntake();

  const vitaminD =
    intakeData &&
    typeof intakeData.vitaminD === "object" &&
    !Array.isArray(intakeData.vitaminD)
      ? (intakeData.vitaminD as {
          [key: string]: {
            value?: string | number | null;
            unit?: string | null;
          };
        })
      : {};

  const [formData, setFormData] = useState(() => {
    return VITAMIN_D_FIELDS.reduce((acc, field) => {
      const val = vitaminD[field.key]?.value;
      acc[field.label] = val != null && val !== "" ? String(val) : "0";
      return acc;
    }, {} as Record<string, string>);
  });

  const [units, setUnits] = useState(() => {
    return VITAMIN_D_FIELDS.reduce((acc, field) => {
      const unit = vitaminD[field.key]?.unit;
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
      vitaminD: {
        "25_Hydroxy_Vitamin_D": {
          value: formData.VitaminD,
          unit: units.VitaminD,
        },
      },
    }));
    const nextPage = getNextReportPage("vitaminD") ?? "/dashboard";
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
        <h2 className="cbc-title">Vitamin D</h2>

        {/* Subtitle */}
        <p className="cbc-subtext">
          Please enter your Vitamin D test result below.
        </p>

        {/* ✅ Form */}
        <form onSubmit={handleSubmit} className="cbc-form">
          <div className="cbc-row">
            <label className="cbc-label">25-Hydroxy Vitamin D</label>
            <div className="cbc-field-line">
              <input
                type="text"
                placeholder="Enter Value"
                className="cbc-input"
                value={formData.VitaminD}
                onChange={(e) => handleChange("VitaminD", e.target.value)}
              />
              <select
                value={units.VitaminD}
                onChange={(e) => handleUnitChange("VitaminD", e.target.value)}
                className="cbc-select"
              >
                <option value="ng/mL">ng/mL</option>
                <option value="nmol/L">nmol/L</option>
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

export default VitaminD;
