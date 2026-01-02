import { Pressable, View } from 'react-native';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { CustomText } from '@/components/ui/CustomText';

export const ProviderButton = ({
  buttonText,
  icon,
  iconColor,
  onPress,
  variant = 'light',
}: {
  buttonText: string;
  icon: string;
  iconColor: `#${string}`;
  onPress: () => void;
  variant?: 'light' | 'dark';
}) => {
  const isDark = variant === 'dark';

  return (
    <Pressable
      onPress={onPress}
      className={[
        'w-full flex-row items-center rounded-lg border px-4 py-3',
        isDark ? 'border-black bg-black' : 'border-gray-300 bg-white',
      ].join(' ')}
    >
      {/* Left fixed slot */}
      <View className='w-10 items-start'>
        <FontAwesomeIcon
          name={icon}
          variant='bold'
          size={20}
          color={iconColor}
        />
      </View>

      {/* Middle grows, text truly centered */}
      <View className='flex-1 items-center'>
        <CustomText
          type='body'
          className={
            isDark ? 'text-center text-white' : 'text-gray-800 text-center'
          }
        >
          {buttonText}
        </CustomText>
      </View>

      {/* Right fixed slot to balance layout */}
      <View className='w-10' />
    </Pressable>
  );
};
