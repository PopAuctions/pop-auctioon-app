import { router } from 'expo-router';
import React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { FontAwesomeIcon } from '../ui/FontAwesomeIcon';

type SelectOption = { label: string; value: string };

type Props = {
  name: string;
  value: string | null;
  options: SelectOption[];
  isSearchable?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
  formField?: boolean;
  onChange?: (value: string | null) => void;
  onSearchChange?: (value: string) => void;
};

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
  onSearchChange,
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
      setParam(nextVal || undefined);
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
    onSearchChange?.('');
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
        onChangeText={onSearchChange}
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
        autoScroll={false}
        renderInputSearch={(onSearch) => (
          <TextInput
            autoFocus
            placeholder='...'
            placeholderTextColor='#999'
            onChangeText={onSearch}
            style={{
              height: 42,
              margin: 8,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: '#000',
              borderRadius: 8,
              color: '#000',
              backgroundColor: '#fff',
            }}
          />
        )}
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
