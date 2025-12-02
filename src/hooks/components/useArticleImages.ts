import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/react-native';

interface UseArticleImagesParams {
  supabase: SupabaseClient;
  bucket: string;
  folder: string;
  minImages: number;
  callToast: (args: {
    variant: 'error' | 'success';
    description: string;
  }) => void;
}

export function useArticleImages({
  supabase,
  bucket,
  folder,
  minImages,
  callToast,
}: UseArticleImagesParams) {
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleImagesSelected = (uris: string[]) => {
    setImages(uris);
  };

  const handleRemoveImageAt = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateMinImages = () => {
    if (images.length < minImages) {
      callToast({
        variant: 'error',
        description: 'screens.newArticle.minImagesError',
      });
      return false;
    }
    return true;
  };

  /**
   * Upload all local images (file://) to Supabase and return
   * an array of public URLs.
   * - If an image already looks like a Supabase URL, we keep it.
   */
  const uploadAllAndGetPublicUrls = async (): Promise<string[]> => {
    try {
      setIsUploading(true);

      const uploadedUrls: string[] = [];

      for (const uri of images) {
        if (!uri.startsWith('file://')) {
          uploadedUrls.push(uri);
          continue;
        }

        try {
          const fileExt = uri.split('.').pop() || 'jpg';
          const fileName = `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}.${fileExt}`;
          const filePath = `${folder}/${fileName}`;

          const fileBase64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          const fileBuffer = Buffer.from(fileBase64, 'base64');

          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, fileBuffer, {
              contentType: `image/${fileExt}`,
              upsert: false,
            });

          if (error || !data) {
            Sentry.captureException(
              'RN_UPLOAD_ARTICLE_IMAGE_ERROR: ' + (error?.message ?? 'Unknown')
            );
            continue;
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from(bucket).getPublicUrl(data.path);

          uploadedUrls.push(publicUrl);
        } catch (err) {
          Sentry.captureException(
            'RN_UPLOAD_ARTICLE_IMAGE_CATCH: ' + (err as Error).message
          );
        }
      }

      setIsUploading(false);
      return uploadedUrls;
    } catch (err) {
      setIsUploading(false);
      Sentry.captureException(
        'RN_UPLOAD_ARTICLE_IMAGE_ALL_CATCH: ' + (err as Error).message
      );
      callToast({
        variant: 'error',
        description: 'screens.newArticle.imageUploadError',
      });
      return [];
    }
  };

  return {
    images,
    isUploading,
    handleImagesSelected,
    handleRemoveImageAt,
    validateMinImages,
    uploadAllAndGetPublicUrls,
    setImages,
  };
}
