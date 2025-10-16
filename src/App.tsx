import { useState } from 'react';
import MarkdownEditor from './components/MarkdownEditor';
import { saveContent, uploadImages } from './services/api';
import { processImages } from './utils/imageUtils';

function App() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleImageUpload = async (files: File[]): Promise<string[]> => {
    try {
      // Step 1: Compress and rename images
      // You can customize the URL prefix based on your server setup
      const urlPrefix = '/uploads/'; // or 'https://yourdomain.com/images/'
      const processedImages = await processImages(files, urlPrefix);

      console.log('Processed images:', processedImages);
      console.log('Compression stats:');
      processedImages.forEach((img, i) => {
        console.log(`  ${i + 1}. ${img.originalName} → ${img.newName} (${(img.size / 1024).toFixed(2)} KB)`);
      });

      // Step 2: Upload to server using the API service
      const uploadedFiles = processedImages.map((img) => img.file);
      const uploadResults = await uploadImages(uploadedFiles);

      console.log('Upload results:', uploadResults);

      // Return the URLs from the server response
      // In production, use the URLs returned by your server
      return uploadResults.map((result) => result.url);

      // Alternative: If you prefer direct fetch without using the API service:
      // const uploadPromises = processedImages.map(async (img) => {
      //   const formData = new FormData();
      //   formData.append('file', img.file);
      //   const response = await fetch('/api/images/upload', {
      //     method: 'POST',
      //     body: formData,
      //   });
      //   const data = await response.json();
      //   return data.url;
      // });
      // return Promise.all(uploadPromises);
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  };

  const handleContentChange = (content: string) => {
    console.log('Content changed:', content);
    // Clear messages when content changes
    setError(null);
    setSuccessMessage(null);
  };

  const handleSave = async (content: string) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await saveContent(content);

      if (response.success) {
        setSuccessMessage(response.message);
        console.log('Save successful:', response);
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
      <h1 style={{ margin: '0 0 20px 0' }}>Markdown Editor</h1>

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
          onImageUpload={handleImageUpload}
          onChange={handleContentChange}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}

export default App;
