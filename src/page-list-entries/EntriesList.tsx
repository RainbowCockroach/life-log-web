import { useState, useEffect, useCallback } from "react";
import { searchEntries, deleteEntry, fetchTags, type Entry, type Tag } from "../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../themes/default.css";
import MarkdownViewer from "../components/MarkdownViewer";

export default function EntriesList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get page and search query from URL params
  const getPageFromParams = useCallback(() => {
    const pageParam = searchParams.get("page");
    const pageNum = pageParam ? parseInt(pageParam, 10) : 1;
    return isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
  }, [searchParams]);

  const getSearchQueryFromParams = useCallback(() => {
    return searchParams.get("q") || "";
  }, [searchParams]);

  const getTagIdsFromParams = useCallback(() => {
    const tagIdsParam = searchParams.get("tagIds");
    return tagIdsParam ? tagIdsParam.split(",").map(id => parseInt(id, 10)) : [];
  }, [searchParams]);

  const page = getPageFromParams();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState(getSearchQueryFromParams());
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(getTagIdsFromParams());
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const pageSize = 10;

  // Load all tags
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await fetchTags();
        setAllTags(tags.filter(tag => tag.type === "tag"));
      } catch (err) {
        console.error("Error loading tags:", err);
      }
    };

    loadTags();
  }, []);

  useEffect(() => {
    const loadEntries = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await searchEntries({
          query: searchQuery || undefined,
          tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
          page,
          pageSize,
        });
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
  }, [page, searchQuery, selectedTagIds]);

  // Sync search query state with URL parameters
  useEffect(() => {
    const queryFromUrl = getSearchQueryFromParams();
    if (queryFromUrl !== searchQuery) {
      setSearchQuery(queryFromUrl);
    }
  }, [searchParams, searchQuery, getSearchQueryFromParams]);

  // Sync tag IDs state with URL parameters
  useEffect(() => {
    const tagIdsFromUrl = getTagIdsFromParams();
    const currentTagIds = selectedTagIds.join(",");
    const urlTagIds = tagIdsFromUrl.join(",");
    if (urlTagIds !== currentTagIds) {
      setSelectedTagIds(tagIdsFromUrl);
    }
  }, [searchParams, selectedTagIds, getTagIdsFromParams]);

  // Validate page number and redirect if invalid
  useEffect(() => {
    if (total > 0) {
      const maxPage = Math.ceil(total / pageSize);
      if (page > maxPage) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", maxPage.toString());
        setSearchParams(newParams);
      }
    }
  }, [total, page, pageSize, setSearchParams, searchParams]);

  const handlePreviousPage = () => {
    if (page > 1) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", (page - 1).toString());
      setSearchParams(newParams);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", (page + 1).toString());
      setSearchParams(newParams);
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
      const response = await searchEntries({
        query: searchQuery || undefined,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        page,
        pageSize,
      });
      setEntries(response.entries);
      setTotal(response.total);
      setHasMore(response.hasMore);
      // If current page is empty and not first page, go back one page
      if (response.entries.length === 0 && page > 1) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", (page - 1).toString());
        setSearchParams(newParams);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete entry");
      console.error("Error deleting entry:", err);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const newParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      newParams.set("q", value);
    } else {
      newParams.delete("q");
    }
    newParams.set("page", "1"); // Reset to first page on new search
    setSearchParams(newParams);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("q");
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handleToggleTag = (tagId: number) => {
    const newSelectedTagIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId];

    setSelectedTagIds(newSelectedTagIds);
    const newParams = new URLSearchParams(searchParams);
    if (newSelectedTagIds.length > 0) {
      newParams.set("tagIds", newSelectedTagIds.join(","));
    } else {
      newParams.delete("tagIds");
    }
    newParams.set("page", "1"); // Reset to first page when filter changes
    setSearchParams(newParams);
  };

  const handleClearTagFilter = () => {
    setSelectedTagIds([]);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("tagIds");
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Search ..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button onClick={handleClearSearch} style={{ marginLeft: "10px" }}>
              Clear
            </button>
          )}
        </div>
        {allTags.length > 0 && (
          <div style={{ marginBottom: "10px" }}>
            <button onClick={() => setShowTagFilter(!showTagFilter)}>
              {showTagFilter ? "Hide" : "Show"} tag filter
              {selectedTagIds.length > 0 && ` (${selectedTagIds.length})`}
            </button>
            {showTagFilter && (
              <div style={{ marginTop: "10px" }}>
                {selectedTagIds.length > 0 && (
                  <button onClick={handleClearTagFilter} style={{ marginBottom: "10px" }}>
                    Clear all
                  </button>
                )}
                <div>
                  {allTags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => handleToggleTag(tag.id)}
                        style={{
                          marginRight: "5px",
                          marginBottom: "5px",
                          fontWeight: isSelected ? "bold" : "normal",
                        }}
                      >
                        {isSelected ? "✓ " : ""}{tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        <button onClick={() => setEditMode(!editMode)}>
          {editMode ? "Exit Edit Mode" : "Edit Mode"}
        </button>
      </div>

      {error && <div>Error: {error}</div>}

      {(searchQuery || selectedTagIds.length > 0) && !loading && (
        <div
          style={{
            marginBottom: "10px",
            fontSize: "14px",
            color: "var(--secondary-color)",
          }}
        >
          {total === 0
            ? `No entries found${searchQuery ? ` for "${searchQuery}"` : ""}${selectedTagIds.length > 0 ? " with selected tags" : ""}`
            : `Found ${total} result${total === 1 ? "" : "s"}${searchQuery ? ` for "${searchQuery}"` : ""}${selectedTagIds.length > 0 ? ` with ${selectedTagIds.length} tag${selectedTagIds.length === 1 ? "" : "s"}` : ""}`}
        </div>
      )}

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
