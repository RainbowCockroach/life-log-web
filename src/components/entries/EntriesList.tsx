import { useState, useEffect } from "react";
import { fetchEntries, deleteEntry, type Entry } from "../../services/api";
import MarkdownViewer from "../common/MarkdownViewer";
import { useNavigate } from "react-router-dom";

export default function EntriesList() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
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
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupEntriesByDate = (entries: Entry[]) => {
    const groups: { [date: string]: Entry[] } = {};

    entries.forEach((entry) => {
      const dateKey = formatDate(entry.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
    });

    return groups;
  };

  const handleEdit = (entryId: number) => {
    navigate(`/edit/${entryId}`);
  };

  const handleDelete = async (entryId: number) => {
    if (!confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    try {
      await deleteEntry(entryId);
      // Reload entries after deletion
      const response = await fetchEntries(page, pageSize);
      setEntries(response.entries);
      setTotal(response.total);
      setHasMore(response.hasMore);
      // If current page is empty and not first page, go back one page
      if (response.entries.length === 0 && page > 1) {
        setPage(page - 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete entry");
      console.error("Error deleting entry:", err);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setEditMode(!editMode)}>
          {editMode ? "Exit Edit Mode" : "Edit Mode"}
        </button>
      </div>

      {error && <div>Error: {error}</div>}

      {loading ? (
        <div>Loading entries...</div>
      ) : (
        <>
          {entries.length === 0 ? (
            <div>No entries found</div>
          ) : (
            <div>
              {Object.entries(groupEntriesByDate(entries)).map(
                ([date, dateEntries]) => (
                  <div key={date} style={{ marginBottom: "40px" }}>
                    <h3>{date}</h3>
                    {dateEntries.map((entry) => (
                      <div key={entry.id} style={{ marginBottom: "32px" }}>
                        <div
                          style={{
                            fontSize: "14px",
                            marginBottom: "8px",
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          <span>{formatTime(entry.createdAt)}</span>
                          {entry.location && (
                            <span>| {entry.location.name}</span>
                          )}
                          {editMode && (
                            <>
                              <button
                                onClick={() => handleEdit(entry.id)}
                                style={{ marginLeft: "auto" }}
                              >
                                Edit
                              </button>
                              <button onClick={() => handleDelete(entry.id)}>
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                        <MarkdownViewer
                          content={entry.content}
                          mediaPaths={entry.mediaPaths}
                        />
                      </div>
                    ))}
                  </div>
                )
              )}
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
