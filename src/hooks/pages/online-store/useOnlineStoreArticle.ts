import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import type { LangMap } from '@/types/types';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/i18n/useTranslation';

interface FunctionResponse {
  status: 'success' | 'error';
}

interface CreateArticleArgs {
  values: any;
  images: string[];
}

interface EditArticleArgs {
  articleId: number;
  values: any;
  images: string[];
  removedImages: string[];
  articleAuctionId: string;
}

interface EditArticleImagesOrderArgs {
  articleId: number;
  newOrder: string[];
}

export const useOnlineStoreArticle = (): {
  createArticle: (args: CreateArticleArgs) => Promise<FunctionResponse>;
  editArticle: (args: EditArticleArgs) => Promise<FunctionResponse>;
  editArticleImagesOrder: (
    args: EditArticleImagesOrderArgs
  ) => Promise<FunctionResponse>;
} => {
  const { locale } = useTranslation();
  const { callToast } = useToast(locale);
  const { securePost } = useSecureApi();

  const createArticle = async ({
    values,
    images,
  }: CreateArticleArgs): Promise<FunctionResponse> => {
    try {
      const payload = {
        images,
        data: {
          ...values,
        },
      };

      const response = await securePost<LangMap>({
        endpoint: SECURE_ENDPOINTS.MY_ONLINE_STORE.NEW_ARTICLE,
        data: payload,
        options: {
          timeout: 30000,
        },
      });

      if (response.error) {
        callToast({ variant: 'error', description: response.error });
        return { status: 'error' };
      }

      callToast({ variant: 'success', description: response.data });
      return { status: 'success' };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sentryErrorReport(
        msg,
        'USE_ONLINE_STORE_ARTICLE_MUTATION_CREATE - Unexpected error'
      );

      console.error('ERROR_CREATE_ONLINE_STORE_ARTICLE_CATCH', msg);

      const message: LangMap = {
        en: 'Error creating article',
        es: 'Error al crear el artículo',
      };

      callToast({ variant: 'error', description: message });
      return { status: 'error' };
    }
  };

  const editArticle = async ({
    articleId,
    values,
    images,
    removedImages,
    articleAuctionId,
  }: EditArticleArgs): Promise<FunctionResponse> => {
    try {
      const payload = {
        images,
        removedImages: removedImages,
        articleAuctionId,
        data: {
          ...values,
        },
      };

      const response = await securePost<LangMap>({
        endpoint: SECURE_ENDPOINTS.MY_ONLINE_STORE.EDIT_ARTICLE(articleId),
        data: {
          ...payload,
        },
      });

      if (response.error) {
        callToast({ variant: 'error', description: response.error });
        return { status: 'error' };
      }

      callToast({ variant: 'success', description: response.data });
      return { status: 'success' };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sentryErrorReport(
        msg,
        'USE_ONLINE_STORE_ARTICLE_MUTATION_EDIT - Unexpected error'
      );

      console.error('ERROR_EDIT_ONLINE_STORE_ARTICLE_CATCH', msg);

      const message: LangMap = {
        en: 'Error updating article',
        es: 'Error al actualizar el artículo',
      };

      callToast({ variant: 'error', description: message });
      return { status: 'error' };
    }
  };

  const editArticleImagesOrder = async ({
    articleId,
    newOrder,
  }: EditArticleImagesOrderArgs): Promise<FunctionResponse> => {
    try {
      const response = await securePost<LangMap>({
        endpoint:
          SECURE_ENDPOINTS.MY_ONLINE_STORE.EDIT_ARTICLE_IMAGES_ORDER(articleId),
        data: {
          newImagesOrder: newOrder,
        },
      });

      if (response.error) {
        callToast({ variant: 'error', description: response.error });
        return { status: 'error' };
      }

      callToast({ variant: 'success', description: response.data });
      return { status: 'success' };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sentryErrorReport(
        msg,
        'USE_ONLINE_STORE_ARTICLE_MUTATION_EDIT_IMAGES_ORDER - Unexpected error'
      );

      console.error('ERROR_EDIT_IMAGES_ORDER_ONLINE_STORE_ARTICLE_CATCH', msg);

      const message: LangMap = {
        en: 'Error updating article images order',
        es: 'Error al actualizar el orden de las imágenes del artículo',
      };

      callToast({ variant: 'error', description: message });
      return { status: 'error' };
    }
  };

  return {
    createArticle,
    editArticle,
    editArticleImagesOrder,
  };
};
