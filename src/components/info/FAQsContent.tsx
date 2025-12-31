import { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import type { FAQsData, Lang } from '@/types/types';

interface FAQsContentProps {
  data: FAQsData;
  locale: Lang;
}

export function FAQsContent({ data, locale }: FAQsContentProps) {
  const content = data[locale];

  // State to track which questions are expanded
  // Format: "categoryIndex-questionIndex" -> boolean
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const toggleItem = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isExpanded = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    return expandedItems[key] || false;
  };

  return (
    <ScrollView className='flex-1'>
      <View className='p-6'>
        {content.map((category, categoryIndex) => (
          <View
            key={categoryIndex}
            className='mb-6'
          >
            {/* Category subtitle */}
            <CustomText
              type='h2'
              className='mb-4 text-cinnabar'
            >
              {category.subtitle}
            </CustomText>

            {/* Questions - Accordion Style */}
            <View className='space-y-3'>
              {category.questions.map((item, questionIndex) => {
                const expanded = isExpanded(categoryIndex, questionIndex);

                return (
                  <View
                    key={questionIndex}
                    className='border-gray-200 my-2 rounded-lg border bg-white px-5 py-5'
                  >
                    {/* Question Button */}
                    <TouchableOpacity
                      onPress={() => toggleItem(categoryIndex, questionIndex)}
                      className='flex-row items-center justify-between'
                      activeOpacity={0.7}
                    >
                      <CustomText
                        type='body'
                        className='flex-1 pr-4 font-bold text-black'
                      >
                        {item.question}
                      </CustomText>

                      {/* Plus/Minus Icon */}
                      <View className='ml-2 h-6 w-6 items-center justify-center'>
                        <FontAwesomeIcon
                          name={expanded ? 'minus' : 'plus'}
                          size={16}
                          color='cinnabar'
                        />
                      </View>
                    </TouchableOpacity>

                    {/* Answer Panel - Collapsible */}
                    {expanded && (
                      <View className='border-gray-100 mt-4 border-t pt-4'>
                        <CustomText
                          type='body'
                          className='text-gray-700 leading-7'
                        >
                          {item.answer}
                        </CustomText>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <View className='h-8' />
      </View>
    </ScrollView>
  );
}
