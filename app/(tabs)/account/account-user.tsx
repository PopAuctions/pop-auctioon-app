import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { CustomLink } from '@/components/ui/CustomLink';
import { Button } from '@/components/ui/Button';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useMemo, useState } from 'react';
import { User } from '@/types/types';
import { Divider } from '@/components/ui/Divider';
import { CustomImage } from '@/components/ui/CustomImage';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { useOpenTerms } from '@/hooks/useOpenTerms';
import {
  FIRST_SECTION,
  FOURTH_SECTION,
  SECOND_SECTION,
  THIRD_SECTION,
} from '@/constants/session';

export default function Account({ currentUser }: { currentUser: User }) {
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const { handleOpenTerms } = useOpenTerms();
  const [loading, setLoading] = useState(false);

  const userInitials = useMemo(() => {
    return currentUser.username.substring(0, 2).toUpperCase();
  }, [currentUser.username]);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    router.replace('/(tabs)/auth');
    setLoading(false);
  };

  return (
    <SafeAreaView
      className='flex-1'
      edges={['top']}
    >
      <ScrollView className='flex-1'>
        {/* Header con avatar y nombre de usuario */}
        <View className='flex-row items-center px-6 pb-6 pt-4'>
          {/* Avatar circular con iniciales */}
          {currentUser.profilePicture ? (
            <View className='mr-4 h-20 w-20 overflow-hidden rounded-full bg-neutral-200'>
              <CustomImage
                src={currentUser.profilePicture}
                alt={`${currentUser.username} ${currentUser.lastName} Image`}
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
                {userInitials}
              </CustomText>
            </View>
          )}

          {/* Nombre de usuario */}
          <View className='flex-1 gap-2'>
            <CustomText
              type='h2'
              className='text-xl'
            >
              {`${currentUser.name} ${currentUser.lastName}`}
            </CustomText>
            <CustomText
              type='h2'
              className='text-base'
            >
              {currentUser.email}
            </CustomText>
            <CustomText
              type='h4'
              className={`text-base ${currentUser.phoneValidated ? 'text-green-600' : 'text-red-600'}`}
            >
              {currentUser.phoneValidated
                ? t('screens.account.phoneVerified')
                : t('screens.account.phoneNotVerified')}
            </CustomText>
          </View>
        </View>

        <Divider />

        <View className='mx-2 p-2'>
          {FIRST_SECTION.map(({ name, icon, labelKey, href }) => (
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

                <View className='h-10 justify-center'>
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
          ))}
        </View>

        <Divider />

        {/* Settings */}
        <View className='mx-2 p-2'>
          {SECOND_SECTION.map(({ name, icon, labelKey, href }) => (
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

                <View className='h-10 justify-center'>
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
          ))}
        </View>

        <Divider />

        {/* Info Pages */}
        <View className='mx-2 p-2'>
          {THIRD_SECTION.map(({ name, icon, labelKey, href }) => (
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

                <View className='h-10 justify-center'>
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
          ))}
        </View>

        <Divider />

        {/* Legal Pages */}
        <View className='mx-2 p-2'>
          {FOURTH_SECTION.map(({ name, icon, labelKey, href }) => {
            // Terms and Conditions abre directamente el PDF, los demás usan navegación normal
            const isTerms = name === 'terms-and-conditions';

            if (isTerms) {
              return (
                <Pressable
                  key={name}
                  onPress={handleOpenTerms}
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

                    <View className='h-10 justify-center'>
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
                </Pressable>
              );
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

                  <View className='h-10 justify-center'>
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

        <View className='mx-4 p-2'>
          <Button
            mode='primary'
            isLoading={loading}
            disabled={loading}
            onPress={handleSignOut}
          >
            {t('screens.account.signOut')}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
