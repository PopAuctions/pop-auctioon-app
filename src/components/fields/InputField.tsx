import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { FontAwesomeIcon } from '../ui/FontAwesomeIcon';
import { useDebounce } from '@/hooks/useDebounce';

interface InputProps {
  name: string;
  value: string | null;
  placeholder?: string;
  isClearable?: boolean;
  isDisabled?: boolean;
  formField?: boolean;
  onChange?: (value: string | null) => void;
}

export function TextField({
  name,
  value,
  placeholder,
  isClearable = false,
  isDisabled = false,
  formField = false,
  onChange,
}: InputProps) {
  const [localValue, setLocalValue] = useState(value ?? '');
  const debouncedValue = useDebounce<string>(localValue);

  const setParam = (val?: string) => {
    setLocalValue(val ?? '');
  };

  const handleChange = (text: string) => {
    if (formField && onChange) {
      onChange(text || null);
    } else {
      if (text) {
        setParam(text);
      } else {
        setParam(undefined);
      }
    }
  };

  const handleClear = () => {
    if (formField && onChange) {
      onChange(null);
    } else {
      setParam(undefined);
    }
  };

  useEffect(() => {
    router.setParams({ [name]: (debouncedValue as any) ?? (undefined as any) });
  }, [debouncedValue, name]);

  return (
    <View className='relative w-full'>
      <TextInput
        value={localValue}
        onChangeText={handleChange}
        editable={!isDisabled}
        placeholder={placeholder || '...'}
        placeholderTextColor='#999'
        style={{
          borderWidth: 1,
          borderColor: isDisabled ? '#ccc' : '#000',
          borderRadius: 8,
          padding: 10,
          paddingRight: isClearable ? 38 : 10,
          color: '#000',
        }}
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
            opacity: !localValue || isDisabled ? 0.3 : 1,
          }}
          disabled={!localValue || isDisabled}
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
