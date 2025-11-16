import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { CustomLink } from '@/components/ui/CustomLink';
import { Button } from '@/components/ui/Button';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/context/auth-context';
import { useMemo, useState } from 'react';
import { User } from '@/types/types';
import { Divider } from '@/components/ui/Divider';
import { CustomImage } from '@/components/ui/CustomImage';

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
                <FontAwesome
                  name='trophy'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.articlesWon')}
              </CustomText>
            </View>
            <FontAwesome
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
                <FontAwesome
                  name='user'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.editProfile')}
              </CustomText>
            </View>
            <FontAwesome
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
                <FontAwesome
                  name='lock'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.resetPassword')}
              </CustomText>
            </View>
            <FontAwesome
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
                <FontAwesome
                  name='phone'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.verifyPhone')}
              </CustomText>
            </View>
            <FontAwesome
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
                <FontAwesome
                  name='gavel'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.followedAuctions')}
              </CustomText>
            </View>
            <FontAwesome
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
                <FontAwesome
                  name='shopping-bag'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.followedArticles')}
              </CustomText>
            </View>
            <FontAwesome
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
                <FontAwesome
                  name='map-marker'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.addresses')}
              </CustomText>
            </View>
            <FontAwesome
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
                <FontAwesome
                  name='credit-card'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.billingInfo')}
              </CustomText>
            </View>
            <FontAwesome
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
                <FontAwesome
                  name='history'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.paymentsHistory')}
              </CustomText>
            </View>
            <FontAwesome
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
                <FontAwesome
                  name='info-circle'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.aboutUs')}
              </CustomText>
            </View>
            <FontAwesome
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
                <FontAwesome
                  name='question-circle'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.howItWorks')}
              </CustomText>
            </View>
            <FontAwesome
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
                <FontAwesome
                  name='comments'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>{t('screens.account.faqs')}</CustomText>
            </View>
            <FontAwesome
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
                <FontAwesome
                  name='envelope'
                  size={20}
                  color='#4d4d4d'
                />
              </View>
              <CustomText type='body'>
                {t('screens.account.contactUs')}
              </CustomText>
            </View>
            <FontAwesome
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
