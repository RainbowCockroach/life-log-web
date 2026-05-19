import { useState } from "react";
import { KeyRound, Eye, EyeOff, Save, Check, CircleAlert } from "lucide-react";
import { saveApiKey, getApiKey } from "../utils/apiKeyStorage";
import "./ApiKeyPage.css";

function ApiKeyPage() {
  const initial = getApiKey() || "";
  const [apiKey, setApiKey] = useState(initial);
  const [savedKey, setSavedKey] = useState(initial);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [showKey, setShowKey] = useState(false);

  const trimmed = apiKey.trim();
  const isDirty = trimmed !== savedKey;
  const canSave = trimmed.length > 0 && isDirty;

  const handleSave = () => {
    if (!trimmed) {
      setMessage({ kind: "error", text: "API key cannot be empty" });
      return;
    }
    saveApiKey(trimmed);
    setSavedKey(trimmed);
    setMessage({ kind: "success", text: "API key saved" });
    window.setTimeout(() => setMessage(null), 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  const hasKey = savedKey.length > 0;

  return (
    <div className="page-container api-key-page">
      <header className="api-key-page__header">
        <h1 className="api-key-page__title">
          <KeyRound size={20} aria-hidden />
          API Key
        </h1>
        <p className="api-key-page__lede">
          Used to authenticate requests to the diary API. Stored locally in a cookie on this device.
        </p>
        <span
          className={`api-key-page__status ${
            hasKey ? "api-key-page__status--set" : "api-key-page__status--missing"
          }`}
        >
          {hasKey ? <Check size={12} aria-hidden /> : <CircleAlert size={12} aria-hidden />}
          {hasKey ? "Key is set" : "No key set"}
        </span>
      </header>

      <section className="api-key-card">
        <div className="api-key-card__field">
          <label className="api-key-card__label" htmlFor="api-key-input">
            API Key
          </label>
          <div className="api-key-card__input-wrap">
            <input
              id="api-key-input"
              className="api-key-card__input"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste your API key"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              className="api-key-card__reveal"
              onClick={() => setShowKey((v) => !v)}
              title={showKey ? "Hide API key" : "Show API key"}
              aria-label={showKey ? "Hide API key" : "Show API key"}
              aria-pressed={showKey}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="api-key-card__hint">
            Press Enter to save. The key is sent as the <code>x-api-key</code> header.
          </p>
        </div>

        {message && (
          <div
            className={`api-key-page__message api-key-page__message--${message.kind}`}
            role={message.kind === "error" ? "alert" : "status"}
          >
            {message.kind === "success" ? (
              <Check size={14} aria-hidden />
            ) : (
              <CircleAlert size={14} aria-hidden />
            )}
            {message.text}
          </div>
        )}

        <div className="api-key-card__actions">
          <button
            type="button"
            className="api-key-btn api-key-btn--primary"
            onClick={handleSave}
            disabled={!canSave}
          >
            <Save size={14} aria-hidden />
            {hasKey && !isDirty ? "Saved" : "Save API key"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ApiKeyPage;
