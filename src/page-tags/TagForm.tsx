import React, { useState } from "react";
import { X } from "lucide-react";
import type { Tag, CreateTagRequest } from "../services/api";
import { randomTagColor } from "../utils/randomTagColor";

interface TagFormProps {
  tag?: Tag | null;
  allTags: Tag[];
  onSave: (tag: CreateTagRequest) => void;
  onCancel: () => void;
  defaultType?: string;
}

const TagForm: React.FC<TagFormProps> = ({
  tag,
  allTags,
  onSave,
  onCancel,
  defaultType,
}) => {
  const [name, setName] = useState(tag?.name || "");
  const [searchHint, setSearchHint] = useState(tag?.searchHint || "");
  const [type, setType] = useState(tag?.type || defaultType || "tag");
  const [config, setConfig] = useState(() =>
    JSON.stringify(tag?.config ?? randomTagColor(), null, 2)
  );
  const [parentId, setParentId] = useState<number | null>(
    tag?.parent?.id || null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedConfig = JSON.parse(config);
      onSave({
        name,
        searchHint,
        type,
        config: parsedConfig,
        parentId,
      });
    } catch {
      alert("Invalid JSON in config");
    }
  };

  const parentOptions = allTags.filter(
    (t) => t.id !== tag?.id && t.type === type
  );

  const heading = tag
    ? `Edit ${type === "location" ? "location" : "tag"}`
    : `New ${type === "location" ? "location" : "tag"}`;

  return (
    <form className="tag-form" onSubmit={handleSubmit}>
      <div className="tag-form__header">
        <h3 className="tag-form__title">{heading}</h3>
        <button
          type="button"
          className="tg-btn tg-btn--icon"
          onClick={onCancel}
          title="Close"
          aria-label="Close form"
        >
          <X size={16} />
        </button>
      </div>

      <div className="tag-form__field">
        <label className="tag-form__label" htmlFor="tag-form-name">
          Name
        </label>
        <input
          id="tag-form-name"
          className="tag-form__input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="tag-form__field">
        <label className="tag-form__label" htmlFor="tag-form-hint">
          Search hint
        </label>
        <input
          id="tag-form-hint"
          className="tag-form__input"
          type="text"
          value={searchHint}
          onChange={(e) => setSearchHint(e.target.value)}
          required
        />
      </div>

      <div className="tag-form__row">
        <div className="tag-form__field">
          <label className="tag-form__label" htmlFor="tag-form-type">
            Type
          </label>
          <input
            id="tag-form-type"
            className="tag-form__input"
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
        </div>
        <div className="tag-form__field">
          <label className="tag-form__label" htmlFor="tag-form-parent">
            Parent
          </label>
          <select
            id="tag-form-parent"
            className="tag-form__select"
            value={parentId || ""}
            onChange={(e) =>
              setParentId(e.target.value ? parseInt(e.target.value) : null)
            }
          >
            <option value="">None</option>
            {parentOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="tag-form__field">
        <label className="tag-form__label" htmlFor="tag-form-config">
          Config (JSON)
        </label>
        <textarea
          id="tag-form-config"
          className="tag-form__textarea"
          value={config}
          onChange={(e) => setConfig(e.target.value)}
          rows={4}
          spellCheck={false}
        />
      </div>

      <div className="tag-form__actions">
        <button type="button" className="tg-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="tg-btn tg-btn--primary">
          {tag ? "Save changes" : "Create"}
        </button>
      </div>
    </form>
  );
};

export default TagForm;
