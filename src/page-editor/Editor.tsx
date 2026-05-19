import { useState, useEffect, useCallback } from "react";
import { Tags, CalendarClock, X } from "lucide-react";
import {
  saveContent,
  uploadImages,
  getSignedUrls,
  getLatestLocation,
  fetchEntry,
  updateEntry,
  type Tag,
} from "../services/api";
import { processImages } from "../utils/imageUtils";
import { API_CONFIG } from "../config/constants";
import "./Editor.css";
import TagAutocomplete from "./TagAutocomplete";
import MarkdownEditor from "./MarkdownEditor";

interface EditorProps {
  entryId?: number;
  onSaveSuccess?: () => void;
}

const ICON_SIZE = 16;

export default function Editor({ entryId, onSaveSuccess }: EditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadedImagePaths, setUploadedImagePaths] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [locationTag, setLocationTag] = useState<Tag | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [imageUrlMap, setImageUrlMap] = useState<Map<string, string>>(
    new Map(),
  );
  const [showTagsSection, setShowTagsSection] = useState(false);
  const [showDateTimeSection, setShowDateTimeSection] = useState(false);
  const [customDateTime, setCustomDateTime] = useState<string>("");

  useEffect(() => {
    const loadEntryData = async () => {
      if (entryId) {
        try {
          const entry = await fetchEntry(entryId);
          setContent(entry.content);
          setLocationTag(entry.location || null);
          setSelectedTags(
            (entry.tags || []).map((tag) => ({
              ...tag,
              searchHint: "",
              type: "tag",
              config: {},
            })),
          );
          setUploadedImagePaths(entry.mediaPaths || []);
        } catch (error) {
          console.error("Failed to load entry:", error);
          setError("Failed to load entry for editing");
        }
      } else {
        try {
          const latestLocation = await getLatestLocation();
          if (latestLocation) {
            setLocationTag(latestLocation);
          }
        } catch (error) {
          console.error("Failed to load latest location:", error);
        }
      }
    };

    loadEntryData();
  }, [entryId]);

  const handleImageUpload = async (files: File[]): Promise<string[]> => {
    try {
      const processedImages = await processImages(files);
      const uploadedFiles = processedImages.map((img) => img.file);
      const uploadResults = await uploadImages(uploadedFiles);

      const newPaths = uploadResults.map((result) => result.path);
      setUploadedImagePaths((prev) => [...prev, ...newPaths]);

      const newMap = new Map(imageUrlMap);
      uploadResults.forEach((result) => {
        newMap.set(
          result.filename || result.path,
          `${API_CONFIG.API_BASE_URL}${result.url}`,
        );
      });
      setImageUrlMap(newMap);

      return uploadResults.map((result) => result.filename || result.path);
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setError(null);
    setSuccessMessage(null);
  };

  const extractImageFilenames = useCallback((markdown: string): string[] => {
    const imageRegex = /!\[.*?\]\(([^)]+)\)/g;
    const filenames: string[] = [];
    let match;

    while ((match = imageRegex.exec(markdown)) !== null) {
      const url = match[1];
      const filename = url.split("/").pop() || url;
      if (filename && filename.startsWith("uploading-")) continue;
      if (filename && /^\d+\.\w+/.test(filename)) filenames.push(filename);
    }

    return [...new Set(filenames)];
  }, []);

  useEffect(() => {
    const fetchSignedUrls = async () => {
      if (!content) return;
      const filenames = extractImageFilenames(content);
      if (filenames.length === 0) return;

      const missingFilenames = filenames.filter((filename) => {
        const existingUrl = imageUrlMap.get(filename);
        if (!existingUrl) return true;
        try {
          const url = new URL(existingUrl, API_CONFIG.API_BASE_URL);
          const expires = parseInt(url.searchParams.get("expires") || "0");
          return Date.now() > expires - 60000;
        } catch {
          return true;
        }
      });

      if (missingFilenames.length === 0) return;

      try {
        const signedUrls = await getSignedUrls(missingFilenames);
        const newMap = new Map(imageUrlMap);
        signedUrls.forEach((result) => {
          newMap.set(
            result.filename,
            `${API_CONFIG.API_BASE_URL}${result.url}`,
          );
        });
        setImageUrlMap(newMap);
      } catch (error) {
        console.error("Failed to fetch signed URLs:", error);
      }
    };

    fetchSignedUrls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, extractImageFilenames]);

  const handleSave = async (content: string) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    if (!locationTag) {
      setError("Location is required");
      setIsSaving(false);
      return;
    }

    try {
      const cleanContent = content
        .replace(/!\[.*?\]\(.*?\)/g, " ")
        .replace(/[#*_~`[\]()]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const withDiacritics = cleanContent.toLocaleLowerCase("vi");
      const withoutDiacritics = cleanContent
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase();

      const searchHint = `${withDiacritics} ${withoutDiacritics}`.trim();

      if (entryId) {
        await updateEntry(entryId, {
          content,
          searchHint,
          locationId: locationTag?.id,
          tagIds:
            selectedTags.length > 0
              ? selectedTags.map((tag) => tag.id)
              : undefined,
          mediaPaths:
            uploadedImagePaths.length > 0 ? uploadedImagePaths : undefined,
        });
        setSuccessMessage(`Entry updated (ID: ${entryId})`);
        if (onSaveSuccess) onSaveSuccess();
      } else {
        let customId: number | undefined;
        let createdAtISO: string | undefined;
        if (customDateTime) {
          const dateObj = new Date(customDateTime);
          customId = dateObj.getTime();
          createdAtISO = dateObj.toISOString();
        }

        const response = await saveContent({
          id: customId,
          content,
          searchHint,
          locationId: locationTag?.id,
          tagIds:
            selectedTags.length > 0
              ? selectedTags.map((tag) => tag.id)
              : undefined,
          mediaPaths:
            uploadedImagePaths.length > 0 ? uploadedImagePaths : undefined,
          createdAt: createdAtISO,
        });

        if (response.success) {
          setSuccessMessage(`${response.message} (ID: ${response.id})`);
          setUploadedImagePaths([]);
          setLocationTag(null);
          setSelectedTags([]);
          setCustomDateTime("");
        } else {
          setError("Failed to save content");
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred while saving",
      );
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-container editor-page">
      <div className="editor-toolbar">
        <button
          type="button"
          className="ed-btn"
          aria-pressed={showTagsSection}
          onClick={() => setShowTagsSection((v) => !v)}
          title="Tags"
          aria-label="Toggle tags"
        >
          <Tags size={ICON_SIZE} />
          <span>Tags</span>
          {selectedTags.length > 0 && <span>· {selectedTags.length}</span>}
        </button>

        {!entryId && (
          <button
            type="button"
            className="ed-btn"
            aria-pressed={showDateTimeSection}
            onClick={() => setShowDateTimeSection((v) => !v)}
            title="Date / time"
            aria-label="Toggle date and time"
          >
            <CalendarClock size={ICON_SIZE} />
            <span>Date</span>
          </button>
        )}
      </div>

      {error && (
        <div className="editor-message editor-message--error" role="alert">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="editor-message editor-message--success" role="status">
          {successMessage}
        </div>
      )}

      <div className="editor-fields">
        {showTagsSection && (
          <TagAutocomplete
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
        )}

        {!entryId && showDateTimeSection && (
          <div className="editor-field">
            <label htmlFor="custom-datetime" className="editor-field__label">
              When
            </label>
            <input
              id="custom-datetime"
              type="datetime-local"
              value={customDateTime}
              onChange={(e) => setCustomDateTime(e.target.value)}
              className="editor-datetime"
            />
            {customDateTime && (
              <button
                type="button"
                className="ed-btn ed-btn--icon"
                onClick={() => setCustomDateTime("")}
                title="Clear date"
                aria-label="Clear date"
              >
                <X size={ICON_SIZE} />
              </button>
            )}
          </div>
        )}

        <TagAutocomplete
          selectedTags={locationTag ? [locationTag] : []}
          onTagsChange={(tags) => setLocationTag(tags[0] || null)}
          tagType="location"
          label="Location *"
          placeholder="Enter location (required)..."
          defaultColor="#10b981"
          singleSelect={true}
        />
      </div>

      <div className="editor-main">
        <MarkdownEditor
          initialValue={content}
          onImageUpload={handleImageUpload}
          onChange={handleContentChange}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}
