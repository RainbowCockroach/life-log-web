import React, { useState, useEffect } from "react";
import TagTree from "./TagTree";
import TagForm from "./TagForm";
import {
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
  type Tag,
  type CreateTagRequest,
} from "../services/api";

const TagsPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"tag" | "location">("tag");

  const loadTags = async () => {
    try {
      const fetchedTags = await fetchTags();
      setTags(fetchedTags);
    } catch {
      setError("Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleCreate = (type: "tag" | "location") => {
    setEditingTag(null);
    setFormType(type);
    setShowForm(true);
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormType(tag.type === "location" ? "location" : "tag");
    setShowForm(true);
  };

  const handleDelete = async (tagId: number) => {
    if (confirm("Are you sure you want to delete this tag?")) {
      try {
        await deleteTag(tagId);
        await loadTags();
      } catch {
        alert("Failed to delete tag");
      }
    }
  };

  const handleSave = async (tagData: CreateTagRequest) => {
    try {
      if (editingTag) {
        await updateTag(editingTag.id, tagData);
      } else {
        await createTag({ ...tagData, type: formType });
      }
      setShowForm(false);
      await loadTags();
    } catch {
      alert("Failed to save tag");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const regularTags = tags.filter((tag) => tag.type !== "location");
  const locationTags = tags.filter((tag) => tag.type === "location");

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Tags and Locations Management</h1>

      {showForm && (
        <TagForm
          tag={editingTag}
          allTags={tags}
          onSave={handleSave}
          onCancel={handleCancel}
          defaultType={formType}
        />
      )}

      <div>
        <div>
          <h2>Tags</h2>
          <button onClick={() => handleCreate("tag")}>Create New Tag</button>
          <TagTree
            tags={regularTags}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        <div>
          <h2>Locations</h2>
          <button onClick={() => handleCreate("location")}>
            Create New Location
          </button>
          <TagTree
            tags={locationTags}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default TagsPage;
