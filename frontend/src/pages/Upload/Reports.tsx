import React, { useState } from "react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIntake } from "../../components/IntakeContext";

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { intakeData, setIntakeData } = useIntake();

  // 🔹 reports with keys and required flags
  const reports = [
    {
      key: "cbc",
      label: "Complete Blood Count with Differentials (CBC with Differentials)",
      required: true,
    },
    {
      key: "cmp",
      label: "Comprehensive Metabolic Panel (CMP-14)",
      required: true,
    },
    {
      key: "ironPanel",
      label:
        "Iron Panel - Ferritin + Iron + Total Iron-binding Capacity (TIBC)",
    },
    { key: "hba1c", label: "Hemoglobin A1c (HbA1c)" },
    { key: "lipidPanel", label: "Lipid Panel" },
    { key: "magnesium", label: "Magnesium" },
    { key: "thyroid", label: "Thyroid Profile II" },
    { key: "vitaminD", label: "Vitamin D, 25-Hydroxy" },
  ];

  // pre-select required ones
  const [selectedReports, setSelectedReports] = useState<string[]>(
    reports.filter((r) => r.required).map((r) => r.key)
  );

  const handleCheckboxChange = (key: string, required?: boolean) => {
    if (required) return; // 🔒 required cannot be toggled
    setSelectedReports((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIntakeData((prev) => ({ ...prev, selectedReports }));
    navigate("/upload/upload-reports");
  };

  return (
    <div className="grid gap-16">
      <section className="card text-align-center">
        <div className="mb-4 text-align-center">
          <FileText className="icon-lg" color="#4b5fd0" />
        </div>

        <h2 className="card-title">Which Reports do you want to analyze?</h2>

        <p className="card-text text-align-center">
          The first two reports are required; others are optional.
        </p>

        <form onSubmit={handleSubmit} className="report-form mt-4">
          <div className="checkbox-group">
            {reports.map((r) => (
              <label key={r.key} className="checkbox-label">
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={selectedReports.includes(r.key)}
                  onChange={() => handleCheckboxChange(r.key, r.required)}
                  disabled={r.required}
                />
                <span className="checkbox-text">
                  {r.label}
                  {r.required && <span style={{ color: "red" }}> *</span>}
                </span>
              </label>
            ))}
          </div>

          <button type="submit" className="btn btn-primary float-right">
            Next
          </button>
        </form>
      </section>
    </div>
  );
};

export default Reports;
