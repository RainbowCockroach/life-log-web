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

export default function MarkdownEditor({
  initialValue = "",
  onImageUpload,
  onChange,
  onSave,
  isSaving = false,
  urlTransform = (url) => url,
}: MarkdownEditorProps) {
  const [content, setContent] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update content when initialValue changes (e.g., loading a saved entry)
  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue);
    onChange?.(newValue);
  };

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);

    setContent(newText);
    onChange?.(newText);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleSave = () => {
    onSave?.(content);
  };

  const handleBold = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    // Check if the selected text is already bold
    const beforeSelection = content.substring(Math.max(0, start - 2), start);
    const afterSelection = content.substring(
      end,
      Math.min(content.length, end + 2)
    );

    if (beforeSelection === "**" && afterSelection === "**") {
      // Remove bold formatting
      const newContent =
        content.substring(0, start - 2) +
        selectedText +
        content.substring(end + 2);

      setContent(newContent);
      onChange?.(newContent);

      // Restore focus and selection
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start - 2, end - 2);
      }, 0);
    } else {
      // Add bold formatting
      insertText("**", "**");
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (onImageUpload) {
      try {
        // Call custom handler - returns filenames (not full URLs)
        const filenames = await onImageUpload(files);

        // Insert markdown image syntax with filenames only
        const imageMarkdown = filenames.map((filename) => `![image](${filename})`).join("\n");
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const newContent =
          content.substring(0, start) +
          "\n" +
          imageMarkdown +
          "\n" +
          content.substring(start);

        setContent(newContent);
        onChange?.(newContent);
      } catch (error) {
        console.error("Image upload failed:", error);
      }
    }

    // Reset input
    e.target.value = "";
  };

  return (
    <div style={{ display: "flex", gap: "16px", height: "100%" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <button onClick={handleBold} style={{ padding: "4px 12px" }}>
            Bold
          </button>
          <label
            style={{
              padding: "4px 12px",
              cursor: "pointer",
              border: "1px solid #ccc",
            }}
          >
            Image
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </label>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: "4px 12px",
              opacity: isSaving ? 0.6 : 1,
              cursor: isSaving ? "not-allowed" : "pointer",
            }}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          style={{
            flex: 1,
            padding: "8px",
            fontFamily: "monospace",
            fontSize: "14px",
            resize: "none",
            border: "1px solid #ccc",
          }}
          placeholder="Write your markdown here..."
        />
      </div>
      <div
        style={{
          flex: 1,
          padding: "8px",
          border: "1px solid #ccc",
          overflow: "auto",
        }}
      >
        <Markdown urlTransform={urlTransform}>{content}</Markdown>
      </div>
    </div>
  );
}
