import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Compresses an image to optimize file size and dimensions
 * - Resizes to max 1024px width (maintains aspect ratio)
 * - Compresses to 70% quality
 * - Converts to WebP format for optimal size
 *
 * @param uri - The local URI of the image to compress
 * @returns The URI of the compressed image, or null if compression failed
 */
export async function compressImage(uri: string): Promise<string | null> {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }], // Resize maintaining aspect ratio
      {
        compress: 0.7, // 70% quality
        format: ImageManipulator.SaveFormat.WEBP,
      }
    );

    return manipResult.uri;
  } catch (error) {
    console.error('ERROR_COMPRESS_IMAGE', error);
    return null;
  }
}
