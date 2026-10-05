import { Pressable, View } from 'react-native';
import { CustomImage } from '@/components/ui/CustomImage';
import { CustomText } from '@/components/ui/CustomText';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { DisplayedNotification, Lang } from '@/types/types';

const formatRelativeDate = (dateString: string, locale: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return locale === 'es' ? 'Ahora mismo' : 'Just now';
  if (minutes < 60)
    return locale === 'es' ? `Hace ${minutes} min` : `${minutes} min ago`;
  if (hours < 24) return locale === 'es' ? `Hace ${hours} h` : `${hours} h ago`;
  if (days < 7) return locale === 'es' ? `Hace ${days} d` : `${days} d ago`;

  return date.toLocaleDateString(locale);
};

export const NotificationItem = ({
  notification,
  lang,
  locale,
  onPress,
}: {
  notification: DisplayedNotification;
  lang: Lang;
  locale: string;
  onPress: (notification: DisplayedNotification) => void;
}) => {
  const title = notification.title[lang] ?? notification.title.en ?? '';
  const description =
    notification.description?.[lang] ?? notification.description?.en ?? null;

  const isUnread = !notification.read;

  return (
    <Pressable
      onPress={() => onPress(notification)}
      className={`mb-3 flex-row rounded-2xl border p-3 ${
        isUnread ? 'border-cinnabar bg-white' : 'border-gray'
      }`}
    >
      {notification.image ? (
        <CustomImage
          alt='Notification Image'
          src={notification.image}
          className='mr-3 h-16 w-16 rounded-xl'
          resizeMode='cover'
        />
      ) : (
        <View className='mr-3 h-16 w-16 items-center justify-center rounded-xl'>
          <FontAwesomeIcon
            name='bell'
            size={32}
          />
        </View>
      )}

      <View className='flex-1'>
        <View className='mb-1 flex-row items-start justify-between gap-3'>
          <CustomText
            type='body'
            className='flex-1 text-text-black'
          >
            {title}
          </CustomText>

          {isUnread ? (
            <View className='h-4 w-4 rounded-full bg-cinnabar' />
          ) : null}
        </View>

        {description ? (
          <CustomText
            type='bodysmall'
            className='text-slate-900'
            numberOfLines={2}
          >
            {description}
          </CustomText>
        ) : null}

        <CustomText
          type='bodysmall'
          className='text-slate-900'
        >
          {formatRelativeDate(notification.createdAt, locale)}
        </CustomText>
      </View>
    </Pressable>
  );
};
