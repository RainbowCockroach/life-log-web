import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Editor from "./components/Editor";
import EntriesList from "./components/EntriesList";
import ApiKeyModal from "./components/ApiKeyModal";
import { hasApiKey, saveApiKey, getApiKey } from "./utils/apiKeyStorage";
import { API_CONFIG } from "./config/constants";

function Navigation() {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleApiKeySave = (apiKey: string) => {
    saveApiKey(apiKey);
    setSuccessMessage("API key saved successfully");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <>
      <nav style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <Link to={`${API_CONFIG.BASE_URL}/`}>New Entry</Link>
          <Link to={`${API_CONFIG.BASE_URL}/entries`}>View Entries</Link>
        </div>
        <button onClick={() => setIsApiKeyModalOpen(true)}>
          {hasApiKey() ? "API Settings" : "Set API Key"}
        </button>
      </nav>

      {successMessage && <div>{successMessage}</div>}

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleApiKeySave}
        currentApiKey={getApiKey() || ""}
      />
    </>
  );
}

function App() {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(!hasApiKey());

  return (
    <Router>
      <div
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      >
        <Navigation />
        <div style={{ flex: 1, overflow: "auto" }}>
          <Routes>
            <Route path={`/${API_CONFIG.BASE_URL}/`} element={<Editor />} />
            <Route
              path={`/${API_CONFIG.BASE_URL}/entries`}
              element={<EntriesList />}
            />
          </Routes>
        </div>
      </div>

      {!hasApiKey() && (
        <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
          onSave={(apiKey) => {
            saveApiKey(apiKey);
            setIsApiKeyModalOpen(false);
          }}
          currentApiKey=""
        />
      )}
    </Router>
  );
}

export default App;
