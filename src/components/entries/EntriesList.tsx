import { useState, useEffect } from "react";
import { fetchEntries, deleteEntry, type Entry } from "../../services/api";
import MarkdownViewer from "../common/MarkdownViewer";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../themes/default.css";

export default function EntriesList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get page from URL params, default to 1 if not present or invalid
  const getPageFromParams = () => {
    const pageParam = searchParams.get("page");
    const pageNum = pageParam ? parseInt(pageParam, 10) : 1;
    return isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
  };

  const page = getPageFromParams();
  const [entries, setEntries] = useState<Entry[]>([]);
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

  // Validate page number and redirect if invalid
  useEffect(() => {
    if (total > 0) {
      const maxPage = Math.ceil(total / pageSize);
      if (page > maxPage) {
        setSearchParams({ page: maxPage.toString() });
      }
    }
  }, [total, page, pageSize, setSearchParams]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setSearchParams({ page: (page - 1).toString() });
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setSearchParams({ page: (page + 1).toString() });
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
        setSearchParams({ page: (page - 1).toString() });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete entry");
      console.error("Error deleting entry:", err);
    }
  };

  return (
    <div className="page-container">
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
                  <div key={date} className="day-group">
                    <h3 className="day-group-date">{date}</h3>
                    {dateEntries.map((entry, index) => {
                      const prevEntry =
                        index > 0 ? dateEntries[index - 1] : null;
                      const showLocation =
                        !prevEntry ||
                        entry.location?.name !== prevEntry.location?.name;

                      return (
                        <div key={entry.id}>
                          {showLocation && entry.location && (
                            <h4 className="entry-location">
                              {entry.location.name}
                            </h4>
                          )}
                          <div className="entry">
                            <div className="entry-time">
                              {formatTime(entry.createdAt)}
                            </div>
                            <div className="entry-content">
                              <MarkdownViewer
                                content={entry.content}
                                mediaPaths={entry.mediaPaths}
                              />
                              {editMode && (
                                <div className="entry-actions">
                                  <button onClick={() => handleEdit(entry.id)}>
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(entry.id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          )}

          {total > 0 && (
            <div style={{ marginTop: "40px", textAlign: "center" }}>
              <button onClick={handlePreviousPage} disabled={page === 1}>
                ᐊᐊᐊ
              </button>
              <span style={{ margin: "0 20px" }}>
                Page {page} of {Math.ceil(total / pageSize)}
              </span>
              <button onClick={handleNextPage} disabled={!hasMore}>
                ᐅᐅᐅ
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
