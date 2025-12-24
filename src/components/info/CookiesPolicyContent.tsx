import { View, ScrollView, Linking, Pressable } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import type { CookiesPolicyData, Lang } from '@/types/types';

interface CookiesPolicyContentProps {
  data: CookiesPolicyData;
  locale: Lang;
}

export function CookiesPolicyContent({
  data,
  locale,
}: CookiesPolicyContentProps) {
  const content = data[locale];

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error('Cannot open URL:', url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  return (
    <ScrollView className='flex-1'>
      <View className='p-6'>
        <CustomText
          type='h1'
          className='mb-4 text-black'
        >
          {content.title}
        </CustomText>

        <CustomText
          type='subtitle'
          className='mb-6'
        >
          {content.description}
        </CustomText>

        {/* ¿Qué son las cookies? */}
        <CustomText
          type='h3'
          className='mb-2 text-black'
        >
          {content.whatAreCookies.title}
        </CustomText>
        <CustomText
          type='body'
          className='mb-6'
        >
          {content.whatAreCookies.content}
        </CustomText>

        {/* Tipos de cookies */}
        <CustomText
          type='h3'
          className='mb-3 text-black'
        >
          {content.cookiesTypes.title}
        </CustomText>
        {content.cookiesTypes.types.map((type, index) => (
          <View
            key={index}
            className='mb-4'
          >
            <CustomText
              type='h4'
              className='mb-1 text-black'
            >
              {type.name}
            </CustomText>
            <CustomText type='body'>{type.description}</CustomText>
          </View>
        ))}

        {/* Cookies de terceros */}
        <CustomText
          type='h3'
          className='mb-2 mt-4 text-black'
        >
          {content.thirdPartyCookies.title}
        </CustomText>
        <CustomText
          type='body'
          className='mb-6'
        >
          {content.thirdPartyCookies.content}
        </CustomText>

        {/* Gestión de cookies */}
        <CustomText
          type='h3'
          className='mb-2 text-black'
        >
          {content.manageCookies.title}
        </CustomText>
        <CustomText
          type='body'
          className='mb-4'
        >
          {content.manageCookies.content}
        </CustomText>

        {/* Links a navegadores */}
        {content.manageCookies.browsers.map((browser, index) => (
          <Pressable
            key={index}
            onPress={() => handleOpenLink(browser.url)}
            className='mb-2 active:opacity-70'
          >
            <CustomText
              type='body'
              className='text-cinnabar underline'
            >
              • {browser.name}
            </CustomText>
          </Pressable>
        ))}

        <CustomText
          type='bodysmall'
          className='text-gray-600 mt-4'
        >
          {content.manageCookies.note}
        </CustomText>

        {/* Espacio adicional al final */}
        <View className='h-8' />
      </View>
    </ScrollView>
  );
}
