import { useState } from "react";
import { saveApiKey, getApiKey } from "../utils/apiKeyStorage";

function ApiKeyPage() {
  const [apiKey, setApiKey] = useState(getApiKey() || "");
  const [message, setMessage] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      saveApiKey(apiKey.trim());
      setMessage("API key saved successfully");
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <div>
      <h1>API Key Configuration</h1>
      <p>Enter your API key. It will be stored securely in cookies.</p>

      {message && <div>{message}</div>}

      <div>
        <label>API Key</label>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your API key"
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "0 4px", fontSize: "1rem" }}
            aria-label={showKey ? "Hide API key" : "Show API key"}
          >
            {showKey ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      <button onClick={handleSave}>Save API Key</button>
    </div>
  );
}

export default ApiKeyPage;
