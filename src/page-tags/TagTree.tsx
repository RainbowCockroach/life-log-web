import React from "react";
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
  return (
    <li>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span>{tag.name}</span>
        <button onClick={() => onEdit(tag)}>Edit</button>
        <button onClick={() => onDelete(tag.id)}>Delete</button>
      </div>
      {tag.children && tag.children.length > 0 && (
        <ul>
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
  // Build tree from flat tags list
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
        }
      } else {
        rootTags.push(tagWithChildren);
      }
    });

    return rootTags;
  };

  const rootTags = buildTree(tags);

  return (
    <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
      {rootTags.map((tag) => (
        <TagNode key={tag.id} tag={tag} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
};

export default TagTree;
