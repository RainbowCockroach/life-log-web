import imageCompression from 'browser-image-compression';
import heic2any from 'heic2any';

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
 * Checks if a file is in HEIC/HEIF format
 * @param file - File to check
 */
function isHEIC(file: File): boolean {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();
  return (
    fileName.endsWith('.heic') ||
    fileName.endsWith('.heif') ||
    fileType === 'image/heic' ||
    fileType === 'image/heif'
  );
}

/**
 * Converts HEIC/HEIF image to JPEG
 * @param file - HEIC/HEIF file to convert
 */
async function convertHEICtoJPEG(file: File): Promise<File> {
  console.log(`Converting HEIC file: ${file.name}`);

  try {
    // Convert HEIC to JPEG blob
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9, // High quality for initial conversion
    });

    // heic2any can return Blob or Blob[], handle both cases
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

    // Create new filename with .jpg extension
    const originalNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    const newFileName = `${originalNameWithoutExt}.jpg`;

    // Create a new File object
    const convertedFile = new File([blob], newFileName, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    console.log(
      `HEIC conversion successful: ${file.name} → ${newFileName} (${(
        convertedFile.size /
        1024 /
        1024
      ).toFixed(2)}MB)`
    );

    return convertedFile;
  } catch (error) {
    console.error('HEIC conversion failed:', error);
    throw new Error(`Failed to convert HEIC image: ${file.name}`);
  }
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
 * Processes multiple image files: convert HEIC if needed, compress, and rename
 * @param files - Array of image files to process
 * @param urlPrefix - Prefix to add to the URL (e.g., '/uploads/', 'https://cdn.example.com/')
 */
export async function processImages(
  files: File[],
  urlPrefix: string = '/uploads/'
): Promise<ProcessedImage[]> {
  const processed: ProcessedImage[] = [];

  for (const file of files) {
    // Step 1: Convert HEIC to JPEG if needed
    let fileToProcess = file;
    if (isHEIC(file)) {
      try {
        fileToProcess = await convertHEICtoJPEG(file);
      } catch (error) {
        console.error(`Failed to convert HEIC file: ${file.name}`, error);
        // Re-throw to let the caller handle it
        throw error;
      }
    }

    // Step 2: Compress the image
    const compressedFile = await compressImage(fileToProcess);

    // Step 3: Generate unique filename (using the converted file if applicable)
    const newName = generateUniqueFilename(fileToProcess);

    // Step 4: Create new File object with new name
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
