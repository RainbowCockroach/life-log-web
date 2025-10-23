import { useState, useEffect } from "react";
import { fetchEntries, type Entry } from "../services/api";
import MarkdownViewer from "./MarkdownViewer";

export default function EntriesList() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    const loadEntries = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchEntries(page, pageSize);
        setEntries(response.entries);
        setTotal(response.total);
        setHasMore(response.hasMore);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load entries");
        console.error("Error loading entries:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, [page]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setPage(page + 1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      {error && <div>Error: {error}</div>}

      {loading ? (
        <div>Loading entries...</div>
      ) : (
        <>
          {entries.length === 0 ? (
            <div>No entries found</div>
          ) : (
            <div>
              {entries.map((entry) => (
                <div key={entry.id} style={{ marginBottom: "40px" }}>
                  <div style={{ fontSize: "14px", marginBottom: "8px" }}>
                    {formatDate(entry.createdAt)}
                    {entry.location && (
                      <span>
                        {" — "}
                        {entry.location.name}
                      </span>
                    )}
                    {entry.tags && entry.tags.length > 0 && (
                      <span>
                        {" — "}
                        {entry.tags.map((tag) => tag.name).join(", ")}
                      </span>
                    )}
                  </div>
                  <MarkdownViewer
                    content={entry.content}
                    mediaPaths={entry.mediaPaths}
                  />
                </div>
              ))}
            </div>
          )}

          {total > 0 && (
            <div style={{ marginTop: "40px", textAlign: "center" }}>
              <button onClick={handlePreviousPage} disabled={page === 1}>
                Previous
              </button>
              <span style={{ margin: "0 20px" }}>
                Page {page} of {Math.ceil(total / pageSize)}
              </span>
              <button onClick={handleNextPage} disabled={!hasMore}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
