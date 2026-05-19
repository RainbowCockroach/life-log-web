import React, { useState, useEffect } from "react";
import { Plus, Tag as TagIcon, MapPin } from "lucide-react";
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
import "./TagsPage.css";

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

  if (loading) {
    return (
      <div className="page-container">
        <div className="tags-page__empty">Loading…</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="page-container">
        <div className="tags-page__message">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-container tags-page">
      <h1 className="tags-page__title">Tags &amp; Locations</h1>

      {showForm && (
        <TagForm
          tag={editingTag}
          allTags={tags}
          onSave={handleSave}
          onCancel={handleCancel}
          defaultType={formType}
        />
      )}

      <section className="tags-page__section">
        <div className="tags-page__section-header">
          <h2 className="tags-page__section-title">
            <TagIcon size={14} aria-hidden />
            Tags
            <span className="tags-page__section-count">
              {regularTags.length}
            </span>
          </h2>
          <span className="tags-page__section-spacer" />
          <button
            type="button"
            className="tg-btn tg-btn--primary"
            onClick={() => handleCreate("tag")}
            title="Create new tag"
            aria-label="Create new tag"
          >
            <Plus size={14} />
            <span className="tg-btn__label">New tag</span>
          </button>
        </div>
        <TagTree
          tags={regularTags}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </section>

      <section className="tags-page__section">
        <div className="tags-page__section-header">
          <h2 className="tags-page__section-title">
            <MapPin size={14} aria-hidden />
            Locations
            <span className="tags-page__section-count">
              {locationTags.length}
            </span>
          </h2>
          <span className="tags-page__section-spacer" />
          <button
            type="button"
            className="tg-btn tg-btn--primary"
            onClick={() => handleCreate("location")}
            title="Create new location"
            aria-label="Create new location"
          >
            <Plus size={14} />
            <span className="tg-btn__label">New location</span>
          </button>
        </div>
        <TagTree
          tags={locationTags}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </section>
    </div>
  );
};

export default TagsPage;
