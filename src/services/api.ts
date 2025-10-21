// API service for markdown content operations
import { getApiKey } from "../utils/apiKeyStorage";
import { API_CONFIG } from "../config/constants";

/**
 * Gets the API key from cookie storage, falling back to the configured API key
 * @returns The API key
 */
function getStoredApiKey(): string {
  return getApiKey() || API_CONFIG.API_KEY;
}

export interface Entry {
  id: number;
  content: string;
  searchHint: string;
  isHighlighted: boolean;
  mediaPaths: string[];
  location?: Tag | null;
  createdAt: string;
  tags?: Array<{
    id: number;
    name: string;
  }>;
}

export interface SaveContentRequest {
  content: string;
  searchHint: string;
  mediaPaths?: string[];
  locationId?: number;
  tagIds?: number[];
  isHighlighted?: boolean;
}

export interface SaveContentResponse {
  success: boolean;
  message: string;
  id?: number;
  entry?: Entry;
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
  const apiUrl = `${API_CONFIG.API_BASE_URL}${API_CONFIG.ENDPOINTS.ENTRIES}`;

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
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
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
  const apiUrl = `${API_CONFIG.API_BASE_URL}${API_CONFIG.ENDPOINTS.MEDIA_UPLOAD}`;

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
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const media = await response.json();
    return {
      success: true,
      url: `${API_CONFIG.API_BASE_URL}${media.url}`, // Use signed URL from backend
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
  const apiUrl = `${API_CONFIG.API_BASE_URL}/media/sign`;

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
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
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
  const signPromises = filenames.map((filename) =>
    getSignedUrl(filename, expiryMs)
  );
  return Promise.all(signPromises);
}

export interface FetchEntriesResponse {
  entries: Entry[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Fetches entries with pagination
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of entries per page
 * @returns Promise with paginated entries
 */
export async function fetchEntries(
  page: number = 1,
  pageSize: number = 10
): Promise<FetchEntriesResponse> {
  const apiUrl = `${API_CONFIG.API_BASE_URL}${API_CONFIG.ENDPOINTS.ENTRIES}`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-api-key": getStoredApiKey(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const allEntries: Entry[] = await response.json();

    // Implement client-side pagination since API doesn't support it yet
    const total = allEntries.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const entries = allEntries.slice(startIndex, endIndex);
    const hasMore = endIndex < total;

    return {
      entries,
      total,
      page,
      pageSize,
      hasMore,
    };
  } catch (error) {
    console.error("Fetch entries error:", error);
    throw error;
  }
}

export interface Tag {
  id: number;
  name: string;
  searchHint: string;
  type: string;
  lastUsed?: string;
  config: {
    backgroundColor?: string;
    textColor?: string;
    [key: string]: any;
  };
  parent?: Tag | null;
  children?: Tag[];
}

/**
 * Searches for tag suggestions based on query
 * @param query - Search query for tag name or search hint
 * @param type - Optional tag type filter (e.g., 'tag', 'location')
 * @returns Promise with array of matching tags
 */
export async function searchTagSuggestions(
  query: string,
  type?: string
): Promise<Tag[]> {
  if (!query || query.trim() === "") {
    return [];
  }

  let apiUrl = `${
    API_CONFIG.API_BASE_URL
  }/tags/suggestions/search?q=${encodeURIComponent(query)}`;
  if (type) {
    apiUrl += `&type=${encodeURIComponent(type)}`;
  }

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-api-key": getStoredApiKey(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Search tag suggestions error:", error);
    throw error;
  }
}

export interface CreateTagRequest {
  name: string;
  type?: string;
  config?: {
    backgroundColor?: string;
    textColor?: string;
    [key: string]: any;
  };
  parentId?: number;
}

/**
 * Creates a new tag
 * @param tag - Tag data to create
 * @returns Promise with created tag
 */
export async function createTag(tag: CreateTagRequest): Promise<Tag> {
  const apiUrl = `${API_CONFIG.API_BASE_URL}/tags`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": getStoredApiKey(),
      },
      body: JSON.stringify(tag),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Create tag error:", error);
    throw error;
  }
}
