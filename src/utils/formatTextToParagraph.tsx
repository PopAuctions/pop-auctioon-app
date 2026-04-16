import { CustomText } from '@/components/ui/CustomText';
import { View } from 'react-native';

export const formatTextToParagraph = (
  text: string,
  spaceY: string = 'mb-4'
) => {
  const sections = text.split(/\n/);

  return sections.map((section, index) => {
    return (
      <View
        key={index}
        className={spaceY}
      >
        {section.split('\n').map((paragraph, index) => (
          <CustomText
            type='body'
            key={index}
            className='mb-1'
          >
            {paragraph}
          </CustomText>
        ))}
      </View>
    );
  });
};
