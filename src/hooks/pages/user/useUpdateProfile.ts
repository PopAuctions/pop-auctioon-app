import { useState } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type { ActionResponse, LangMap, RequestStatus } from '@/types/types';
import type { UserEditSchema, AuctioneerEditSchema } from '@/utils/schemas';
import type * as z from 'zod';

/**
 * Tipos inferidos de los schemas de edición
 */
export type UserEditSchemaType = z.infer<typeof UserEditSchema>;
export type AuctioneerEditSchemaType = z.infer<typeof AuctioneerEditSchema>;

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
export type UpdateProfileData = (
  | UserEditSchemaType
  | AuctioneerEditSchemaType
) &
  UpdateProfileExtraData;

/**
 * Hook para actualizar el perfil del usuario autenticado
 *
 * Maneja automáticamente:
 * - Envío como JSON cuando no hay imagen
 * - Envío como FormData cuando hay imagen (más eficiente para archivos)
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
export const useUpdateProfile = (): ActionResponse<null> & {
  updateProfile: (data: UpdateProfileData) => Promise<void>;
} => {
  const [status, setStatus] = useState<RequestStatus>('idle');
  // errorMessage contiene el mensaje localizado (en/es) listo para mostrar en toast/UI
  // Por ahora solo se usa en logs, pero está preparado para el sistema de toast futuro
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { securePost } = useSecureApi();

  const updateProfile = async (data: UpdateProfileData): Promise<void> => {
    try {
      setStatus('loading');
      setErrorMessage(null);

      // Detectar si hay imagen para decidir entre FormData o JSON
      const hasImage = data.profilePicture && data.profilePicture !== '';

      if (hasImage) {
        // CASO 1: Con imagen - usar FormData
        const formData = new FormData();

        // Campos básicos (USER)
        formData.append('username', data.username);
        formData.append('name', data.name);
        formData.append('lastName', data.lastName);
        formData.append('phoneNumber', data.phoneNumber || '');
        formData.append('oldProfilePicture', data.oldProfilePicture);
        formData.append('oldPhoneNumber', data.oldPhoneNumber);

        // Campos adicionales (AUCTIONEER)
        if ('storeName' in data) {
          formData.append('storeName', data.storeName || '');
          formData.append('webPage', data.webPage || '');
          formData.append('socialMedia', data.socialMedia || '');
          formData.append('address', data.address || '');
          formData.append('town', data.town || '');
          formData.append('province', data.province || '');
          formData.append('country', data.country || '');
          formData.append('postalCode', data.postalCode || '');
        }

        // Agregar archivo de imagen
        if (data.profilePicture) {
          const uriParts = data.profilePicture.split('.');
          const fileType = uriParts[uriParts.length - 1];

          formData.append('profilePicture', {
            uri: data.profilePicture,
            name: `profile.${fileType}`,
            type: `image/${fileType}`,
          } as any);
        }

        const response = await securePost({
          endpoint: SECURE_ENDPOINTS.USER.EDIT_INFO,
          data: formData,
          options: {
            timeout: 30000, // 30 segundos para uploads
          },
        });

        if (response.error) {
          console.error('ERROR_UPDATE_PROFILE', response.error);
          setStatus('error');
          setErrorMessage(response.error);
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

        // Agregar campos de AUCTIONEER si existen
        if ('storeName' in data) {
          payload.storeName = data.storeName || '';
          payload.webPage = data.webPage || '';
          payload.socialMedia = data.socialMedia || '';
          payload.address = data.address || '';
          payload.town = data.town || '';
          payload.province = data.province || '';
          payload.country = data.country || '';
          payload.postalCode = data.postalCode || '';
        }

        const response = await securePost({
          endpoint: SECURE_ENDPOINTS.USER.EDIT_INFO,
          data: payload,
        });

        if (response.error) {
          console.error('ERROR_UPDATE_PROFILE', response.error);
          setStatus('error');
          setErrorMessage(response.error);
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

      const message: LangMap = {
        en: 'Error updating profile',
        es: 'Error al actualizar el perfil',
      };

      setStatus('error');
      setErrorMessage(message);
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
