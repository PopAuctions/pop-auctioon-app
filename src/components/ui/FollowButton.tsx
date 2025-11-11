import { useEffect, useState } from 'react';
import { ApiEndpoint, Lang, LangMap, RequestStatus } from '@/types/types';
import { Button, ButtonMode, ButtonSize } from './Button';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { useToast } from '@/hooks/useToast';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';

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
}

const TEXTS = {
  follow: {
    en: 'Follow',
    es: 'Seguir',
  },
  unfollow: {
    en: 'Unfollow',
    es: 'Dejar de seguir',
  },
  notAviable: {
    en: 'No longer available',
    es: 'Ya no está disponible',
  },
} as const;

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
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(() => !!follows);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const { securePost } = useSecureApi();
  const { callToast } = useToast(lang);

  const isLoading = status === 'loading';

  const handleClick = async () => {
    setStatus('loading');
    const endpoint = isFollowing ? unfollowEndpoint : followEndpoint;

    try {
      const response = await securePost<LangMap>({ endpoint });

      if (response.error) {
        callToast({ variant: 'error', description: response.error });
        setStatus('error');
        return;
      }

      setIsFollowing((prev) => !prev);
      setStatus('success');

      callToast({ variant: 'success', description: response.data });
    } catch (e: any) {
      sentryErrorReport(e?.message, `FOLLOW_BUTTON - ${endpoint}`);
      setStatus('error');
    }
  };

  useEffect(() => {
    setIsFollowing(!!follows);
  }, [follows]);

  const label = !isAvailable
    ? isFollowing
      ? TEXTS.unfollow[lang]
      : TEXTS.follow[lang]
    : TEXTS.notAviable[lang];

  return (
    <Button
      mode={mode}
      size={size}
      className={className}
      disabled={isAvailable || isLoading}
      onPress={handleClick}
      isLoading={isLoading || !extraDataIsLoaded}
    >
      {label}
    </Button>
  );
}
