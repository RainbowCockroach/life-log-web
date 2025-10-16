// API service for markdown content operations

export interface SaveContentRequest {
  content: string;
}

export interface SaveContentResponse {
  success: boolean;
  message: string;
  id?: string;
}

export interface UploadImageResponse {
  success: boolean;
  url: string;
  filename: string;
}

/**
 * Saves markdown content to the server
 * @param content - The markdown content to save
 * @returns Promise with save response
 */
export async function saveContent(
  content: string
): Promise<SaveContentResponse> {
  // TODO: Replace with your actual API endpoint
  const apiUrl = "/api/content/save";

  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Dummy API call - replace with actual fetch
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content } satisfies SaveContentRequest),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as SaveContentResponse;
  } catch {
    // For now, since there's no real API, return a dummy success
    // Remove this when implementing real API
    console.log("Dummy save - content:", content);
    return {
      success: true,
      message: "Content saved successfully (dummy)",
      id: Math.random().toString(36).substring(7),
    };
  }
}

/**
 * Uploads an image file to the server
 * @param file - The image file to upload
 * @returns Promise with upload response
 */
export async function uploadImage(file: File): Promise<UploadImageResponse> {
  // TODO: Replace with your actual API endpoint
  const apiUrl = "/api/images/upload";

  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Prepare FormData
    const formData = new FormData();
    formData.append("file", file);

    // Dummy API call - replace with actual fetch
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as UploadImageResponse;
  } catch {
    // For now, since there's no real API, return a dummy success
    // Remove this when implementing real API
    console.log("Dummy upload - file:", file.name);
    return {
      success: true,
      url: `/uploads/${file.name}`,
      filename: file.name,
    };
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
