import { useState } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type { ActionResponse, RequestStatus, UploadFile } from '@/types/types';
import type { UserEditSchema } from '@/utils/schemas';
import type * as z from 'zod';
import type { MessageKey } from '@/i18n';
import { File } from 'expo-file-system';

const PROFILE_UPDATE_UNEXPECTED_ERROR =
  'errors.profile.updateUnexpected' as const satisfies MessageKey;

const createProfilePictureUpload = async (uri: string): Promise<UploadFile> => {
  const file = new File(uri);
  const arrayBuffer = await file.base64();
  const extension = uri.split('.').at(-1)?.toLowerCase() || 'webp';
  const mimeExtension = extension === 'jpg' ? 'jpeg' : extension;

  return {
    src: uri,
    name: `profile.${extension}`,
    type: `image/${mimeExtension}`,
    arrayBuffer,
  };
};

/**
 * Tipos inferidos de los schemas de edición
 */
export type UserEditSchemaType = z.infer<typeof UserEditSchema>;

/**
 * Datos adicionales necesarios para la actualización de perfil
 * (valores antiguos que el backend necesita para comparaciones)
 */
export interface UpdateProfileExtraData {
  oldProfilePicture: string;
  oldPhoneNumber: string;
}

/**
 * Tipo combinado que acepta datos de USER o AUCTIONEER + datos extra
 */
export type UpdateProfileData = UserEditSchemaType & UpdateProfileExtraData;

/**
 * Hook para actualizar el perfil del usuario autenticado
 *
 * Maneja automáticamente:
 * - Envío como JSON cuando no hay imagen
 * - Conversión de una imagen nueva al formato de upload aceptado por la API
 * - Timeout extendido para uploads de imágenes
 *
 * @returns {ActionResponse<null>} Estado de la operación y función updateProfile
 *
 * @example
 * ```tsx
 * const { updateProfile, status, errorMessage } = useUpdateProfile();
 *
 * const handleSubmit = async (formData) => {
 *   await updateProfile({
 *     ...formData,
 *     oldProfilePicture: currentUser?.profilePicture || '',
 *     oldPhoneNumber: currentUser?.phoneNumber || '',
 *   });
 *
 *   if (status === 'success') {
 *     // TODO: Show success toast
 *     router.back();
 *   }
 * };
 * ```
 */
export const useUpdateProfile = (): ActionResponse<null, MessageKey> & {
  updateProfile: (data: UpdateProfileData) => Promise<void>;
} => {
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { securePost } = useSecureApi();

  const updateProfile = async (data: UpdateProfileData): Promise<void> => {
    try {
      setStatus('loading');
      setErrorMessage(null);

      // Use FormData only when the user selected a new image. The form is
      // initialized with the existing remote URL, which must not be uploaded
      // again as though it were a local file.
      const hasNewImage =
        Boolean(data.profilePicture) &&
        data.profilePicture !== data.oldProfilePicture;

      if (hasNewImage) {
        const profilePicture = await createProfilePictureUpload(
          data.profilePicture as string
        );

        const response = await securePost({
          endpoint: SECURE_ENDPOINTS.USER.EDIT_INFO,
          data: {
            username: data.username,
            name: data.name,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber || '',
            oldProfilePicture: data.oldProfilePicture,
            oldPhoneNumber: data.oldPhoneNumber,
            profilePicture,
          },
          options: {
            timeout: 30000, // 30 segundos para uploads
          },
        });

        if (response.error) {
          console.error('ERROR_UPDATE_PROFILE', response.error);
          setStatus('error');
          setErrorMessage(
            response.messageCode ?? PROFILE_UPDATE_UNEXPECTED_ERROR
          );
          return;
        }

        console.log('SUCCESS_UPDATE_PROFILE');
        setStatus('success');
      } else {
        // CASO 2: Sin imagen - usar JSON (más eficiente)
        const payload: any = {
          username: data.username,
          name: data.name,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber || '',
          oldProfilePicture: data.oldProfilePicture,
          oldPhoneNumber: data.oldPhoneNumber,
        };

        const response = await securePost({
          endpoint: SECURE_ENDPOINTS.USER.EDIT_INFO,
          data: payload,
        });

        if (response.error) {
          console.error('ERROR_UPDATE_PROFILE', response.error);
          setStatus('error');
          setErrorMessage(
            response.messageCode ?? PROFILE_UPDATE_UNEXPECTED_ERROR
          );
          return;
        }

        console.log('SUCCESS_UPDATE_PROFILE');
        setStatus('success');
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_UPDATE_PROFILE - Unexpected error');

      console.error('ERROR_UPDATE_PROFILE_CATCH', errorMsg);

      setStatus('error');
      setErrorMessage(PROFILE_UPDATE_UNEXPECTED_ERROR);
    }
  };

  return {
    data: null,
    status,
    errorMessage,
    setErrorMessage,
    updateProfile,
  };
};
