import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Editor from './components/Editor';
import EntriesList from './components/EntriesList';
import ApiKeyModal from './components/ApiKeyModal';
import { hasApiKey, saveApiKey, getApiKey } from './utils/apiKeyStorage';

function Navigation() {
  const location = useLocation();
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleApiKeySave = (apiKey: string) => {
    saveApiKey(apiKey);
    setSuccessMessage('API key saved successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <>
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          borderBottom: '1px solid #ddd',
          backgroundColor: '#f8f9fa',
        }}
      >
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link
            to="/"
            style={{
              padding: '8px 16px',
              textDecoration: 'none',
              borderRadius: '4px',
              backgroundColor: location.pathname === '/' ? '#007bff' : 'transparent',
              color: location.pathname === '/' ? 'white' : '#007bff',
              border: '1px solid #007bff',
            }}
          >
            New Entry
          </Link>
          <Link
            to="/entries"
            style={{
              padding: '8px 16px',
              textDecoration: 'none',
              borderRadius: '4px',
              backgroundColor: location.pathname === '/entries' ? '#007bff' : 'transparent',
              color: location.pathname === '/entries' ? 'white' : '#007bff',
              border: '1px solid #007bff',
            }}
          >
            View Entries
          </Link>
        </div>
        <button
          onClick={() => setIsApiKeyModalOpen(true)}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: hasApiKey() ? '#28a745' : '#ffc107',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          {hasApiKey() ? 'Update API Key' : 'Set API Key'}
        </button>
      </nav>

      {successMessage && (
        <div
          style={{
            padding: '8px 12px',
            margin: '12px 20px',
            backgroundColor: '#efe',
            border: '1px solid #cfc',
            borderRadius: '4px',
            color: '#060',
          }}
        >
          {successMessage}
        </div>
      )}

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleApiKeySave}
        currentApiKey={getApiKey() || ''}
      />
    </>
  );
}

function App() {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Check for API key on mount
  useEffect(() => {
    if (!hasApiKey()) {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  return (
    <Router>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navigation />
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Routes>
            <Route path="/" element={<Editor />} />
            <Route path="/entries" element={<EntriesList />} />
          </Routes>
        </div>
      </div>

      {/* Show API key modal on first load if no key is set */}
      {!hasApiKey() && (
        <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
          onSave={(apiKey) => {
            saveApiKey(apiKey);
            setIsApiKeyModalOpen(false);
          }}
          currentApiKey={''}
        />
      )}
    </Router>
  );
}

export default App;
