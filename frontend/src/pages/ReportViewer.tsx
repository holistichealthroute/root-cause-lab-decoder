import React, { useEffect, useState } from "react";
import { request, fetchBlobGet } from "../api/HttpService";

const ReportViewer: React.FC = () => {
  const [reports, setReports] = useState<
    { id: string; filename: string; created_at: string }[]
  >([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Fetch reports list
  useEffect(() => {
    setLoadingReports(true);
    request<{
      reports: { id: string; filename: string; created_at: string }[];
    }>("/report/my-reports")
      .then((data) => {
        setReports(data.reports);
        if (data.reports.length > 0) setSelectedId(data.reports[0].id);
      })
      .catch(() => setReports([]))
      .finally(() => setLoadingReports(false));
  }, []);

  // Fetch PDF when selectedId changes
  useEffect(() => {
    if (!selectedId) return;
    setLoadingPdf(true);
    setPdfError(null);

    fetchBlobGet(`/report/${selectedId}`)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      })
      .catch(() => {
        setPdfUrl(null);
        setPdfError("PDF cannot be displayed.");
      })
      .finally(() => setLoadingPdf(false));

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
    // eslint-disable-next-line
  }, [selectedId]);

  return (
    <div style={{ display: "flex", height: "80vh" }}>
      <div style={{ width: 220, borderRight: "1px solid #ccc", padding: 8 }}>
        <h3>My Reports</h3>
        {loadingReports ? (
          <div>Loading reports...</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {reports.map((r) => (
              <li
                key={r.id}
                style={{
                  padding: "8px 0",
                  cursor: "pointer",
                  fontWeight: r.id === selectedId ? "bold" : "normal",
                }}
                onClick={() => setSelectedId(r.id)}
              >
                {r.filename} <br />
                <small>{new Date(r.created_at).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ flex: 1, padding: 16 }}>
        {loadingPdf ? (
          <div>Loading PDF...</div>
        ) : pdfUrl ? (
          <object
            data={pdfUrl}
            type="application/pdf"
            width="100%"
            height="100%"
          >
            <p>PDF cannot be displayed.</p>
          </object>
        ) : pdfError ? (
          <div>{pdfError}</div>
        ) : (
          <div>No report selected</div>
        )}
      </div>
    </div>
  );
};

export default ReportViewer;
