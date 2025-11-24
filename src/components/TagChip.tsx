import type { Tag as TagType } from "../services/api";

interface TagProps {
  tag: TagType | { id: number; name: string };
  onRemove?: (tagId: number) => void;
}

export default function TagChip({ tag, onRemove }: TagProps) {
  const backgroundColor =
    "config" in tag && tag.config?.backgroundColor
      ? tag.config.backgroundColor
      : "#e0e0e0";
  const textColor =
    "config" in tag && tag.config?.textColor ? tag.config.textColor : "#000";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 8px",
        borderRadius: "4px",
        fontSize: "13px",
        backgroundColor,
        color: textColor,
      }}
    >
      <span>{tag.name}</span>
      {onRemove && (
        <button
          onClick={() => onRemove(tag.id)}
          style={{
            marginLeft: "6px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0",
            fontSize: "16px",
            color: textColor,
            opacity: 0.7,
          }}
          aria-label={`Remove ${tag.name}`}
        >
          &times;
        </button>
      )}
    </div>
  );
}
