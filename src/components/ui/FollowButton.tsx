import { useEffect, useState } from 'react';
import { ApiEndpoint, Lang, LangMap, RequestStatus } from '@/types/types';
import { Button, ButtonMode, ButtonSize } from './Button';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { useToast } from '@/hooks/useToast';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { REQUEST_STATUS } from '@/constants';
import { useSignInAlertModal } from '@/context/sign-in-modal-context';
import { FontAwesomeIcon } from './FontAwesomeIcon';
import { t } from '@/i18n';

interface FollowButtonProps {
  mode: ButtonMode;
  size?: ButtonSize;
  className?: string;
  followEndpoint: ApiEndpoint;
  unfollowEndpoint: ApiEndpoint;
  follows: boolean;
  isAvailable?: boolean;
  extraDataIsLoaded?: boolean;
  lang: Lang;
  actionAfterFollow?: () => void;
  heartIcon?: boolean;
}

export function FollowButton({
  mode,
  size = 'large',
  className,
  followEndpoint,
  unfollowEndpoint,
  follows,
  lang,
  isAvailable = false,
  extraDataIsLoaded = false,
  actionAfterFollow = () => {},
  heartIcon = false,
}: FollowButtonProps) {
  const { openSignInAlertModal } = useSignInAlertModal();
  const [isFollowing, setIsFollowing] = useState(() => !!follows);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const { securePost } = useSecureApi();
  const { callToast } = useToast(lang);
  const texts = t('components.followButton', { locale: lang });

  const isLoading = status === REQUEST_STATUS.loading;

  const handleClick = async () => {
    setStatus(REQUEST_STATUS.loading);
    const endpoint = isFollowing ? unfollowEndpoint : followEndpoint;

    try {
      const response = await securePost<LangMap>({ endpoint });

      if (response.error) {
        if (response.status === 401) {
          openSignInAlertModal();
        }
        callToast({ variant: 'error', description: response.error });
        setStatus(REQUEST_STATUS.error);
        return;
      }

      setIsFollowing((prev) => !prev);
      setStatus(REQUEST_STATUS.success);

      callToast({ variant: 'success', description: response.data });
      actionAfterFollow?.();
    } catch (e: any) {
      sentryErrorReport(e?.message, `FOLLOW_BUTTON - ${endpoint}`);
      setStatus(REQUEST_STATUS.error);
    }
  };

  useEffect(() => {
    setIsFollowing(!!follows);
  }, [follows]);

  const label = isAvailable
    ? isFollowing
      ? texts.unfollow
      : texts.follow
    : texts.notAvailable;

  if (!isAvailable) {
    return null;
  }

  if (heartIcon) {
    return (
      <>
        {isFollowing ? (
          <Button
            mode='empty'
            className='mr-4 self-end'
            disabled={isLoading}
            onPress={handleClick}
          >
            <FontAwesomeIcon
              variant='bold'
              name='heart'
              size={26}
              color='cinnabar'
            />
          </Button>
        ) : (
          <Button
            mode='empty'
            className='mr-4 self-end'
            disabled={isLoading}
            onPress={handleClick}
          >
            <FontAwesomeIcon
              variant='bold'
              name='heart-o'
              size={26}
              color='cinnabar'
            />
          </Button>
        )}
      </>
    );
  }

  return (
    <Button
      mode={mode}
      size={size}
      className={className}
      disabled={!isAvailable || isLoading}
      onPress={handleClick}
      isLoading={isLoading || !extraDataIsLoaded}
      textClassName='text-center'
    >
      {label}
    </Button>
  );
}
