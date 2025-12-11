import React, { useState } from "react";
import type { Tag, CreateTagRequest } from "../services/api";

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
  const [config, setConfig] = useState(
    tag?.config ? JSON.stringify(tag.config) : "{}"
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

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "8px" }}
    >
      <label>
        Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <label>
        Search Hint:
        <input
          type="text"
          value={searchHint}
          onChange={(e) => setSearchHint(e.target.value)}
          required
        />
      </label>
      <label>
        Type:
        <input
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
      </label>
      <label>
        Config (JSON):
        <textarea
          value={config}
          onChange={(e) => setConfig(e.target.value)}
          rows={3}
        />
      </label>
      <label>
        Parent:
        <select
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
      </label>
      <div style={{ display: "flex", gap: "8px" }}>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TagForm;
