// API service for markdown content operations
import { getApiKey } from '../utils/apiKeyStorage';
import { API_CONFIG } from '../config/constants';

/**
 * Gets the API key from cookie storage, falling back to the configured API key
 * @returns The API key
 */
function getStoredApiKey(): string {
  return getApiKey() || API_CONFIG.API_KEY;
}

export interface SaveContentRequest {
  content: string;
  searchHint: string;
  mediaPaths?: string[];
  tagIds?: number[];
  isHighlighted?: boolean;
}

export interface SaveContentResponse {
  success: boolean;
  message: string;
  id?: number;
  entry?: any;
}

export interface UploadImageResponse {
  success: boolean;
  url: string;
  path: string;
  id: string;
  filename?: string;
}

export interface SignedUrlResponse {
  url: string;
  signature: string;
  expires: number;
  filename: string;
}

/**
 * Saves markdown content to the server
 * @param request - The entry data to save
 * @returns Promise with save response
 */
export async function saveContent(
  request: SaveContentRequest
): Promise<SaveContentResponse> {
  const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ENTRIES}`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": getStoredApiKey(),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const entry = await response.json();
    return {
      success: true,
      message: "Entry saved successfully",
      id: entry.id,
      entry,
    };
  } catch (error) {
    console.error("Save error:", error);
    throw error;
  }
}

/**
 * Uploads an image file to the server
 * @param file - The image file to upload
 * @returns Promise with upload response
 */
export async function uploadImage(file: File): Promise<UploadImageResponse> {
  const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MEDIA_UPLOAD}`;

  try {
    // Prepare FormData
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "x-api-key": getStoredApiKey(),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const media = await response.json();
    return {
      success: true,
      url: `${API_CONFIG.BASE_URL}${media.url}`, // Use signed URL from backend
      path: media.path,
      id: media.id,
      filename: media.filename,
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

/**
 * Uploads multiple image files to the server
 * @param files - Array of image files to upload
 * @returns Promise with array of upload responses
 */
export async function uploadImages(
  files: File[]
): Promise<UploadImageResponse[]> {
  const uploadPromises = files.map((file) => uploadImage(file));
  return Promise.all(uploadPromises);
}

/**
 * Generate a signed URL for a media file
 * @param filename - The filename to sign
 * @param expiryMs - Optional expiry time in milliseconds
 * @returns Promise with signed URL response
 */
export async function getSignedUrl(
  filename: string,
  expiryMs?: number
): Promise<SignedUrlResponse> {
  const apiUrl = `${API_CONFIG.BASE_URL}/api/media/sign`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": getStoredApiKey(),
      },
      body: JSON.stringify({ filename, expiryMs }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Get signed URL error:", error);
    throw error;
  }
}

/**
 * Generate signed URLs for multiple media files
 * @param filenames - Array of filenames to sign
 * @param expiryMs - Optional expiry time in milliseconds
 * @returns Promise with array of signed URL responses
 */
export async function getSignedUrls(
  filenames: string[],
  expiryMs?: number
): Promise<SignedUrlResponse[]> {
  const signPromises = filenames.map((filename) => getSignedUrl(filename, expiryMs));
  return Promise.all(signPromises);
}
