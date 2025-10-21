/**
 * Application-wide constants
 * Following React best practices for centralized configuration
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  API_BASE_URL: "https://09176645.xyz/life-log-api",
  API_KEY: "vanvanvan",
  ENDPOINTS: {
    ENTRIES: "/entries",
    MEDIA_UPLOAD: "/media/upload",
    MEDIA_DOWNLOAD: "/media/download",
    TAGS: "/tags",
    SUMMARIES: "/summaries",
  },
} as const;

/**
 * Media Configuration
 */
export const MEDIA_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
} as const;
