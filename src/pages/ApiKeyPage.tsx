import { useState } from "react";
import { saveApiKey, getApiKey } from "../utils/apiKeyStorage";

function ApiKeyPage() {
  const [apiKey, setApiKey] = useState(getApiKey() || "");
  const [message, setMessage] = useState<string | null>(null);

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
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your API key"
        />
      </div>

      <button onClick={handleSave}>Save API Key</button>
    </div>
  );
}

export default ApiKeyPage;
