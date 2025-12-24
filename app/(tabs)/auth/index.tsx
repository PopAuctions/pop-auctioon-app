import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { CustomLink } from '@/components/ui/CustomLink';
import { Divider } from '@/components/ui/Divider';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';

export default function AuthMenuScreen() {
  const { t } = useTranslation();

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
          {/* Login */}
          <CustomLink
            href='/(tabs)/auth/login'
            mode='empty'
            hoverEffect={false}
            className='mb-3 flex-row items-center justify-between py-4'
          >
            <View className='flex-row items-center'>
              <View className='mr-4 h-10 w-10 items-center justify-center rounded-full'>
                <FontAwesomeIcon
                  variant='bold'
                  name='sign-in'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>{t('screens.account.login')}</CustomText>
            </View>
            <FontAwesomeIcon
              variant='bold'
              name='chevron-right'
              size={16}
              color='#9ca3af'
            />
          </CustomLink>

          {/* Register */}
          <CustomLink
            href='/(tabs)/auth/register'
            mode='empty'
            hoverEffect={false}
            className='mb-3 flex-row items-center justify-between py-4'
          >
            <View className='flex-row items-center'>
              <View className='mr-4 h-10 w-10 items-center justify-center rounded-full'>
                <FontAwesomeIcon
                  variant='bold'
                  name='user-plus'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.register')}
              </CustomText>
            </View>
            <FontAwesomeIcon
              variant='bold'
              name='chevron-right'
              size={16}
              color='#9ca3af'
            />
          </CustomLink>
        </View>

        <Divider />

        {/* Settings */}
        <View className='mx-2 p-4'>
          <CustomLink
            href='/(tabs)/auth/settings'
            mode='empty'
            hoverEffect={false}
            className='mb-3 flex-row items-center justify-between py-4'
          >
            <View className='flex-row items-center'>
              <View className='mr-4 h-10 w-10 items-center justify-center rounded-full'>
                <FontAwesomeIcon
                  variant='bold'
                  name='gear'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.settings')}
              </CustomText>
            </View>
            <FontAwesomeIcon
              variant='bold'
              name='chevron-right'
              size={16}
              color='#9ca3af'
            />
          </CustomLink>
        </View>

        <Divider />

        {/* Info Pages */}
        <View className='mx-2 p-4'>
          {/* About Us */}
          <CustomLink
            href='/(tabs)/auth/info/about-us'
            mode='empty'
            hoverEffect={false}
            className='mb-3 flex-row items-center justify-between py-4'
          >
            <View className='flex-row items-center'>
              <View className='mr-4 h-10 w-10 items-center justify-center rounded-full'>
                <FontAwesomeIcon
                  variant='bold'
                  name='info-circle'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.aboutUs')}
              </CustomText>
            </View>
            <FontAwesomeIcon
              variant='bold'
              name='chevron-right'
              size={16}
              color='#9ca3af'
            />
          </CustomLink>

          {/* How It Works */}
          <CustomLink
            href='/(tabs)/auth/info/how-it-works'
            mode='empty'
            hoverEffect={false}
            className='mb-3 flex-row items-center justify-between py-4'
          >
            <View className='flex-row items-center'>
              <View className='mr-4 h-10 w-10 items-center justify-center rounded-full'>
                <FontAwesomeIcon
                  variant='bold'
                  name='question-circle'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.howItWorks')}
              </CustomText>
            </View>
            <FontAwesomeIcon
              variant='bold'
              name='chevron-right'
              size={16}
              color='#9ca3af'
            />
          </CustomLink>

          {/* FAQs */}
          <CustomLink
            href='/(tabs)/auth/info/faqs'
            mode='empty'
            hoverEffect={false}
            className='mb-3 flex-row items-center justify-between py-4'
          >
            <View className='flex-row items-center'>
              <View className='mr-4 h-10 w-10 items-center justify-center rounded-full'>
                <FontAwesomeIcon
                  variant='bold'
                  name='comments'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>{t('screens.account.faqs')}</CustomText>
            </View>
            <FontAwesomeIcon
              variant='bold'
              name='chevron-right'
              size={16}
              color='#9ca3af'
            />
          </CustomLink>

          {/* Contact Us */}
          <CustomLink
            href='/(tabs)/auth/info/contact-us'
            mode='empty'
            hoverEffect={false}
            className='mb-3 flex-row items-center justify-between py-4'
          >
            <View className='flex-row items-center'>
              <View className='mr-4 h-10 w-10 items-center justify-center rounded-full'>
                <FontAwesomeIcon
                  variant='bold'
                  name='envelope'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.contactUs')}
              </CustomText>
            </View>
            <FontAwesomeIcon
              variant='bold'
              name='chevron-right'
              size={16}
              color='#9ca3af'
            />
          </CustomLink>
        </View>

        <Divider />

        {/* Legal Pages */}
        <View className='mx-2 p-4'>
          {/* Terms and Conditions */}
          <CustomLink
            href='/(tabs)/auth/info/terms-and-conditions'
            mode='empty'
            hoverEffect={false}
            className='mb-3 flex-row items-center justify-between py-4'
          >
            <View className='flex-row items-center'>
              <View className='mr-4 h-10 w-10 items-center justify-center rounded-full'>
                <FontAwesomeIcon
                  variant='bold'
                  name='file-text'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.termsAndConditions')}
              </CustomText>
            </View>
            <FontAwesomeIcon
              variant='bold'
              name='chevron-right'
              size={16}
              color='#9ca3af'
            />
          </CustomLink>

          {/* Privacy Policy */}
          <CustomLink
            href='/(tabs)/auth/info/privacy-policy'
            mode='empty'
            hoverEffect={false}
            className='mb-3 flex-row items-center justify-between py-4'
          >
            <View className='flex-row items-center'>
              <View className='mr-4 h-10 w-10 items-center justify-center rounded-full'>
                <FontAwesomeIcon
                  variant='bold'
                  name='shield'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.privacyPolicy')}
              </CustomText>
            </View>
            <FontAwesomeIcon
              variant='bold'
              name='chevron-right'
              size={16}
              color='#9ca3af'
            />
          </CustomLink>

          {/* Cookies Policy */}
          <CustomLink
            href='/(tabs)/auth/info/cookies-policy'
            mode='empty'
            hoverEffect={false}
            className='mb-3 flex-row items-center justify-between py-4'
          >
            <View className='flex-row items-center'>
              <View className='mr-4 h-10 w-10 items-center justify-center rounded-full'>
                <FontAwesomeIcon
                  variant='bold'
                  name='file'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.cookiesPolicy')}
              </CustomText>
            </View>
            <FontAwesomeIcon
              variant='bold'
              name='chevron-right'
              size={16}
              color='#9ca3af'
            />
          </CustomLink>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
