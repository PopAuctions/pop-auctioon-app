import { useCallback, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/react-native';
import { base64ToArrayBuffer } from '@/utils/base64ToArrayBuffer';

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
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleImagesSelected = useCallback((uris: string[]) => {
    setImages(uris);
  }, []);

  const handleRemoveImageAt = useCallback((index: number) => {
    setImages((prev) => {
      const removedUri = prev[index];

      // Si es una imagen ya subida (no file://), la marcamos para borrar
      if (removedUri && !removedUri.startsWith('file://')) {
        setRemovedImages((prevRemoved) => {
          if (prevRemoved.includes(removedUri)) return prevRemoved;

          return [...prevRemoved, removedUri];
        });
      }

      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const validateMinImages = useCallback(() => {
    if (images.length < minImages) {
      callToast({
        variant: 'error',
        description: 'screens.newArticle.minImagesError',
      });
      return false;
    }
    return true;
  }, [images.length, minImages, callToast]);

  /**
   * Upload all local images (file://) to Supabase and return
   * an array of public URLs.
   * - If an image already looks like a Supabase URL, we keep it.
   */
  const uploadAllAndGetPublicUrls = useCallback(async (): Promise<string[]> => {
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

          const fileArrayBuffer = base64ToArrayBuffer(fileBase64);
          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, fileArrayBuffer, {
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
  }, [images, supabase, bucket, folder, callToast]);

  const resetRemovedRemoteImages = useCallback(() => {
    setRemovedImages([]);
  }, []);

  return {
    images,
    removedImages,
    isUploading,
    handleImagesSelected,
    handleRemoveImageAt,
    validateMinImages,
    uploadAllAndGetPublicUrls,
    setImages,
    resetRemovedRemoteImages,
  };
}
