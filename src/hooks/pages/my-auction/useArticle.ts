import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import type { AnyArticleFormValues, LangMap } from '@/types/types';
import type { MessageKey } from '@/i18n';

const ARTICLE_CREATION_ERROR =
  'errors.article.creationFailed' as const satisfies MessageKey;
const ARTICLE_UPDATE_ERROR =
  'errors.article.updateFailed' as const satisfies MessageKey;

interface FunctionResponse {
  status: 'success' | 'error';
}

interface CreateArticleArgs {
  auctionId: string;
  values: AnyArticleFormValues;
  images: string[];
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

export const useArticle = ({
  auctionId,
}: {
  auctionId: string;
}): {
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
    auctionId,
    values,
    images,
  }: CreateArticleArgs): Promise<FunctionResponse> => {
    try {
      const payload = {
        auctionId,
        images,
        data: {
          ...values,
        },
      };

      const response = await securePost<LangMap>({
        endpoint: SECURE_ENDPOINTS.ARTICLES.NEW_ARTICLE(auctionId),
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
      sentryErrorReport(msg, 'USE_ARTICLE_MUTATION_CREATE - Unexpected error');

      console.error('ERROR_CREATE_ARTICLE_CATCH', msg);

      callToast({ variant: 'error', description: ARTICLE_CREATION_ERROR });
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
        articleId,
        images,
        removedImages: removedImages,
        articleAuctionId,
        data: {
          ...values,
        },
      };

      const response = await securePost<LangMap>({
        endpoint: SECURE_ENDPOINTS.ARTICLES.EDIT_ARTICLE(auctionId, articleId),
        data: payload,
      });

      if (response.error) {
        callToast({ variant: 'error', description: response.error });
        return { status: 'error' };
      }

      callToast({ variant: 'success', description: response.data });
      return { status: 'success' };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sentryErrorReport(msg, 'USE_ARTICLE_MUTATION_EDIT - Unexpected error');

      console.error('ERROR_EDIT_ARTICLE_CATCH', msg);

      callToast({ variant: 'error', description: ARTICLE_UPDATE_ERROR });
      return { status: 'error' };
    }
  };

  const editArticleImagesOrder = async ({
    articleId,
    newOrder,
  }: EditArticleImagesOrderArgs): Promise<FunctionResponse> => {
    try {
      const payload = {
        articleId,
        newOrder,
      };

      const response = await securePost<LangMap>({
        endpoint: SECURE_ENDPOINTS.ARTICLES.EDIT_ARTICLE_IMAGES_ORDER(
          auctionId,
          articleId
        ),
        data: payload,
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
        'USE_ARTICLE_MUTATION_EDIT_IMAGES_ORDER - Unexpected error'
      );

      console.error('ERROR_EDIT_IMAGES_ORDER_ARTICLE_CATCH', msg);

      callToast({ variant: 'error', description: ARTICLE_UPDATE_ERROR });
      return { status: 'error' };
    }
  };

  return {
    createArticle,
    editArticle,
    editArticleImagesOrder,
  };
};
