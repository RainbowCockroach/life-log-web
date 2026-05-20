import { useState, useEffect, useCallback, useRef } from "react";
import { searchEntries, deleteEntry, fetchTags, type Entry, type Tag } from "../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  X,
  Filter,
  Pencil,
  Trash2,
  Check,
  ArrowUp,
} from "lucide-react";
import "../themes/default.css";
import "./EntriesList.css";
import MarkdownViewer from "../components/MarkdownViewer";

export default function EntriesList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const getSearchQueryFromParams = useCallback(() => {
    return searchParams.get("q") || "";
  }, [searchParams]);

  const getTagIdsFromParams = useCallback(() => {
    const tagIdsParam = searchParams.get("tagIds");
    return tagIdsParam ? tagIdsParam.split(",").map(id => parseInt(id, 10)) : [];
  }, [searchParams]);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState(getSearchQueryFromParams());
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(getTagIdsFromParams());
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const pageSize = 10;

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(false);
  const pageRef = useRef(1);
  const queryRef = useRef(searchQuery);
  const tagIdsRef = useRef(selectedTagIds);

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

  // Reset and load first page when query/tags change
  useEffect(() => {
    const loadFirst = async () => {
      setLoading(true);
      setError(null);
      queryRef.current = searchQuery;
      tagIdsRef.current = selectedTagIds;
      pageRef.current = 1;

      try {
        const response = await searchEntries({
          query: searchQuery || undefined,
          tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
          page: 1,
          pageSize,
        });
        setEntries(response.entries);
        setTotal(response.total);
        setHasMore(response.hasMore);
        hasMoreRef.current = response.hasMore;
        setPage(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load entries");
        console.error("Error loading entries:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFirst();
  }, [searchQuery, selectedTagIds]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;

    try {
      const response = await searchEntries({
        query: queryRef.current || undefined,
        tagIds: tagIdsRef.current.length > 0 ? tagIdsRef.current : undefined,
        page: nextPage,
        pageSize,
      });
      setEntries(prev => [...prev, ...response.entries]);
      setHasMore(response.hasMore);
      hasMoreRef.current = response.hasMore;
      pageRef.current = nextPage;
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more entries");
      console.error("Error loading more entries:", err);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, []);

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

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "400px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, entries.length]);

  // Back-to-top visibility on scroll
  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      // Reload all currently visible pages
      const response = await searchEntries({
        query: searchQuery || undefined,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        page: 1,
        pageSize: pageSize * page,
      });
      setEntries(response.entries);
      setTotal(response.total);
      setHasMore(response.hasMore);
      hasMoreRef.current = response.hasMore;
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
    setSearchParams(newParams);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("q");
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
    setSearchParams(newParams);
  };

  const handleClearTagFilter = () => {
    setSelectedTagIds([]);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("tagIds");
    setSearchParams(newParams);
  };

  return (
    <div className="page-container">
      <div className="entries-toolbar">
        <div className="entries-toolbar__search">
          <span className="entries-toolbar__search-icon">
            <Search size={14} aria-hidden="true" />
          </span>
          <input
            type="text"
            className="entries-toolbar__search-input"
            placeholder="Search entries"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="Search entries"
          />
          {searchQuery && (
            <button
              type="button"
              className="entries-toolbar__search-clear"
              onClick={handleClearSearch}
              aria-label="Clear search"
              title="Clear search"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        {allTags.length > 0 && (
          <button
            type="button"
            className="entries-toolbar__btn"
            onClick={() => setShowTagFilter(!showTagFilter)}
            aria-pressed={showTagFilter}
            aria-label="Toggle tag filter"
            title="Filter by tags"
          >
            <Filter size={16} aria-hidden="true" />
            {selectedTagIds.length > 0 && (
              <span className="entries-toolbar__badge">{selectedTagIds.length}</span>
            )}
          </button>
        )}

        <button
          type="button"
          className="entries-toolbar__btn"
          onClick={() => setEditMode(!editMode)}
          aria-pressed={editMode}
          aria-label={editMode ? "Exit edit mode" : "Enter edit mode"}
          title={editMode ? "Exit edit mode" : "Edit mode"}
        >
          <Pencil size={16} aria-hidden="true" />
        </button>
      </div>

      {showTagFilter && allTags.length > 0 && (
        <div className="entries-tagfilter">
          {allTags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id);
            return (
              <button
                type="button"
                key={tag.id}
                className="entries-tagfilter__chip"
                onClick={() => handleToggleTag(tag.id)}
                aria-pressed={isSelected}
              >
                {isSelected && <Check size={12} aria-hidden="true" />}
                {tag.name}
              </button>
            );
          })}
          {selectedTagIds.length > 0 && (
            <button
              type="button"
              className="entries-tagfilter__clear"
              onClick={handleClearTagFilter}
            >
              Clear
            </button>
          )}
        </div>
      )}

      {error && <div className="entries-status entries-status--error">Error: {error}</div>}

      {(searchQuery || selectedTagIds.length > 0) && !loading && (
        <div className="entries-status">
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
                                  <button
                                    type="button"
                                    className="entry-actions__btn"
                                    onClick={() => handleEdit(entry.id)}
                                    aria-label="Edit entry"
                                    title="Edit entry"
                                  >
                                    <Pencil size={14} aria-hidden="true" />
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="entry-actions__btn entry-actions__btn--danger"
                                    onClick={() => handleDelete(entry.id)}
                                    aria-label="Delete entry"
                                    title="Delete entry"
                                  >
                                    <Trash2 size={14} aria-hidden="true" />
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

          {hasMore && <div ref={sentinelRef} className="entries-sentinel" aria-hidden="true" />}

          {loadingMore && (
            <div className="entries-status entries-status--center">Loading more…</div>
          )}

          {!hasMore && entries.length > 0 && total > pageSize && (
            <div className="entries-status entries-status--center">End of entries</div>
          )}
        </>
      )}

      {showBackToTop && (
        <button
          type="button"
          className="entries-backtotop"
          onClick={handleBackToTop}
          aria-label="Back to top"
          title="Back to top"
        >
          <ArrowUp size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
