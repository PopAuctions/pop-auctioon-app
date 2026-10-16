import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import type { MessageKey } from '@/i18n';
import type { AnyArticleFormValues, AuctionCategories } from '@/types/types';
import { resolveApiResponseMessage } from '@/i18n/api-message';

interface FunctionResponse {
  status: 'success' | 'error';
}

interface CreateArticleArgs {
  values: AnyArticleFormValues;
  images: string[];
  category: AuctionCategories;
}

interface EditArticleArgs {
  articleId: number;
  values: AnyArticleFormValues;
  images: string[];
  removedImages: string[];
  articleAuctionId: string;
}

interface EditArticleImagesOrderArgs {
  articleId: number;
  newOrder: string[];
}

const CREATE_ERROR =
  'errors.onlineStoreArticle.createFailed' satisfies MessageKey;
const UPDATE_ERROR =
  'errors.onlineStoreArticle.updateFailed' satisfies MessageKey;
const IMAGE_ORDER_ERROR =
  'errors.onlineStoreArticle.imageUpdateFailed' satisfies MessageKey;

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
    category,
  }: CreateArticleArgs): Promise<FunctionResponse> => {
    try {
      const payload = {
        images,
        data: {
          ...values,
        },
        category,
      };

      const response = await securePost<unknown>({
        endpoint: SECURE_ENDPOINTS.MY_ONLINE_STORE.NEW_ARTICLE,
        data: payload,
        options: {
          timeout: 30000,
        },
      });

      if (response.error) {
        callToast({
          variant: 'error',
          description: resolveApiResponseMessage(
            response,
            'error',
            locale,
            CREATE_ERROR
          ),
        });
        return { status: 'error' };
      }

      callToast({
        variant: 'success',
        description: resolveApiResponseMessage(
          response,
          'success',
          locale,
          CREATE_ERROR
        ),
      });
      return { status: 'success' };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sentryErrorReport(
        msg,
        'USE_ONLINE_STORE_ARTICLE_MUTATION_CREATE - Unexpected error'
      );

      console.error('ERROR_CREATE_ONLINE_STORE_ARTICLE_CATCH', msg);

      callToast({ variant: 'error', description: CREATE_ERROR });
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

      const response = await securePost<unknown>({
        endpoint: SECURE_ENDPOINTS.MY_ONLINE_STORE.EDIT_ARTICLE(articleId),
        data: {
          ...payload,
        },
      });

      if (response.error) {
        callToast({
          variant: 'error',
          description: resolveApiResponseMessage(
            response,
            'error',
            locale,
            UPDATE_ERROR
          ),
        });
        return { status: 'error' };
      }

      callToast({
        variant: 'success',
        description: resolveApiResponseMessage(
          response,
          'success',
          locale,
          UPDATE_ERROR
        ),
      });
      return { status: 'success' };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sentryErrorReport(
        msg,
        'USE_ONLINE_STORE_ARTICLE_MUTATION_EDIT - Unexpected error'
      );

      console.error('ERROR_EDIT_ONLINE_STORE_ARTICLE_CATCH', msg);

      callToast({ variant: 'error', description: UPDATE_ERROR });
      return { status: 'error' };
    }
  };

  const editArticleImagesOrder = async ({
    articleId,
    newOrder,
  }: EditArticleImagesOrderArgs): Promise<FunctionResponse> => {
    try {
      const response = await securePost<unknown>({
        endpoint:
          SECURE_ENDPOINTS.MY_ONLINE_STORE.EDIT_ARTICLE_IMAGES_ORDER(articleId),
        data: {
          newImagesOrder: newOrder,
        },
      });

      if (response.error) {
        callToast({
          variant: 'error',
          description: resolveApiResponseMessage(
            response,
            'error',
            locale,
            IMAGE_ORDER_ERROR
          ),
        });
        return { status: 'error' };
      }

      callToast({
        variant: 'success',
        description: resolveApiResponseMessage(
          response,
          'success',
          locale,
          IMAGE_ORDER_ERROR
        ),
      });
      return { status: 'success' };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sentryErrorReport(
        msg,
        'USE_ONLINE_STORE_ARTICLE_MUTATION_EDIT_IMAGES_ORDER - Unexpected error'
      );

      console.error('ERROR_EDIT_IMAGES_ORDER_ONLINE_STORE_ARTICLE_CATCH', msg);

      callToast({ variant: 'error', description: IMAGE_ORDER_ERROR });
      return { status: 'error' };
    }
  };

  return {
    createArticle,
    editArticle,
    editArticleImagesOrder,
  };
};
