import { router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { FontAwesomeIcon } from '../ui/FontAwesomeIcon';

type SelectOption = { label: string; value: string };

interface Props {
  name: string;
  value: string | null;
  options: SelectOption[];
  placeholder?: string;
  isSearchable?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  formField?: boolean;
  onChange?: (value: string | null) => void;
}

export function SelectField({
  name,
  value,
  options,
  isSearchable = false,
  isClearable = false,
  isDisabled = false,
  placeholder,
  formField = false,
  onChange,
}: Props) {
  const setParam = (val?: string) => {
    router.setParams({ [name]: (val as any) ?? (undefined as any) });
  };

  const handleSelect = (item: any) => {
    const nextVal: string = item?.value ?? '';

    if (formField && onChange) {
      // Form mode: call the provided onChange handler
      onChange(nextVal || null);
    } else {
      // Query params mode: use router.setParams
      if (nextVal) {
        setParam(nextVal);
      } else {
        setParam(undefined);
      }
    }
  };

  const handleClear = () => {
    if (formField && onChange) {
      // Form mode: call the provided onChange handler with null
      onChange(null);
    } else {
      // Query params mode: use router.setParams
      setParam(undefined);
    }
  };

  return (
    <View className='relative w-full'>
      <Dropdown
        data={options}
        labelField='label'
        valueField='value'
        placeholder={placeholder || '...'}
        value={value}
        onChange={handleSelect}
        style={{
          borderWidth: 1,
          borderColor: isDisabled ? '#ccc' : '#000',
          borderRadius: 8,
          padding: 10,
          paddingRight: isClearable ? 38 : 10,
        }}
        placeholderStyle={{ color: '#999' }}
        selectedTextStyle={{ color: '#000' }}
        inputSearchStyle={{ color: '#000' }}
        search={isSearchable}
        disable={isDisabled}
        showsVerticalScrollIndicator={false}
      />

      {isClearable && (
        <Pressable
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: [{ translateY: -12 }],
            height: 24,
            width: 24,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            opacity: !value || isDisabled ? 0.3 : 1,
          }}
          disabled={!value || isDisabled}
          hitSlop={8}
          accessibilityRole='button'
          accessibilityLabel={`Clear ${name}`}
          onStartShouldSetResponder={() => true}
          onPress={handleClear}
        >
          <FontAwesomeIcon
            name='close'
            variant='bold'
            size={20}
            color='cinnabar'
          />
        </Pressable>
      )}
    </View>
  );
}
