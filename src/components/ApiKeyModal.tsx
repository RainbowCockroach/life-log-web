import { useState } from "react";

interface ApiKeyModalProps {
  onSave: (apiKey: string) => void;
  currentApiKey?: string;
}

function ApiKeyModal({ onSave, currentApiKey = "" }: ApiKeyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(currentApiKey);

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const hasApiKey = Boolean(currentApiKey);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: hasApiKey ? "" : "#dc2626",
          color: hasApiKey ? "" : "white",
        }}
      >
        API Key
      </button>
      {isOpen && (
        <div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter API key"
            autoFocus
          />
          <button onClick={handleSave}>Save</button>
        </div>
      )}
    </div>
  );
}

export default ApiKeyModal;
