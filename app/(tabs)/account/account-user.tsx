import { View, ScrollView } from 'react-native';
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

export default function Account({ currentUser }: { currentUser: User }) {
  const { signOut } = useAuth();
  const { t } = useTranslation();
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
      className='flex-1 '
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

        {/* Opciones de cuenta */}
        <View className='mx-2 p-4'>
          {/* Articles Won */}
          <CustomLink
            href='/(tabs)/account/articles-won'
            mode='empty'
            hoverEffect={false}
            className='mb-3 flex-row items-center justify-between py-4'
          >
            <View className='flex-row items-center'>
              <View className='mr-4 h-10 w-10 items-center justify-center rounded-full'>
                <FontAwesomeIcon
                  variant='bold'
                  name='trophy'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.articlesWon')}
              </CustomText>
            </View>
            <FontAwesomeIcon
              variant='bold'
              name='chevron-right'
              size={16}
              color='#9ca3af'
            />
          </CustomLink>

          {/* Edit Profile */}
          <CustomLink
            href='/(tabs)/account/edit-profile'
            mode='empty'
            hoverEffect={false}
            className='mb-3 flex-row items-center justify-between py-4'
          >
            <View className='flex-row items-center'>
              <View className='mr-4 h-10 w-10 items-center justify-center rounded-full'>
                <FontAwesomeIcon
                  variant='bold'
                  name='user'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.editProfile')}
              </CustomText>
            </View>
            <FontAwesomeIcon
              variant='bold'
              name='chevron-right'
              size={16}
              color='#9ca3af'
            />
          </CustomLink>

          {/* Reset Password */}
          <CustomLink
            href='/(tabs)/account/reset-password'
            mode='empty'
            hoverEffect={false}
            className='mb-3 flex-row items-center justify-between py-4'
          >
            <View className='flex-row items-center'>
              <View className='mr-4 h-10 w-10 items-center justify-center rounded-full'>
                <FontAwesomeIcon
                  variant='bold'
                  name='lock'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.resetPassword')}
              </CustomText>
            </View>
            <FontAwesomeIcon
              variant='bold'
              name='chevron-right'
              size={16}
              color='#9ca3af'
            />
          </CustomLink>

          {/* Verify Phone */}
          <CustomLink
            href='/(tabs)/account/verify-phone'
            mode='empty'
            hoverEffect={false}
            className='mb-3 flex-row items-center justify-between py-4'
          >
            <View className='flex-row items-center'>
              <View className='mr-4 h-10 w-10 items-center justify-center rounded-full'>
                <FontAwesomeIcon
                  variant='bold'
                  name='phone'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.verifyPhone')}
              </CustomText>
            </View>
            <FontAwesomeIcon
              variant='bold'
              name='chevron-right'
              size={16}
              color='#9ca3af'
            />
          </CustomLink>

          {/* Offers Done */}
          <CustomLink
            href='/(tabs)/account/offers-made'
            mode='empty'
            hoverEffect={false}
            className='mb-3 flex flex-row items-center justify-between py-4'
          >
            <View className='flex flex-row items-center'>
              <View className='mr-4 h-10 w-10 items-center justify-center rounded-full'>
                <FontAwesomeIcon
                  variant='bold'
                  name='list-alt'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.offersMade')}
              </CustomText>
            </View>
            <FontAwesomeIcon
              variant='bold'
              name='chevron-right'
              size={16}
              color='#9ca3af'
            />
          </CustomLink>

          {/* Followed Auctions */}
          <CustomLink
            href='/(tabs)/account/followed-auctions'
            mode='empty'
            hoverEffect={false}
            className='mb-3 flex-row items-center justify-between py-4'
          >
            <View className='flex-row items-center'>
              <View className='mr-4 h-10 w-10 items-center justify-center rounded-full'>
                <FontAwesomeIcon
                  variant='bold'
                  name='gavel'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.followedAuctions')}
              </CustomText>
            </View>
            <FontAwesomeIcon
              variant='bold'
              name='chevron-right'
              size={16}
              color='#9ca3af'
            />
          </CustomLink>

          {/* Followed Articles */}
          <CustomLink
            href='/(tabs)/account/followed-articles'
            mode='empty'
            hoverEffect={false}
            className='mb-3 flex-row items-center justify-between py-4'
          >
            <View className='flex-row items-center'>
              <View className='mr-4 h-10 w-10 items-center justify-center rounded-full'>
                <FontAwesomeIcon
                  variant='bold'
                  name='shopping-bag'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.followedArticles')}
              </CustomText>
            </View>
            <FontAwesomeIcon
              variant='bold'
              name='chevron-right'
              size={16}
              color='#9ca3af'
            />
          </CustomLink>

          {/* Addresses */}
          <CustomLink
            href='/(tabs)/account/addresses'
            mode='empty'
            hoverEffect={false}
            className='mb-3 flex-row items-center justify-between py-4'
          >
            <View className='flex-row items-center'>
              <View className='mr-4 h-10 w-10 items-center justify-center rounded-full'>
                <FontAwesomeIcon
                  variant='bold'
                  name='map-marker'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.addresses')}
              </CustomText>
            </View>
            <FontAwesomeIcon
              variant='bold'
              name='chevron-right'
              size={16}
              color='#9ca3af'
            />
          </CustomLink>

          {/* Billing Information */}
          <CustomLink
            href='/(tabs)/account/billing-info'
            mode='empty'
            hoverEffect={false}
            className='mb-3 flex-row items-center justify-between py-4'
          >
            <View className='flex-row items-center'>
              <View className='mr-4 h-10 w-10 items-center justify-center rounded-full'>
                <FontAwesomeIcon
                  variant='bold'
                  name='credit-card'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.billingInfo')}
              </CustomText>
            </View>
            <FontAwesomeIcon
              variant='bold'
              name='chevron-right'
              size={16}
              color='#9ca3af'
            />
          </CustomLink>

          {/* Payments History */}
          <CustomLink
            href='/(tabs)/account/payments-history'
            mode='empty'
            hoverEffect={false}
            className='mb-3 flex-row items-center justify-between py-4'
          >
            <View className='flex-row items-center'>
              <View className='mr-4 h-10 w-10 items-center justify-center rounded-full'>
                <FontAwesomeIcon
                  variant='bold'
                  name='history'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.paymentsHistory')}
              </CustomText>
            </View>
            <FontAwesomeIcon
              variant='bold'
              name='chevron-right'
              size={16}
              color='#9ca3af'
            />
          </CustomLink>

          {/* Settings */}
          <CustomLink
            href='/(tabs)/account/settings'
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

          {/* Línea divisoria */}
          <Divider className='my-2' />

          {/* About Us */}
          <CustomLink
            href='/(tabs)/account/info/about-us'
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

          {/* How it Works */}
          <CustomLink
            href='/(tabs)/account/info/how-it-works'
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
            href='/(tabs)/account/info/faqs'
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
            href='/(tabs)/account/info/contact-us'
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

          {/* Línea divisoria */}
          <Divider className='my-2' />

          {/* Terms and Conditions */}
          <CustomLink
            href='/(tabs)/account/info/terms-and-conditions'
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
            href='/(tabs)/account/info/privacy-policy'
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
            href='/(tabs)/account/info/cookies-policy'
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

          {/* Sign Out Button */}
          <View className='mt-6'>
            <Button
              mode='primary'
              isLoading={loading}
              disabled={loading}
              onPress={handleSignOut}
            >
              {t('screens.account.signOut')}
            </Button>
          </View>

          {/* Espacio adicional al final */}
          <View className='h-8' />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
