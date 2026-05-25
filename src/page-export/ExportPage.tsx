import { useState } from "react";
import {
  FileDown,
  Calendar,
  CircleAlert,
  Loader2,
  FileText,
  QrCode,
} from "lucide-react";
import { exportPdf } from "../services/api";
import "./ExportPage.css";

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
    <div className="page-container export-page">
      <header className="export-page__header">
        <h1 className="export-page__title">
          <FileDown size={20} aria-hidden />
          Export to PDF
        </h1>
        <p className="export-page__lede">Printable PDF of entries in a date range.</p>
      </header>

      <section className="export-card">
        <div className="export-card__row">
          <div className="export-card__field">
            <label className="export-card__label" htmlFor="export-start">
              <Calendar size={12} aria-hidden />
              Start date
            </label>
            <input
              id="export-start"
              type="date"
              className="export-card__input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
            />
          </div>

          <div className="export-card__field">
            <label className="export-card__label" htmlFor="export-end">
              <Calendar size={12} aria-hidden />
              End date
            </label>
            <input
              id="export-end"
              type="date"
              className="export-card__input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={today}
            />
          </div>
        </div>

        {error && (
          <div className="export-page__message export-page__message--error" role="alert">
            <CircleAlert size={14} aria-hidden />
            {error}
          </div>
        )}

        <div className="export-card__actions">
          <button
            type="button"
            className="export-btn export-btn--primary"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 size={14} aria-hidden className="export-btn__spin" />
                Exporting…
              </>
            ) : (
              <>
                <FileDown size={14} aria-hidden />
                Export PDF
              </>
            )}
          </button>
        </div>
      </section>

      <section className="export-info" aria-label="Export format">
        <ul className="export-info__list">
          <li className="export-info__item">
            <FileText size={14} aria-hidden />
            A5, two columns
          </li>
          <li className="export-info__item">
            <QrCode size={14} aria-hidden />
            QR codes for links
          </li>
        </ul>
      </section>
    </div>
  );
}

export default ExportPage;
