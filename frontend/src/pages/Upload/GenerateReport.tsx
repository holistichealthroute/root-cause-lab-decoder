import React, { useState } from "react";
import { Upload } from "lucide-react";
import PDFIcon from "../../assets/icons/PDFIcon.png";
import CameraIcon from "../../assets/icons/CameraIcon.svg";
import EditIcon from "../../assets/icons/EditIcon.svg";
import { useNavigate } from "react-router-dom";
import { useIntake } from "../../components/IntakeContext";
import { post, fetchBlob } from "../../api/HttpService";
import { useAuth } from "../../auth/AuthContext";

const GenerateReport: React.FC = () => {
  const navigate = useNavigate();
  const { intakeData, setIntakeData } = useIntake();
  const [value, setValue] = useState("");
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };
  const OnManualEntry = () => {
    navigate("/cbc1");
  };
  function normalizePayload(payload: any) {
    return {
      ...payload,
      age_over_18: payload.age_over_18 ?? false,
      bloodwork_within_6_months: payload.bloodwork_within_6_months ?? false,
      gender: payload.gender ?? "",
      gender_at_birth: payload.gender_at_birth ?? "",
      pregnant_or_nursing: payload.pregnant_or_nursing ?? false,
      menstruation_status: payload.menstruation_status ?? "",
      bowel_movements: payload.bowel_movements ?? "",
      lab_upload_option: payload.lab_upload_option ?? "",
      lab_reports: Object.fromEntries(
        Object.entries(payload.lab_reports ?? {}).map(([k, v]) => [
          k,
          normalizeLabReport(v),
        ])
      ),
    };
  }

  function normalizeLabReport(report: any) {
    if (!report) return {};
    const normalized: any = {};
    Object.entries(report).forEach(([key, val]) => {
      if (val && typeof val === "object" && "value" in val && "unit" in val) {
        let value = 0;
        if (typeof val.value === "string" || typeof val.value === "number") {
          if (
            val.value !== "" &&
            val.value != null &&
            !isNaN(Number(val.value))
          ) {
            value = parseFloat(val.value as string);
          }
        }
        normalized[key] = {
          value,
          unit: typeof val.unit === "string" ? val.unit : "",
        };
      } else if (val && typeof val === "object") {
        normalized[key] = normalizeLabReport(val);
      } else {
        normalized[key] = val;
      }
    });
    return normalized;
  }

  function normalizeLabUnits(payload: any) {
    // CBC conversions
    if (payload.lab_reports?.CBC_with_Differential) {
      const cbc = payload.lab_reports.CBC_with_Differential;

      // WBC: x10⁹/L → x10³/µL
      if (cbc.WBC?.unit === "x10⁹/L") {
        cbc.WBC.value = cbc.WBC.value;
        cbc.WBC.unit = "x10³/µL";
      }

      // RBC: x10¹²/L → x10⁶/µL
      if (cbc.RBC?.unit === "x10¹²/L") {
        cbc.RBC.value = cbc.RBC.value;
        cbc.RBC.unit = "x10⁶/µL";
      }

      // Hemoglobin: g/L → g/dL
      if (cbc.Hemoglobin?.unit === "g/L") {
        cbc.Hemoglobin.value = cbc.Hemoglobin.value / 10;
        cbc.Hemoglobin.unit = "g/dL";
      }

      // Hematocrit: fraction (0–1) → %
      if (cbc.Hematocrit?.unit === "fraction (0–1)") {
        cbc.Hematocrit.value = cbc.Hematocrit.value * 100;
        cbc.Hematocrit.unit = "%";
      }

      // MCHC: g/L → g/dL
      if (cbc.MCHC?.unit === "g/L") {
        cbc.MCHC.value = cbc.MCHC.value / 10;
        cbc.MCHC.unit = "g/dL";
      }

      // RDW: ratio → %
      if (cbc.RDW?.unit === "ratio") {
        cbc.RDW.value = cbc.RDW.value * 100;
        cbc.RDW.unit = "%";
      }

      // Platelets: x10⁹/L → x10³/µL
      if (cbc.Platelets?.unit === "x10⁹/L") {
        cbc.Platelets.value = cbc.Platelets.value;
        cbc.Platelets.unit = "x10³/µL";
      }

      // Differential: Absolute (x10³/µL) → %
      const wbcValue = cbc.WBC?.value;
      [
        "Neutrophils",
        "Lymphocytes",
        "Monocytes",
        "Eosinophils",
        "Basophils",
      ].forEach((marker) => {
        if (cbc[marker]?.unit === "Absolute (x10³/µL)" && wbcValue) {
          cbc[marker].value = (cbc[marker].value / wbcValue) * 100;
          cbc[marker].unit = "%";
        }
      });
    }

    // CMP conversions
    if (payload.lab_reports?.CMP_14) {
      const cmp = payload.lab_reports.CMP_14;

      // Glucose: mmol/L → mg/dL
      if (cmp.Glucose?.unit === "mmol/L") {
        cmp.Glucose.value = cmp.Glucose.value * 18.0;
        cmp.Glucose.unit = "mg/dL";
      }

      // Calcium: mmol/L → mg/dL
      if (cmp.Calcium?.unit === "mmol/L") {
        cmp.Calcium.value = cmp.Calcium.value * 4.006;
        cmp.Calcium.unit = "mg/dL";
      }

      // Sodium, Potassium, Chloride, CO2: mEq/L → mmol/L
      ["Sodium", "Potassium", "Chloride", "CO2"].forEach((marker) => {
        if (cmp[marker]?.unit === "mEq/L") {
          cmp[marker].unit = "mmol/L";
        }
      });

      // BUN: mmol/L → mg/dL
      if (cmp.BUN?.unit === "mmol/L") {
        cmp.BUN.value = cmp.BUN.value;
        cmp.BUN.unit = "mg/dL";
      }

      // Creatinine: µmol/L → mg/dL
      if (cmp.Creatinine?.unit === "µmol/L") {
        cmp.Creatinine.value = cmp.Creatinine.value / 88.4;
        cmp.Creatinine.unit = "mg/dL";
      }

      // Bilirubin: µmol/L → mg/dL
      if (cmp.Total_Bilirubin?.unit === "µmol/L") {
        cmp.Total_Bilirubin.value = cmp.Total_Bilirubin.value / 17.104;
        cmp.Total_Bilirubin.unit = "mg/dL";
      }
    }

    // Magnesium: mmol/L → mg/dL
    if (payload.lab_reports?.Magnesium?.Magnesium?.unit === "mmol/L") {
      const mag = payload.lab_reports.Magnesium.Magnesium;
      mag.value = mag.value * 2.43;
      mag.unit = "mg/dL";
    }

    // Iron Panel conversions
    if (payload.lab_reports?.Iron_Panel) {
      const iron = payload.lab_reports.Iron_Panel;

      // Iron: µmol/L → µg/dL
      if (iron.Iron?.unit === "µmol/L") {
        iron.Iron.value = iron.Iron.value * 5.585;
        iron.Iron.unit = "µg/dL";
      }

      // TIBC: µmol/L → µg/dL
      if (iron.TIBC?.unit === "µmol/L") {
        iron.TIBC.value = iron.TIBC.value * 5.585;
        iron.TIBC.unit = "µg/dL";
      }

      // Ferritin: µg/L → ng/mL
      if (iron.Ferritin?.unit === "µg/L") {
        iron.Ferritin.unit = "ng/mL";
      }
      if (iron?.Transferrin_Saturation?.unit === "ratio") {
        iron.Transferrin_Saturation.value =
          iron.Transferrin_Saturation.value * 100;
        iron.Transferrin_Saturation.unit = "%";
      }
    }

    // HbA1c: mmol/mol (IFCC) → % (NGSP)
    if (
      payload.lab_reports?.HbA1c?.Hemoglobin_A1c?.unit === "mmol/mol (IFCC)"
    ) {
      const hba1c = payload.lab_reports.HbA1c.Hemoglobin_A1c;
      hba1c.value = hba1c.value * 0.09148 + 2.15;
      hba1c.unit = "% (NGSP)";
    }

    // Lipid Panel conversions
    if (payload.lab_reports?.Lipid_Panel) {
      const lipid = payload.lab_reports.Lipid_Panel;

      // Total Cholesterol, HDL, LDL: mmol/L → mg/dL
      ["Total_Cholesterol", "HDL", "LDL"].forEach((marker) => {
        if (lipid[marker]?.unit === "mmol/L") {
          lipid[marker].value = lipid[marker].value * 38.67;
          lipid[marker].unit = "mg/dL";
        }
      });

      // Triglycerides: mmol/L → mg/dL
      if (lipid.Triglycerides?.unit === "mmol/L") {
        lipid.Triglycerides.value = lipid.Triglycerides.value * 88.57;
        lipid.Triglycerides.unit = "mg/dL";
      }
    }

    // Thyroid conversions
    if (payload.lab_reports?.Thyroid_Profile_II) {
      const thyroid = payload.lab_reports.Thyroid_Profile_II;

      // TSH: mIU/L → µIU/mL
      if (thyroid.TSH?.unit === "mIU/L") {
        thyroid.TSH.unit = "µIU/mL";
      }

      // Free T4: pmol/L → ng/dL
      if (thyroid.Free_T4?.unit === "pmol/L") {
        thyroid.Free_T4.value = thyroid.Free_T4.value / 12.87;
        thyroid.Free_T4.unit = "ng/dL";
      }

      // Free T3: pmol/L → pg/mL
      if (thyroid.Free_T3?.unit === "pmol/L") {
        thyroid.Free_T3.value = thyroid.Free_T3.value / 1.536;
        thyroid.Free_T3.unit = "pg/mL";
      }

      // Total T4: nmol/L → µg/dL
      if (thyroid.T4?.unit === "nmol/L") {
        thyroid.T4.value = thyroid.T4.value / 12.87;
        thyroid.T4.unit = "µg/dL";
      }

      // Total T3: nmol/L → ng/dL
      if (thyroid.T3?.unit === "nmol/L") {
        thyroid.T3.value = thyroid.T3.value / 0.0154;
        thyroid.T3.unit = "ng/dL";
      }

      // Reverse T3: pg/mL → ng/dL
      if (thyroid.Reverse_T3?.unit === "pg/mL") {
        thyroid.Reverse_T3.value = thyroid.Reverse_T3.value / 10;
        thyroid.Reverse_T3.unit = "ng/dL";
      }

      // Anti_TPO: IU/L → IU/mL
      if (thyroid.Anti_TPO?.unit === "IU/L") {
        thyroid.Anti_TPO.value = thyroid.Anti_TPO.value / 1000;
        thyroid.Anti_TPO.unit = "IU/mL";
      }
    }

    // Vitamin D: nmol/L → ng/mL
    if (
      payload.lab_reports?.Vitamin_D_25_Hydroxy?.["25_Hydroxy_Vitamin_D"]
        ?.unit === "nmol/L"
    ) {
      const vitD =
        payload.lab_reports.Vitamin_D_25_Hydroxy["25_Hydroxy_Vitamin_D"];
      vitD.value = vitD.value / 2.5;
      vitD.unit = "ng/mL";
    }

    return payload;
  }

  const handleGenerateReport = async () => {
    setLoading(true);
    const userId = user?.id;
    var payload = {
      user_id: userId,
      age_over_18: true,
      bloodwork_within_6_months: true,
      gender: intakeData.gender,
      gender_at_birth: intakeData.gender,
      pregnant_or_nursing: intakeData.pregnantOrNursing,
      menstruation_status: intakeData.menstruationStatus,
      bowel_movements: intakeData.bowelMovement,
      lab_upload_option: "manual",
      lab_reports: {
        CBC_with_Differential: intakeData.cbc,
        CMP_14: intakeData.cmb,
        Lipid_Panel: intakeData.lipid,
        Thyroid_Profile_II: intakeData.thyroid,
        Vitamin_D_25_Hydroxy: intakeData.vitaminD,
        Iron_Panel: intakeData.iron,
        Magnesium: intakeData.magnesium,
        HbA1c: intakeData.hemoglobin,
      },
    };
    payload = normalizePayload(payload);
    payload = normalizeLabUnits(payload);
    try {
      const response = await fetchBlob("/report/generate-report", payload);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Lab_Report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      navigate("/reports", {
        state: {
          type: "success",
          toastMessage: "Report Generated Successfully. Check your downloads!",
        },
      });
    } catch (err) {
      console.error("API error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-16">
      <section className="card text-align-center">
        {/* Main Icon */}
        <div className="mb-4 text-align-center">
          <img src={EditIcon} alt="Age Consent" className="icon-lg" />
        </div>

        {/* Title */}
        <h2 className="card-title">Generate Report</h2>
        {/* Question */}
        {/* Form */}
        <form onSubmit={handleSubmit} className="report-form mt-4">
          {/* ✅ BUTTON ROW */}
          <div className="button-row">
            <button
              type="submit"
              className="btn btn-primary float-right"
              onClick={handleGenerateReport}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default GenerateReport;
