import { getProxiedImageUrl } from '@/utils/getProxiedImageUrl';
import { Image, ImagePropsBase, ImageResizeMode } from 'react-native';

interface CustomImageProps extends ImagePropsBase {
  src: string;
  alt: string;
  className?: string;
  resizeMode?: ImageResizeMode;
  plainUrl?: boolean;
}

export const CustomImage = ({
  src,
  alt,
  className,
  resizeMode,
  plainUrl = false,
  ...rest
}: CustomImageProps) => {
  const finalSrc = getProxiedImageUrl(src, plainUrl);

  return (
    <Image
      source={{ uri: finalSrc }}
      alt={alt}
      className={className}
      resizeMode={resizeMode}
      {...rest}
    />
  );
};
