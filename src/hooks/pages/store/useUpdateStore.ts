import { useState } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type { ActionResponse, LangMap, RequestStatus } from '@/types/types';
import type { AuctioneerEditSchema } from '@/utils/schemas';
import type * as z from 'zod';

/**
 * Tipos inferidos de los schemas de edición
 */
export type AuctioneerEditSchemaType = z.infer<typeof AuctioneerEditSchema>;

/**
 * Datos adicionales necesarios para la actualización de perfil
 * (valores antiguos que el backend necesita para comparaciones)
 */
export interface UpdateProfileExtraData {
  oldLogo: string;
}

/**
 * Tipo combinado que acepta datos de USER o AUCTIONEER + datos extra
 */
export type UpdateProfileData = AuctioneerEditSchemaType &
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
export const useUpdateStore = (): ActionResponse<null> & {
  updateStore: (data: UpdateProfileData) => Promise<void>;
} => {
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { securePatch } = useSecureApi();

  const updateStore = async (data: UpdateProfileData): Promise<void> => {
    try {
      setStatus('loading');
      setErrorMessage(null);

      // Detectar si hay imagen para decidir entre FormData o JSON
      const hasImage = data.logo && data.logo !== '';

      // CASO 1: Con imagen - usar FormData
      if (hasImage) {
        const formData = new FormData();

        formData.append('name', data.name || '');
        formData.append('phoneNumber', data.phoneNumber || '');
        formData.append('webPage', data.webPage || '');
        formData.append('socialMedia', data.socialMedia || '');
        formData.append('address', data.address || '');
        formData.append('town', data.town || '');
        formData.append('province', data.province || '');
        formData.append('country', data.country || '');
        formData.append('postalCode', data.postalCode || '');
        formData.append('cif', data.cif || '');
        formData.append('legalName', data.legalName || '');
        formData.append('oldLogo', data.oldLogo || '');

        // Agregar archivo de imagen
        if (data.logo) {
          const uriParts = data.logo.split('.');
          const fileType = uriParts[uriParts.length - 1];

          formData.append('logo', {
            uri: data.logo,
            name: `profile.${fileType}`,
            type: `image/${fileType}`,
          } as any);
        }

        const response = await securePatch({
          endpoint: SECURE_ENDPOINTS.STORE.EDIT,
          data: formData,
          options: {
            timeout: 30000, // 30 segundos para uploads
          },
        });

        if (response.error) {
          console.error('ERROR_UPDATE_STORE', response.error);
          setStatus('error');
          setErrorMessage(response.error);
          return;
        }

        setStatus('success');
      } else {
        // CASO 2: Sin imagen - usar JSON (más eficiente)
        const payload: any = {
          oldLogo: data.oldLogo,
        };

        payload.name = data.name || '';
        payload.webPage = data.webPage || '';
        payload.socialMedia = data.socialMedia || '';
        payload.address = data.address || '';
        payload.town = data.town || '';
        payload.province = data.province || '';
        payload.country = data.country || '';
        payload.postalCode = data.postalCode || '';
        payload.phoneNumber = data.phoneNumber || '';
        payload.cif = data.cif || '';
        payload.legalName = data.legalName || '';

        const response = await securePatch({
          endpoint: SECURE_ENDPOINTS.STORE.EDIT,
          data: payload,
        });

        if (response.error) {
          console.error('ERROR_UPDATE_STORE', response.error);
          setStatus('error');
          setErrorMessage(response.error);
          return;
        }

        console.log('SUCCESS_UPDATE_STORE');
        setStatus('success');
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_UPDATE_STORE - Unexpected error');

      console.error('ERROR_UPDATE_STORE_CATCH', errorMsg);

      const message: LangMap = {
        en: 'Error updating data',
        es: 'Error al actualizar',
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
    updateStore,
  };
};
