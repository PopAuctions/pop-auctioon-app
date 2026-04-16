import { View } from '@/components/Themed';
import { CustomError } from '@/components/ui/CustomError';
import { CustomImage } from '@/components/ui/CustomImage';
import { CustomLink } from '@/components/ui/CustomLink';
import { CustomText } from '@/components/ui/CustomText';
import { Divider } from '@/components/ui/Divider';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { REQUEST_STATUS } from '@/constants';
import { INDEX_OPTIONS } from '@/constants/auctioneer';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useGetCurrentUser } from '@/hooks/pages/user/useGetCurrentUser';
import { useHideWhileStackBuilds } from '@/hooks/useHideWhileStackBuilds';
import { useMemo } from 'react';
import { ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function AuctioneerTab() {
  const { t } = useTranslation();
  const { data: currentUser, status, errorMessage } = useGetCurrentUser();
  const { isNavigating } = useAuthNavigation();
  const shouldHide = useHideWhileStackBuilds();

  const storeInitials = useMemo(() => {
    return currentUser?.storeName?.substring(0, 2).toUpperCase() ?? '';
  }, [currentUser]);

  if (shouldHide) {
    return <View className='flex-1 bg-white' />;
  }

  // Si no hay sesión, mostrar loading mientras ProtectedRoute maneja la redirección
  if (status === REQUEST_STATUS.loading || status === REQUEST_STATUS.idle) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator
          size='large'
          color='#d75639'
        />
      </View>
    );
  }

  if (status === REQUEST_STATUS.error || !currentUser) {
    return (
      <CustomError
        customMessage={errorMessage}
        refreshRoute='/(tabs)/auctioneer'
      />
    );
  }

  // Mostrar loading si está navegando
  if (isNavigating) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator
          size='large'
          color='#d75639'
        />
      </View>
    );
  }

  return (
    <ScrollView className='flex-1'>
      <View className='flex-row items-center px-6 pb-6 pt-4'>
        {/* Avatar circular con iniciales */}
        {currentUser.profilePicture ? (
          <View className='mr-4 h-20 w-20 overflow-hidden rounded-full bg-neutral-200'>
            <CustomImage
              src={currentUser.profilePicture}
              alt={`${currentUser.storeName} Image`}
              className='h-full w-full'
              resizeMode='cover'
            />
          </View>
        ) : (
          <View className='mr-4 h-20 w-20 items-center justify-center rounded-full bg-cinnabar'>
            <CustomText
              type='h1'
              className='text-center text-2xl font-bold text-white'
            >
              {storeInitials}
            </CustomText>
          </View>
        )}

        {/* Nombre de usuario */}
        <View className='flex-1 gap-2'>
          <CustomText
            type='h2'
            className='text-xl'
          >
            {`${currentUser.storeName}`}
          </CustomText>
          <CustomText
            type='h4'
            className={`text-base ${currentUser.active ? 'text-green-600' : 'text-red-600'}`}
          >
            {currentUser.active
              ? t('screens.auctioneer.auctioneerActive')
              : t('screens.auctioneer.auctioneerNotActive')}
          </CustomText>
        </View>
      </View>

      <Divider />
      {/* Header con avatar y nombre de usuario */}
      <View className='mx-2 p-2'>
        {INDEX_OPTIONS.map(({ name, icon, labelKey, href, role }) => {
          if (role && currentUser.role !== role) {
            return null;
          }

          return (
            <CustomLink
              key={name}
              href={href}
              mode='empty'
              hoverEffect={false}
              className='flex-row items-center justify-between py-4'
            >
              <View className='flex-row items-center'>
                <View className='mr-4 h-10 w-10 items-center justify-center'>
                  <FontAwesomeIcon
                    variant='bold'
                    name={icon}
                    size={20}
                    color='#4d4d4d'
                  />
                </View>

                <View className='flex flex-row items-center justify-center gap-3'>
                  <CustomText
                    type='body'
                    className='leading-[20px]'
                  >
                    {t(labelKey as any)}
                  </CustomText>
                </View>
              </View>

              <View className='h-10 justify-center'>
                <FontAwesomeIcon
                  variant='bold'
                  name='chevron-right'
                  size={16}
                  color='#9ca3af'
                />
              </View>
            </CustomLink>
          );
        })}
      </View>
    </ScrollView>
  );
}
