import { getProxiedImageUrl } from '@/utils/getProxiedImageUrl';
import { Image, ImagePropsBase, ImageResizeMode } from 'react-native';

interface CustomImageProps extends ImagePropsBase {
  src: string;
  alt: string;
  className?: string;
  resizeMode?: ImageResizeMode;
}

export const CustomImage = ({
  src,
  alt,
  className,
  resizeMode,
  ...rest
}: CustomImageProps) => {
  const finalSrc = getProxiedImageUrl(src);

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
