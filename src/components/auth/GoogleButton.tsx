import { Pressable } from 'react-native';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { CustomText } from '@/components/ui/CustomText';
import { supabase } from '@/utils/supabase/supabase-store';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export const GoogleButton = ({ buttonText }: { buttonText: string }) => {
  const handleGooglePress = async () => {
    const redirectTo = Linking.createURL('/auth/callback');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });

    if (error) throw error;
    if (!data.url) throw new Error('No OAuth URL returned');

    const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    console.log('WebBrowser result:', res);

    if (res.type !== 'success') {
      console.log('OAuth flow was not completed successfully');
      return;
    }
  };

  return (
    <Pressable
      onPress={handleGooglePress}
      className='border-gray-300 flex-row items-center justify-center gap-3 rounded-lg border bg-white px-4 py-3'
    >
      <FontAwesomeIcon
        name='google'
        variant='bold'
        size={20}
        color='#4285F4'
      />
      <CustomText
        type='body'
        className='text-gray-800'
      >
        {buttonText} Google
      </CustomText>
    </Pressable>
  );
};
