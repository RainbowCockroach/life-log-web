import imageCompression from 'browser-image-compression';

export interface ProcessedImage {
  file: File;
  originalName: string;
  newName: string;
  size: number;
  url: string; // Markdown-ready URL with prefix
}

/**
 * Generates a unique filename to avoid conflicts
 * Format: timestamp-random-sanitized-original-name.ext
 */
export function generateUniqueFilename(originalFile: File): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);

  // Get file extension
  const ext = originalFile.name.split('.').pop() || 'jpg';

  // Sanitize original filename (remove extension and special chars)
  const nameWithoutExt = originalFile.name.replace(/\.[^/.]+$/, '');
  const sanitized = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 30); // Limit length

  return `${timestamp}-${randomStr}-${sanitized}.${ext}`;
}

/**
 * Compresses an image file
 * @param file - Original image file
 * @param options - Compression options
 */
export async function compressImage(
  file: File,
  options: {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
  } = {}
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 1, // Max file size in MB
    maxWidthOrHeight: 1920, // Max width or height
    useWebWorker: true, // Use web worker for better performance
  };

  const compressionOptions = { ...defaultOptions, ...options };

  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    console.log(
      `Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(
        compressedFile.size /
        1024 /
        1024
      ).toFixed(2)}MB`
    );
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Processes multiple image files: compress and rename
 * @param files - Array of image files to process
 * @param urlPrefix - Prefix to add to the URL (e.g., '/uploads/', 'https://cdn.example.com/')
 */
export async function processImages(
  files: File[],
  urlPrefix: string = '/uploads/'
): Promise<ProcessedImage[]> {
  const processed: ProcessedImage[] = [];

  for (const file of files) {
    // Compress the image
    const compressedFile = await compressImage(file);

    // Generate unique filename
    const newName = generateUniqueFilename(file);

    // Create new File object with new name
    const renamedFile = new File([compressedFile], newName, {
      type: compressedFile.type,
    });

    // Construct the URL path
    const url = `${urlPrefix}${newName}`;

    processed.push({
      file: renamedFile,
      originalName: file.name,
      newName: newName,
      size: renamedFile.size,
      url: url,
    });
  }

  return processed;
}
