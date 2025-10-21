import { View, ScrollView } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { CustomLink } from '@/components/ui/CustomLink';
import { Button } from '@/components/ui/Button';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/context/auth-context';
import { useState } from 'react';

export default function Account({ session }: { session: Session }) {
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  // Extraer iniciales del email del usuario
  const getUserInitials = () => {
    const email = session?.user?.email || '';
    const username = email.split('@')[0];
    return username.substring(0, 2).toUpperCase();
  };

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
        <View className='border-gray-200 border-b  px-6 pb-6 pt-4'>
          <View className='flex-row items-center'>
            {/* Avatar circular con iniciales */}
            <View className='mr-4 h-16 w-16 items-center justify-center rounded-full bg-yellow-400'>
              <CustomText
                type='h1'
                className='text-2xl font-bold text-black'
              >
                {getUserInitials()}
              </CustomText>
            </View>

            {/* Nombre de usuario */}
            <View className='flex-1'>
              <CustomText
                type='h2'
                className='text-xl font-bold text-black'
              >
                {session?.user?.email?.split('@')[0] || 'Usuario'}
              </CustomText>
            </View>
          </View>
        </View>

        {/* Opciones de cuenta */}
        <View className='mx-2 p-4'>
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
          <View className='border-gray-300 my-4 border-t' />

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
