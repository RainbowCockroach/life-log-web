import { useState, useRef, type ChangeEvent, useEffect } from "react";
import { ImagePlus, Link2, Save, Loader2 } from "lucide-react";

interface MarkdownEditorProps {
  initialValue?: string;
  onImageUpload?: (files: File[]) => Promise<string[]>;
  onChange?: (value: string) => void;
  onSave?: (content: string) => void;
  isSaving?: boolean;
}

const ICON_SIZE = 16;

const convertToMarkdownLineBreaks = (text: string): string => {
  const paragraphs = text.split("\n\n");
  const processedParagraphs = paragraphs.map((paragraph) => {
    const lines = paragraph.split("\n");
    return lines.join("  \n");
  });
  return processedParagraphs.join("\n\n");
};

export default function MarkdownEditor({
  initialValue = "",
  onImageUpload,
  onChange,
  onSave,
  isSaving = false,
}: MarkdownEditorProps) {
  const [content, setContent] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastInitialValue = useRef(initialValue);

  useEffect(() => {
    if (initialValue !== lastInitialValue.current) {
      const currentProcessed = convertToMarkdownLineBreaks(content);
      if (initialValue !== currentProcessed && initialValue !== content) {
        setContent(initialValue);
        lastInitialValue.current = initialValue;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue);
    const markdownValue = convertToMarkdownLineBreaks(newValue);
    onChange?.(markdownValue);
  };

  const handleSave = () => {
    onSave?.(content);
  };

  const handleAddLink = () => {
    const url = prompt("Enter URL:");
    if (!url) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const insertPosition = textarea.selectionStart;
    const linkCardMarkdown = `[🔗](${url})`;

    const updatedContent =
      content.substring(0, insertPosition) +
      "\n" +
      linkCardMarkdown +
      "\n" +
      content.substring(insertPosition);

    setContent(updatedContent);
    const markdownValue = convertToMarkdownLineBreaks(updatedContent);
    onChange?.(markdownValue);

    const newCursorPosition = insertPosition + linkCardMarkdown.length + 2;
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const insertPosition = textarea.selectionStart;
    const uploadId = Date.now();

    const placeholderData = files.map((file, i) => ({
      file,
      placeholder: `![Uploading ${file.name}...](uploading-${uploadId}-${i})`,
    }));

    const placeholders = placeholderData.map((p) => p.placeholder).join("\n");

    const contentWithPlaceholders =
      content.substring(0, insertPosition) +
      "\n" +
      placeholders +
      "\n" +
      content.substring(insertPosition);

    setContent(contentWithPlaceholders);
    const markdownValue = convertToMarkdownLineBreaks(contentWithPlaceholders);
    onChange?.(markdownValue);

    const newCursorPosition = insertPosition + placeholders.length + 2;
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);

    if (onImageUpload) {
      try {
        const filenames = await onImageUpload(files);
        setContent((currentContent) => {
          let updatedContent = currentContent;
          placeholderData.forEach((item, i) => {
            const actualMarkdown = `![image](${filenames[i]})`;
            updatedContent = updatedContent.replace(
              item.placeholder,
              actualMarkdown,
            );
          });
          const markdownValue = convertToMarkdownLineBreaks(updatedContent);
          onChange?.(markdownValue);
          return updatedContent;
        });
      } catch (error) {
        console.error("Image upload failed:", error);
        setContent((currentContent) => {
          let contentWithoutPlaceholders = currentContent;
          placeholderData.forEach((item) => {
            contentWithoutPlaceholders = contentWithoutPlaceholders.replace(
              item.placeholder + "\n",
              "",
            );
          });
          const markdownValue = convertToMarkdownLineBreaks(
            contentWithoutPlaceholders,
          );
          onChange?.(markdownValue);
          return contentWithoutPlaceholders;
        });
      }
    }

    e.target.value = "";
  };

  return (
    <>
      <textarea
        ref={textareaRef}
        className="editor-textarea"
        value={content}
        onChange={handleContentChange}
        placeholder="Write your markdown here..."
      />
      <div className="editor-actions">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
        <button
          type="button"
          className="ed-btn ed-btn--icon"
          onClick={() => fileInputRef.current?.click()}
          title="Insert image"
          aria-label="Insert image"
        >
          <ImagePlus size={ICON_SIZE} />
        </button>
        <button
          type="button"
          className="ed-btn ed-btn--icon"
          onClick={handleAddLink}
          title="Insert link"
          aria-label="Insert link"
        >
          <Link2 size={ICON_SIZE} />
        </button>
        <div className="editor-toolbar__spacer" />
        <button
          type="button"
          className="ed-btn ed-btn--primary"
          onClick={handleSave}
          disabled={isSaving}
          title={isSaving ? "Saving..." : "Save entry"}
          aria-label="Save entry"
        >
          {isSaving ? (
            <Loader2 size={ICON_SIZE} className="ed-spin" />
          ) : (
            <Save size={ICON_SIZE} />
          )}
          <span>{isSaving ? "Saving…" : "Save"}</span>
        </button>
      </div>
    </>
  );
}
