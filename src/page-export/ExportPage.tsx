import { useState } from "react";
import { exportPdf } from "../services/api";

function ExportPage() {
  const today = new Date().toISOString().split("T")[0];
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(oneMonthAgo);
  const [endDate, setEndDate] = useState(today);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date must be before end date");
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const blob = await exportPdf(startDate, endDate);

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `diary-export-${startDate}-to-${endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px" }}>
      <h1>Export to PDF</h1>
      <p>Select a date range to export your diary entries as printable PDFs.</p>

      {error && (
        <div style={{ color: "#dc2626", marginBottom: "16px" }}>{error}</div>
      )}

      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "4px" }}>
          Start Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          max={endDate}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "4px" }}>
          End Date
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={startDate}
          max={today}
        />
      </div>

      <button onClick={handleExport} disabled={isExporting}>
        {isExporting ? "Exporting..." : "Export PDF"}
      </button>

      <div style={{ marginTop: "24px", fontSize: "14px", opacity: 0.7 }}>
        <p>The export will generate:</p>
        <ul>
          <li>Single PDF with all entries (A5 format, ready for printing)</li>
          <li>Two-column layout for space-efficient printing</li>
          <li>Includes entries, tags, locations, images, and QR codes for links</li>
        </ul>
      </div>
    </div>
  );
}

export default ExportPage;
