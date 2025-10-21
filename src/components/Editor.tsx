import { useState, useEffect, useCallback } from "react";
import MarkdownEditor from "./MarkdownEditor";
import TagAutocomplete from "./TagAutocomplete";
import {
  saveContent,
  uploadImages,
  getSignedUrls,
  type Tag,
} from "../services/api";
import { processImages } from "../utils/imageUtils";
import { API_CONFIG } from "../config/constants";

export default function Editor() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadedImagePaths, setUploadedImagePaths] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [locationTag, setLocationTag] = useState<Tag | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [imageUrlMap, setImageUrlMap] = useState<Map<string, string>>(
    new Map()
  );

  const handleImageUpload = async (files: File[]): Promise<string[]> => {
    try {
      // Step 1: Compress and rename images
      const processedImages = await processImages(files);

      console.log("Processed images:", processedImages);
      console.log("Compression stats:");
      processedImages.forEach((img, i) => {
        console.log(
          `  ${i + 1}. ${img.originalName} → ${img.newName} (${(
            img.size / 1024
          ).toFixed(2)} KB)`
        );
      });

      // Step 2: Upload to server using the API service
      const uploadedFiles = processedImages.map((img) => img.file);
      const uploadResults = await uploadImages(uploadedFiles);

      console.log("Upload results:", uploadResults);

      // Track the uploaded image paths for saving with the entry
      const newPaths = uploadResults.map((result) => result.path);
      setUploadedImagePaths((prev) => [...prev, ...newPaths]);

      // Store signed URLs in the map for immediate preview
      const newMap = new Map(imageUrlMap);
      uploadResults.forEach((result) => {
        newMap.set(
          result.filename || result.path,
          `${API_CONFIG.API_BASE_URL}${result.url}`
        );
      });
      setImageUrlMap(newMap);

      // Return filenames (not URLs) to insert in markdown
      return uploadResults.map((result) => result.filename || result.path);
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    }
  };

  const handleContentChange = (newContent: string) => {
    console.log("Content changed:", newContent);
    setContent(newContent);
    // Clear messages when content changes
    setError(null);
    setSuccessMessage(null);
  };

  // Extract image filenames from markdown content
  const extractImageFilenames = useCallback((markdown: string): string[] => {
    const imageRegex = /!\[.*?\]\(([^)]+)\)/g;
    const filenames: string[] = [];
    let match;

    while ((match = imageRegex.exec(markdown)) !== null) {
      const url = match[1];
      // Extract just the filename (handle both relative and absolute URLs)
      const filename = url.split("/").pop() || url;

      // Skip uploading placeholders
      if (filename && filename.startsWith("uploading-")) {
        continue;
      }

      // Only include if it looks like a timestamp-based filename
      if (filename && /^\d+\.\w+/.test(filename)) {
        filenames.push(filename);
      }
    }

    return [...new Set(filenames)]; // Remove duplicates
  }, []);

  // Pre-fetch signed URLs when content changes
  useEffect(() => {
    const fetchSignedUrls = async () => {
      if (!content) return;

      const filenames = extractImageFilenames(content);
      if (filenames.length === 0) return;

      // Filter out filenames we already have valid URLs for
      const missingFilenames = filenames.filter((filename) => {
        const existingUrl = imageUrlMap.get(filename);
        if (!existingUrl) return true;

        // Check if URL has expired by parsing the expires query param
        try {
          const url = new URL(existingUrl, API_CONFIG.API_BASE_URL);
          const expires = parseInt(url.searchParams.get("expires") || "0");
          return Date.now() > expires - 60000; // Refresh if less than 1 minute left
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
            `${API_CONFIG.API_BASE_URL}${result.url}`
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

  // URL transform function for Markdown component
  const urlTransform = useCallback(
    (url: string): string => {
      // If it's already a full URL, return as-is
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
      }

      // If it's an uploading placeholder, return a data URL for a loading indicator
      if (url.startsWith("uploading-")) {
        // Return a transparent 1x1 pixel (or you could use a loading spinner image)
        return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ctext x="10" y="50" font-size="12"%3EUploading...%3C/text%3E%3C/svg%3E';
      }

      // If it's a filename, look up the signed URL
      const signedUrl = imageUrlMap.get(url);
      return signedUrl || url;
    },
    [imageUrlMap]
  );

  const handleSave = async (content: string) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Generate search hint from content (remove markdown syntax for better search)
      const searchHint = content
        .replace(/[#*_~`\[\]()]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

      const response = await saveContent({
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

      if (response.success) {
        setSuccessMessage(`${response.message} (ID: ${response.id})`);
        console.log("Save successful:", response);
        // Clear uploaded images, location, and tags after successful save
        setUploadedImagePaths([]);
        setLocationTag(null);
        setSelectedTags([]);
      } else {
        setError("Failed to save content");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred while saving"
      );
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ height: "100vh" }}>
      <h1>Markdown Editor</h1>

      {/* Status messages */}
      {error && <div>Error: {error}</div>}
      {successMessage && <div>{successMessage}</div>}

      {/* Tags field */}
      <TagAutocomplete
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
      />

      {/* Location field */}
      <TagAutocomplete
        selectedTags={locationTag ? [locationTag] : []}
        onTagsChange={(tags) => setLocationTag(tags[0] || null)}
        tagType="location"
        label="Location"
        placeholder="Enter location (optional)..."
        defaultColor="#10b981"
        singleSelect={true}
      />

      <div style={{ height: "calc(100% - 200px)" }}>
        <MarkdownEditor
          initialValue={content}
          onImageUpload={handleImageUpload}
          onChange={handleContentChange}
          onSave={handleSave}
          isSaving={isSaving}
          urlTransform={urlTransform}
        />
      </div>
    </div>
  );
}
