import { useState, useEffect } from 'react';
import { fetchEntries, type Entry } from '../services/api';
import MarkdownViewer from './MarkdownViewer';

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
        setError(err instanceof Error ? err.message : 'Failed to load entries');
        console.error('Error loading entries:', err);
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
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>Diary Entries</h1>

      {error && (
        <div
          style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c00',
          }}
        >
          Error: {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading entries...</div>
      ) : (
        <>
          {entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No entries found
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '16px',
                    backgroundColor: entry.isHighlighted ? '#fffbf0' : '#fff',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px',
                      paddingBottom: '8px',
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {formatDate(entry.createdAt)}
                    </div>
                    {entry.tags && entry.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {entry.tags.map((tag) => (
                          <span
                            key={tag.id}
                            style={{
                              padding: '2px 8px',
                              fontSize: '11px',
                              backgroundColor: '#e0e0e0',
                              borderRadius: '3px',
                              color: '#333',
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <MarkdownViewer content={entry.content} mediaPaths={entry.mediaPaths} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {total > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid #ddd',
              }}
            >
              <button
                onClick={handlePreviousPage}
                disabled={page === 1}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: page === 1 ? '#f5f5f5' : '#fff',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.6 : 1,
                }}
              >
                Previous
              </button>

              <div style={{ fontSize: '14px', color: '#666' }}>
                Page {page} of {Math.ceil(total / pageSize)} ({total} total entries)
              </div>

              <button
                onClick={handleNextPage}
                disabled={!hasMore}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: !hasMore ? '#f5f5f5' : '#fff',
                  cursor: !hasMore ? 'not-allowed' : 'pointer',
                  opacity: !hasMore ? 0.6 : 1,
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
