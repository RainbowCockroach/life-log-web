import { useState, useRef, type ChangeEvent, useEffect } from "react";
import Markdown from "react-markdown";

interface MarkdownEditorProps {
  initialValue?: string;
  onImageUpload?: (files: File[]) => Promise<string[]>;
  onChange?: (value: string) => void;
  onSave?: (content: string) => void;
  isSaving?: boolean;
  urlTransform?: (url: string) => string;
}

// Helper function to convert single newlines to markdown hard breaks
const convertToMarkdownLineBreaks = (text: string): string => {
  // Split by double newlines to preserve paragraph breaks
  const paragraphs = text.split("\n\n");

  // For each paragraph, add two spaces before single newlines
  const processedParagraphs = paragraphs.map((paragraph) => {
    // Split by single newlines
    const lines = paragraph.split("\n");
    // Join with two spaces + newline (markdown hard break)
    return lines.join("  \n");
  });

  // Rejoin paragraphs with double newlines
  return processedParagraphs.join("\n\n");
};

export default function MarkdownEditor({
  initialValue = "",
  onImageUpload,
  onChange,
  onSave,
  isSaving = false,
  urlTransform = (url) => url,
}: MarkdownEditorProps) {
  const [content, setContent] = useState(initialValue);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isInitialLoad = useRef(true);
  const lastInitialValue = useRef(initialValue);

  // Only update content when initialValue changes from external sources (like loading a saved entry)
  // Avoid updating during normal typing to prevent cursor jumping
  useEffect(() => {
    // On initial mount, always set the content
    if (isInitialLoad.current) {
      setContent(initialValue);
      lastInitialValue.current = initialValue;
      isInitialLoad.current = false;
      return;
    }

    // Only update if the initialValue is significantly different from what we last saw
    // This prevents the cursor jumping issue during normal typing
    if (initialValue !== lastInitialValue.current) {
      // Check if this is a real external change (like loading a different entry)
      // vs. just the processed version of what the user typed
      const currentProcessed = convertToMarkdownLineBreaks(content);

      // If the new initialValue is very different from our current content,
      // it's likely an external change (like loading a saved entry)
      if (initialValue !== currentProcessed && initialValue !== content) {
        setContent(initialValue);
        lastInitialValue.current = initialValue;
      }
    }
  }, [initialValue]);

  // Auto-focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue);

    // Convert single line breaks to markdown hard breaks (two spaces + newline)
    // This ensures that when user presses Enter, it creates a new line in the rendered markdown
    const markdownValue = convertToMarkdownLineBreaks(newValue);
    onChange?.(markdownValue);
  };


  const handleSave = () => {
    onSave?.(content);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    // Capture cursor position before upload starts
    const insertPosition = textarea.selectionStart;

    // Generate unique timestamp for this upload batch
    const uploadId = Date.now();

    // Create placeholder text for each file
    const placeholderData = files.map((file, i) => ({
      file,
      placeholder: `![Uploading ${file.name}...](uploading-${uploadId}-${i})`,
    }));

    const placeholders = placeholderData.map((p) => p.placeholder).join("\n");

    // Insert placeholders immediately at cursor position
    const contentWithPlaceholders =
      content.substring(0, insertPosition) +
      "\n" +
      placeholders +
      "\n" +
      content.substring(insertPosition);

    setContent(contentWithPlaceholders);
    const markdownValue = convertToMarkdownLineBreaks(contentWithPlaceholders);
    onChange?.(markdownValue);

    // Move cursor to after the placeholders so user can continue typing
    const newCursorPosition = insertPosition + placeholders.length + 2; // +2 for newlines
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);

    if (onImageUpload) {
      try {
        // Call custom handler - returns filenames (not full URLs)
        const filenames = await onImageUpload(files);

        // Replace placeholders with actual filenames using functional update
        // This ensures we work with the latest content (user may have typed more)
        setContent((currentContent) => {
          let updatedContent = currentContent;
          placeholderData.forEach((item, i) => {
            const actualMarkdown = `![image](${filenames[i]})`;
            updatedContent = updatedContent.replace(
              item.placeholder,
              actualMarkdown
            );
          });
          const markdownValue = convertToMarkdownLineBreaks(updatedContent);
          onChange?.(markdownValue);
          return updatedContent;
        });
      } catch (error) {
        console.error("Image upload failed:", error);

        // Remove placeholders on error using functional update
        setContent((currentContent) => {
          let contentWithoutPlaceholders = currentContent;
          placeholderData.forEach((item) => {
            contentWithoutPlaceholders = contentWithoutPlaceholders.replace(
              item.placeholder + "\n",
              ""
            );
          });
          const markdownValue = convertToMarkdownLineBreaks(
            contentWithoutPlaceholders
          );
          onChange?.(markdownValue);
          return contentWithoutPlaceholders;
        });
      }
    }

    // Reset input
    e.target.value = "";
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        id="markdown-editor"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <textarea
          id="markdown-edit-textarea"
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          style={{
            flex: 1,
            resize: "none",
            minHeight: 0,
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            lineHeight: "1.6",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
          placeholder="Write your markdown here..."
        />
        <div id="editor-button-bar" style={{ padding: "8px 0" }}>
          <label>
            Image
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </label>
          <button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
        </div>
      </div>
      {showPreview && (
        <div
          id="markdown-preview"
          style={{
            flex: 1,
            overflowY: "auto",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "12px",
            minHeight: 0,
          }}
        >
          <style>{`
            #markdown-preview img {
              max-width: 100%;
              height: auto;
              display: block;
              margin: 8px 0;
            }
          `}</style>
          <Markdown urlTransform={urlTransform}>{content}</Markdown>
        </div>
      )}
    </div>
  );
}
