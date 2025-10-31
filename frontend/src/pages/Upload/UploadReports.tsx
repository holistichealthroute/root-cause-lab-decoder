import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import PDFIcon from "../../assets/icons/PDFIcon.png";
import CameraIcon from "../../assets/icons/CameraIcon.svg";
import EditIcon from "../../assets/icons/EditIcon.svg";
import { useNavigate } from "react-router-dom";
import { postFormData } from "../../api/HttpService";
import { useIntake } from "../../components/IntakeContext";

const UploadReports: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const { intakeData, setIntakeData } = useIntake();

  const handlePDFClick = () => {
    pdfInputRef.current?.click();
  };

  const handleImgClick = () => {
    imgInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;
    setLoading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));
      const response = await postFormData("/ocr/extract", formData);

      const labReports = response.lab_reports || {};
      setIntakeData((prev) => ({
        ...prev,
        cbc: labReports.CBC_with_Differential,
        cmb: labReports.CMP_14,
        lipid: labReports.Lipid_Panel,
        thyroid: labReports.Thyroid_Profile_II,
        vitaminD: labReports.Vitamin_D_25_Hydroxy,
        iron: labReports.Iron_Panel,
        magnesium: labReports.Magnesium,
        hemoglobin: labReports.HbA1c,
      }));
      navigate("/upload/cbc1", {
        state: {
          type: "success",
          toastMessage:
            "Lab reports uploaded successfully. You can now proceed.",
        },
      });
    } catch (err) {
      console.error("API error:", err);
    } finally {
      setLoading(false);
    }
  };

  const OnManualEntry = () => {
    setIntakeData({});
    navigate("/upload/cbc1");
  };

  return (
    <div className="grid gap-16">
      <section className="card text-align-center">
        {/* Main Icon */}
        <div className="mb-4 text-align-center">
          <Upload className="icon-lg" color="#4b5fd0" />
        </div>

        {/* Title */}
        <h2 className="card-title">Upload Lab Reports</h2>

        {/* Question */}
        <p className="card-text text-align-center">
          Upload your lab reports to automatically extract your bloodwork
          values.
          <br />
          You can upload PDF files, images, or enter values manually.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="report-form mt-4">
          {/* ICON ROW */}
          <div
            className="icon-row"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2rem",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <img
                src={PDFIcon}
                alt="PDF Icon"
                className="icon-item"
                onClick={handlePDFClick}
                style={{ cursor: "pointer" }}
              />
              <div
                style={{
                  fontSize: "0.95rem",
                  marginTop: "0.5rem",
                }}
              >
                Upload PDF
              </div>
              <input
                type="file"
                accept=".pdf"
                multiple
                ref={pdfInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <img
                src={CameraIcon}
                alt="Camera Icon"
                className="icon-item"
                onClick={handleImgClick}
                style={{ cursor: "pointer" }}
              />
              <div
                style={{
                  fontSize: "0.95rem",
                  marginTop: "0.5rem",
                }}
              >
                Upload Image
              </div>
              <input
                type="file"
                accept=".png,.jpg,.jpeg"
                multiple
                ref={imgInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <img
                src={EditIcon}
                alt="Edit Icon"
                className="icon-item"
                onClick={OnManualEntry}
                style={{ cursor: "pointer" }}
              />
              <div
                style={{
                  fontSize: "0.95rem",
                  marginTop: "0.5rem",
                }}
              >
                Manual Entry
              </div>
            </div>
          </div>

          {/* ✅ BUTTON ROW */}
          <div className="button-row">
            <button
              type="submit"
              className="btn btn-primary float-right"
              disabled={selectedFiles.length === 0 || loading}
            >
              {loading ? "Uploading..." : "Next"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default UploadReports;
