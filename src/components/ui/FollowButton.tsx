import { useState } from 'react';
// import { useToast } from '@/hooks/useToast';
import { ApiEndpoint, Lang, LangMap, RequestStatus } from '@/types/types';
import { Button, ButtonMode, ButtonSize } from './Button';
import { useSecureApi } from '@/hooks/api/useSecureApi';

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

interface Response {
  error: LangMap | null;
  success: LangMap | null;
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
  const [isFollowing, setIsFollowing] = useState(follows);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const { securePost } = useSecureApi();

  const isLoading = status === 'loading';
  // TODO: enable toasts
  // const { callToast } = useToast(lang);

  const handleClick = async () => {
    setStatus('loading');
    try {
      const endpoint = isFollowing ? unfollowEndpoint : followEndpoint;
      const response = await securePost<Response>({ endpoint });

      if (response.error) {
        console.log(response.error);
        // callToast({ variant: 'error', description: error });
        return;
      }

      const success = response.data;
      console.log(success);

      setIsFollowing((prev) => !prev);
      setStatus('success');

      // callToast({ variant: 'success', description: success });
    } catch (e: any) {
      // keep quiet in UI, log for devs
      console.log(e?.message ?? e);
    }
  };

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
