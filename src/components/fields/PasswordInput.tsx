import { forwardRef, useState } from 'react';
import { Pressable, View, TextInput } from 'react-native';
import { Input } from '@/components/ui/Input';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';

type PasswordInputProps = React.ComponentProps<typeof TextInput>;

export const PasswordInput = forwardRef<TextInput, PasswordInputProps>(
  ({ className, editable = true, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <View className='relative'>
        <Input
          ref={ref}
          editable={editable}
          secureTextEntry={!isVisible}
          className={`${className ?? ''} pr-12`}
          {...props}
        />

        <Pressable
          onPress={() => setIsVisible((prev) => !prev)}
          disabled={!editable}
          className='absolute right-3 top-0 h-full items-center justify-center'
          hitSlop={10}
          accessibilityRole='button'
          accessibilityLabel={isVisible ? 'Hide password' : 'Show password'}
        >
          {isVisible ? (
            <FontAwesomeIcon
              name='eye-slash'
              variant='bold'
              size={20}
              color='cinnabar'
            />
          ) : (
            <FontAwesomeIcon
              name='eye'
              variant='bold'
              size={20}
              color='cinnabar'
            />
          )}
        </Pressable>
      </View>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
