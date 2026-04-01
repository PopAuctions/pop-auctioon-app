import { useCallback, useEffect, useRef, useState } from 'react';
import { File } from 'expo-file-system';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/react-native';
import { base64ToArrayBuffer } from '@/utils/base64ToArrayBuffer';
import { LangMap } from '@/types/types';

interface UseArticleImagesParams {
  supabase: SupabaseClient;
  bucket: string;
  folder: string;
  minImages: number;
  callToast: (args: {
    variant: 'error' | 'success';
    description: LangMap;
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

  const imagesRef = useRef<string[]>([]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const updateImages = useCallback((nextImages: string[]) => {
    imagesRef.current = nextImages;
    setImages(nextImages);
  }, []);

  const handleImagesSelected = useCallback(
    (uris: string[]) => {
      updateImages(uris);
    },
    [updateImages]
  );

  const handleSingleImageSelected = useCallback(
    (uri: string) => {
      updateImages([uri]);
    },
    [updateImages]
  );

  const handleRemoveImageAt = useCallback((index: number) => {
    setImages((prev) => {
      const removedUri = prev[index];

      if (removedUri && !removedUri.startsWith('file://')) {
        setRemovedImages((prevRemoved) => {
          if (prevRemoved.includes(removedUri)) return prevRemoved;

          return [...prevRemoved, removedUri];
        });
      }

      const nextImages = prev.filter((_, i) => i !== index);
      imagesRef.current = nextImages;

      return nextImages;
    });
  }, []);

  const validateMinImages = useCallback(() => {
    const currentImages = imagesRef.current;

    if (currentImages.length < minImages) {
      callToast({
        variant: 'error',
        description: {
          es: `Debes agregar al menos ${minImages} imágenes.`,
          en: `You must add at least ${minImages} images.`,
        },
      });
      return false;
    }

    return true;
  }, [minImages, callToast]);

  const uploadAllAndGetPublicUrls = useCallback(async (): Promise<string[]> => {
    setIsUploading(true);

    try {
      const currentImages = imagesRef.current;
      const uploadedUrls: string[] = [];

      for (const uri of currentImages) {
        if (!uri.startsWith('file://')) {
          uploadedUrls.push(uri);
          continue;
        }

        try {
          const cleanUri = uri.split('?')[0];
          const fileExt = cleanUri.split('.').pop()?.toLowerCase() || 'jpg';
          const normalizedExt = fileExt === 'jpeg' ? 'jpg' : fileExt;
          const contentType =
            normalizedExt === 'png'
              ? 'image/png'
              : normalizedExt === 'webp'
                ? 'image/webp'
                : 'image/jpeg';

          const fileName = `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}.${normalizedExt}`;
          const filePath = `${folder}/${fileName}`;

          const file = new File(uri);
          const fileBase64 = await file.base64();

          const fileArrayBuffer = base64ToArrayBuffer(fileBase64);

          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, fileArrayBuffer, {
              contentType,
              upsert: false,
            });

          if (error || !data) {
            Sentry.captureException(
              `RN_UPLOAD_ARTICLE_IMAGE_ERROR: ${error?.message ?? 'Unknown'}`
            );
            continue;
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from(bucket).getPublicUrl(data.path);

          uploadedUrls.push(publicUrl);
        } catch (err) {
          Sentry.captureException(
            `RN_UPLOAD_ARTICLE_IMAGE_CATCH: ${(err as Error).message}`
          );
        }
      }

      return uploadedUrls;
    } catch (err) {
      Sentry.captureException(
        `RN_UPLOAD_ARTICLE_IMAGE_ALL_CATCH: ${(err as Error).message}`
      );

      callToast({
        variant: 'error',
        description: {
          es: 'Hubo un error al subir las imágenes.',
          en: 'There was an error uploading the images.',
        },
      });

      return [];
    } finally {
      setIsUploading(false);
    }
  }, [supabase, bucket, folder, callToast]);

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
    setImages: updateImages,
    resetRemovedRemoteImages,
    handleSingleImageSelected,
  };
}
