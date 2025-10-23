import { useCallback, useEffect, useState } from "react";
import Markdown from "react-markdown";
import { getSignedUrls, type SignedUrlResponse } from "../../services/api";
import { API_CONFIG } from "../../config/constants";

interface MarkdownViewerProps {
  content: string;
  mediaPaths?: string[];
}

export default function MarkdownViewer({
  content,
  mediaPaths = [],
}: MarkdownViewerProps) {
  const [imageUrlMap, setImageUrlMap] = useState<Map<string, string>>(
    new Map()
  );

  // Extract image filenames from markdown content
  const extractImageFilenames = useCallback((markdown: string): string[] => {
    const imageRegex = /!\[.*?\]\(([^)]+)\)/g;
    const filenames: string[] = [];
    let match;

    while ((match = imageRegex.exec(markdown)) !== null) {
      const url = match[1];
      // Extract just the filename (handle both relative and absolute URLs)
      const filename = url.split("/").pop() || url;

      // Only include if it looks like a timestamp-based filename
      if (filename && /^\d+\.\w+/.test(filename)) {
        filenames.push(filename);
      }
    }

    return [...new Set(filenames)]; // Remove duplicates
  }, []);

  // Fetch signed URLs for images
  useEffect(() => {
    const fetchSignedUrls = async () => {
      if (!content) return;

      // Get filenames from both markdown content and mediaPaths
      const contentFilenames = extractImageFilenames(content);
      const allFilenames = [...new Set([...contentFilenames, ...mediaPaths])];

      if (allFilenames.length === 0) return;

      // Filter out filenames we already have valid URLs for
      const missingFilenames = allFilenames.filter((filename) => {
        const existingUrl = imageUrlMap.get(filename);
        if (!existingUrl) return true;

        // Check if URL has expired by parsing the expires query param
        try {
          const url = new URL(existingUrl, API_CONFIG.API_BASE_URL);
          const expires = parseInt(url.searchParams.get("expires") || "0");
          return Date.now() > expires - 60000; // Refresh if less than 1 minute left
        } catch {
          return true;
        }
      });

      if (missingFilenames.length === 0) return;

      try {
        const signedUrls: SignedUrlResponse[] = await getSignedUrls(
          missingFilenames
        );
        const newMap = new Map(imageUrlMap);
        signedUrls.forEach((result) => {
          newMap.set(
            result.filename,
            `${API_CONFIG.API_BASE_URL}${result.url}`
          );
        });
        setImageUrlMap(newMap);
      } catch (error) {
        console.error("Failed to fetch signed URLs:", error);
      }
    };

    fetchSignedUrls();
  }, [content, mediaPaths, extractImageFilenames, imageUrlMap]);

  // URL transform function for Markdown component
  const urlTransform = useCallback(
    (url: string): string => {
      // If it's already a full URL, return as-is
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
      }

      // If it's a filename, look up the signed URL
      const signedUrl = imageUrlMap.get(url);
      return signedUrl || url;
    },
    [imageUrlMap]
  );

  return (
    <div>
      <Markdown urlTransform={urlTransform}>{content}</Markdown>
    </div>
  );
}
