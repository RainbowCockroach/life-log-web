import { useState, useEffect, useCallback } from 'react';
import MarkdownEditor from './components/MarkdownEditor';
import ApiKeyModal from './components/ApiKeyModal';
import { saveContent, uploadImages, getSignedUrls } from './services/api';
import { processImages } from './utils/imageUtils';
import { hasApiKey, saveApiKey, getApiKey } from './utils/apiKeyStorage';
import { API_CONFIG } from './config/constants';

function App() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadedImagePaths, setUploadedImagePaths] = useState<string[]>([]);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [content, setContent] = useState('');
  const [imageUrlMap, setImageUrlMap] = useState<Map<string, string>>(new Map());

  // Check for API key on mount
  useEffect(() => {
    if (!hasApiKey()) {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  const handleImageUpload = async (files: File[]): Promise<string[]> => {
    try {
      // Step 1: Compress and rename images
      const processedImages = await processImages(files);

      console.log('Processed images:', processedImages);
      console.log('Compression stats:');
      processedImages.forEach((img, i) => {
        console.log(`  ${i + 1}. ${img.originalName} → ${img.newName} (${(img.size / 1024).toFixed(2)} KB)`);
      });

      // Step 2: Upload to server using the API service
      const uploadedFiles = processedImages.map((img) => img.file);
      const uploadResults = await uploadImages(uploadedFiles);

      console.log('Upload results:', uploadResults);

      // Track the uploaded image paths for saving with the entry
      const newPaths = uploadResults.map((result) => result.path);
      setUploadedImagePaths((prev) => [...prev, ...newPaths]);

      // Store signed URLs in the map for immediate preview
      const newMap = new Map(imageUrlMap);
      uploadResults.forEach((result) => {
        newMap.set(result.filename || result.path, `${API_CONFIG.BASE_URL}${result.url}`);
      });
      setImageUrlMap(newMap);

      // Return filenames (not URLs) to insert in markdown
      return uploadResults.map((result) => result.filename || result.path);
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  };

  const handleContentChange = (newContent: string) => {
    console.log('Content changed:', newContent);
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
      const filename = url.split('/').pop() || url;
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
          const url = new URL(existingUrl, API_CONFIG.BASE_URL);
          const expires = parseInt(url.searchParams.get('expires') || '0');
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
          newMap.set(result.filename, `${API_CONFIG.BASE_URL}${result.url}`);
        });
        setImageUrlMap(newMap);
      } catch (error) {
        console.error('Failed to fetch signed URLs:', error);
      }
    };

    fetchSignedUrls();
  }, [content, extractImageFilenames]);

  // URL transform function for Markdown component
  const urlTransform = useCallback((url: string): string => {
    // If it's already a full URL, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's a filename, look up the signed URL
    const signedUrl = imageUrlMap.get(url);
    return signedUrl || url;
  }, [imageUrlMap]);

  const handleApiKeySave = (apiKey: string) => {
    saveApiKey(apiKey);
    setSuccessMessage('API key saved successfully');
  };

  const handleSave = async (content: string) => {
    // Check if API key exists before saving
    if (!hasApiKey()) {
      setError('API key not configured. Please set your API key first.');
      setIsApiKeyModalOpen(true);
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Generate search hint from content (remove markdown syntax for better search)
      const searchHint = content
        .replace(/[#*_~`\[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

      const response = await saveContent({
        content,
        searchHint,
        mediaPaths: uploadedImagePaths.length > 0 ? uploadedImagePaths : undefined,
      });

      if (response.success) {
        setSuccessMessage(`${response.message} (ID: ${response.id})`);
        console.log('Save successful:', response);
        // Clear uploaded images after successful save
        setUploadedImagePaths([]);
      } else {
        setError('Failed to save content');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '20px', height: '100vh', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Markdown Editor</h1>
        <button
          onClick={() => setIsApiKeyModalOpen(true)}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: hasApiKey() ? '#28a745' : '#ffc107',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          {hasApiKey() ? 'Update API Key' : 'Set API Key'}
        </button>
      </div>

      {/* Status messages */}
      {error && (
        <div
          style={{
            padding: '8px 12px',
            marginBottom: '12px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c00',
          }}
        >
          Error: {error}
        </div>
      )}
      {successMessage && (
        <div
          style={{
            padding: '8px 12px',
            marginBottom: '12px',
            backgroundColor: '#efe',
            border: '1px solid #cfc',
            borderRadius: '4px',
            color: '#060',
          }}
        >
          {successMessage}
        </div>
      )}

      <div style={{ height: 'calc(100% - 60px)' }}>
        <MarkdownEditor
          initialValue={content}
          onImageUpload={handleImageUpload}
          onChange={handleContentChange}
          onSave={handleSave}
          isSaving={isSaving}
          urlTransform={urlTransform}
        />
      </div>

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleApiKeySave}
        currentApiKey={getApiKey() || ''}
      />
    </div>
  );
}

export default App;
