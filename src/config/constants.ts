/**
 * Application-wide constants
 * Following React best practices for centralized configuration
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: "http://localhost:3000",
  API_KEY: "vanvanvan",
  ENDPOINTS: {
    ENTRIES: "/api/entries",
    MEDIA_UPLOAD: "/api/media/upload",
    MEDIA_DOWNLOAD: "/api/media/download",
    TAGS: "/api/tags",
    SUMMARIES: "/api/summaries",
  },
} as const;

/**
 * Media Configuration
 */
export const MEDIA_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
} as const;
