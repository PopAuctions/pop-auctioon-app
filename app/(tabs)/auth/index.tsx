import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { CustomLink } from '@/components/ui/CustomLink';
import { Divider } from '@/components/ui/Divider';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { useOpenTerms } from '@/hooks/useOpenTerms';
import {
  FIRST_SECTION,
  FOURTH_SECTION,
  SECOND_SECTION,
  THIRD_SECTION,
} from '@/constants/no-session';

export default function AuthMenuScreen() {
  const { t } = useTranslation();
  const { handleOpenTerms } = useOpenTerms();

  return (
    <SafeAreaView
      className='flex-1 bg-white'
      edges={['top']}
    >
      <ScrollView className='flex-1'>
        {/* Header sin foto de perfil */}
        <View className='px-6 pb-6 pt-4'>
          <CustomText
            type='h1'
            className='text-2xl text-cinnabar'
          >
            {t('screens.account.account')}
          </CustomText>
        </View>

        <Divider />

        {/* Opciones de auth - Login y Register */}
        <View className='mx-2 p-4'>
          {FIRST_SECTION.map(({ name, icon, labelKey, href }) => (
            <CustomLink
              key={name}
              href={href}
              mode='empty'
              hoverEffect={false}
              className='mb-3 flex-row items-center justify-between py-4'
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
        <View className='mx-2 p-4'>
          {SECOND_SECTION.map(({ name, icon, labelKey, href }) => (
            <CustomLink
              key={name}
              href={href}
              mode='empty'
              hoverEffect={false}
              className='mb-3 flex-row items-center justify-between py-4'
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
        <View className='mx-2 p-4'>
          {THIRD_SECTION.map(({ name, icon, labelKey, href }) => (
            <CustomLink
              key={name}
              href={href}
              mode='empty'
              hoverEffect={false}
              className='mb-3 flex-row items-center justify-between py-4'
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
        <View className='mx-2 p-4'>
          {FOURTH_SECTION.map(({ name, icon, labelKey, href }) => {
            // Terms and Conditions abre directamente el PDF, los demás usan navegación normal
            const isTerms = name === 'terms-and-conditions';

            if (isTerms) {
              return (
                <Pressable
                  key={name}
                  onPress={handleOpenTerms}
                  className='mb-3 flex-row items-center justify-between py-4'
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
                className='mb-3 flex-row items-center justify-between py-4'
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
      </ScrollView>
    </SafeAreaView>
  );
}
