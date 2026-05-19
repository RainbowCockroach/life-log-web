import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Tag } from "../services/api";

interface TagTreeProps {
  tags: Tag[];
  onEdit: (tag: Tag) => void;
  onDelete: (tagId: number) => void;
}

interface TagNodeProps {
  tag: Tag;
  onEdit: (tag: Tag) => void;
  onDelete: (tagId: number) => void;
}

const TagNode: React.FC<TagNodeProps> = ({ tag, onEdit, onDelete }) => {
  const markerColor =
    tag.config && typeof tag.config === "object" && "backgroundColor" in tag.config
      ? (tag.config as { backgroundColor?: string }).backgroundColor
      : undefined;

  return (
    <li className="tag-node">
      <div className="tag-node__row">
        <span
          className="tag-node__marker"
          style={markerColor ? { background: markerColor } : undefined}
          aria-hidden
        />
        <span className="tag-node__name">{tag.name}</span>
        <span className="tag-node__actions">
          <button
            type="button"
            className="tg-btn tg-btn--icon"
            onClick={() => onEdit(tag)}
            title="Edit"
            aria-label={`Edit ${tag.name}`}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            className="tg-btn tg-btn--icon tg-btn--danger"
            onClick={() => onDelete(tag.id)}
            title="Delete"
            aria-label={`Delete ${tag.name}`}
          >
            <Trash2 size={14} />
          </button>
        </span>
      </div>
      {tag.children && tag.children.length > 0 && (
        <ul className="tag-tree tag-tree--nested">
          {tag.children.map((child) => (
            <TagNode
              key={child.id}
              tag={child}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const TagTree: React.FC<TagTreeProps> = ({ tags, onEdit, onDelete }) => {
  const buildTree = (allTags: Tag[]): Tag[] => {
    const tagMap = new Map<number, Tag>();
    allTags.forEach((tag) => tagMap.set(tag.id, { ...tag, children: [] }));

    const rootTags: Tag[] = [];

    allTags.forEach((tag) => {
      const tagWithChildren = tagMap.get(tag.id)!;
      if (tag.parent) {
        const parent = tagMap.get(tag.parent.id);
        if (parent) {
          parent.children!.push(tagWithChildren);
        } else {
          rootTags.push(tagWithChildren);
        }
      } else {
        rootTags.push(tagWithChildren);
      }
    });

    return rootTags;
  };

  const rootTags = buildTree(tags);

  if (rootTags.length === 0) {
    return <div className="tags-page__empty">No entries yet</div>;
  }

  return (
    <ul className="tag-tree">
      {rootTags.map((tag) => (
        <TagNode key={tag.id} tag={tag} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
};

export default TagTree;
