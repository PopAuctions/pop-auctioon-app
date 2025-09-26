/**
 * Test suite for Input component
 * Tests styling, props handling, and user interactions
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  describe('Basic rendering', () => {
    it('should render input correctly', () => {
      const { toJSON } = render(<Input />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should have correct displayName', () => {
      expect(Input.displayName).toBe('Input');
    });

    it('should render with placeholder text', () => {
      const { getByPlaceholderText } = render(
        <Input placeholder="Enter your name" />
      );

      expect(getByPlaceholderText('Enter your name')).toBeTruthy();
    });

    it('should render with initial value', () => {
      const { getByDisplayValue } = render(
        <Input value="Initial value" />
      );

      expect(getByDisplayValue('Initial value')).toBeTruthy();
    });
  });

  describe('Styling and customization', () => {
    it('should apply default className', () => {
      const { toJSON } = render(<Input />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should apply custom className', () => {
      const { toJSON } = render(<Input className="custom-input-class" />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should combine default and custom className', () => {
      const { toJSON } = render(
        <Input className="border-2 border-red-500" />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should apply custom style', () => {
      const customStyle = {
        backgroundColor: 'lightblue',
        borderWidth: 2,
        borderColor: 'blue',
      };

      const { toJSON } = render(<Input style={customStyle} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should combine className and style', () => {
      const customStyle = { fontSize: 18 };

      const { toJSON } = render(
        <Input className="text-lg" style={customStyle} />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle empty className', () => {
      const { toJSON } = render(<Input className="" />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('TextInput props', () => {
    it('should handle multiline input', () => {
      const { toJSON } = render(<Input multiline numberOfLines={4} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle secure text entry', () => {
      const { toJSON } = render(<Input secureTextEntry />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle keyboard type', () => {
      const { toJSON } = render(<Input keyboardType="email-address" />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle auto-complete type', () => {
      const { toJSON } = render(<Input autoComplete="email" />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle text content type', () => {
      const { toJSON } = render(<Input textContentType="password" />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle return key type', () => {
      const { toJSON } = render(<Input returnKeyType="done" />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle auto-correct', () => {
      const { toJSON } = render(<Input autoCorrect={false} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle auto-capitalize', () => {
      const { toJSON } = render(<Input autoCapitalize="words" />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Event handling', () => {
    it('should handle onChangeText event', () => {
      const mockOnChangeText = jest.fn();
      const { getByTestId } = render(
        <Input testID="text-input" onChangeText={mockOnChangeText} />
      );

      const input = getByTestId('text-input');
      fireEvent.changeText(input, 'new text');

      expect(mockOnChangeText).toHaveBeenCalledWith('new text');
    });

    it('should handle onFocus event', () => {
      const mockOnFocus = jest.fn();
      const { getByTestId } = render(
        <Input testID="text-input" onFocus={mockOnFocus} />
      );

      const input = getByTestId('text-input');
      fireEvent(input, 'focus');

      expect(mockOnFocus).toHaveBeenCalled();
    });

    it('should handle onBlur event', () => {
      const mockOnBlur = jest.fn();
      const { getByTestId } = render(
        <Input testID="text-input" onBlur={mockOnBlur} />
      );

      const input = getByTestId('text-input');
      fireEvent(input, 'blur');

      expect(mockOnBlur).toHaveBeenCalled();
    });

    it('should handle onSubmitEditing event', () => {
      const mockOnSubmitEditing = jest.fn();
      const { getByTestId } = render(
        <Input testID="text-input" onSubmitEditing={mockOnSubmitEditing} />
      );

      const input = getByTestId('text-input');
      fireEvent(input, 'submitEditing');

      expect(mockOnSubmitEditing).toHaveBeenCalled();
    });

    it('should handle multiple events', () => {
      const mockOnChangeText = jest.fn();
      const mockOnFocus = jest.fn();
      const mockOnBlur = jest.fn();

      const { getByTestId } = render(
        <Input
          testID="text-input"
          onChangeText={mockOnChangeText}
          onFocus={mockOnFocus}
          onBlur={mockOnBlur}
        />
      );

      const input = getByTestId('text-input');
      fireEvent(input, 'focus');
      fireEvent.changeText(input, 'test');
      fireEvent(input, 'blur');

      expect(mockOnFocus).toHaveBeenCalled();
      expect(mockOnChangeText).toHaveBeenCalledWith('test');
      expect(mockOnBlur).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should handle accessibility label', () => {
      const { toJSON } = render(
        <Input accessibilityLabel="Username input field" />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle accessibility hint', () => {
      const { toJSON } = render(
        <Input accessibilityHint="Enter your username here" />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle testID', () => {
      const { getByTestId } = render(<Input testID="username-input" />);
      expect(getByTestId('username-input')).toBeTruthy();
    });
  });

  describe('State management', () => {
    it('should handle controlled input', () => {
      const mockOnChangeText = jest.fn();
      const { getByDisplayValue, rerender } = render(
        <Input value="initial" onChangeText={mockOnChangeText} />
      );

      expect(getByDisplayValue('initial')).toBeTruthy();

      rerender(<Input value="updated" onChangeText={mockOnChangeText} />);
      expect(getByDisplayValue('updated')).toBeTruthy();
    });

    it('should handle uncontrolled input', () => {
      const { getByTestId } = render(
        <Input testID="uncontrolled-input" defaultValue="default text" />
      );

      const input = getByTestId('uncontrolled-input');
      fireEvent.changeText(input, 'new text');

      // Input should accept the change in uncontrolled mode
      expect(input).toBeTruthy();
    });

    it('should handle editable prop', () => {
      const { toJSON } = render(<Input editable={false} />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Placeholder handling', () => {
    it('should use default placeholder text color', () => {
      const { toJSON } = render(<Input placeholder="Test placeholder" />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle custom placeholder text color through props', () => {
      const { toJSON } = render(
        <Input
          placeholder="Custom color placeholder"
          placeholderTextColor="#ff0000"
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle empty placeholder', () => {
      const { toJSON } = render(<Input placeholder="" />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle long placeholder text', () => {
      const longPlaceholder = 'This is a very long placeholder text that might wrap or be truncated';
      const { toJSON } = render(<Input placeholder={longPlaceholder} />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Complex configurations', () => {
    it('should handle all props together', () => {
      const complexProps = {
        value: 'Complex input',
        placeholder: 'Enter complex data',
        multiline: true,
        numberOfLines: 3,
        keyboardType: 'email-address' as const,
        returnKeyType: 'done' as const,
        autoCorrect: false,
        autoCapitalize: 'none' as const,
        secureTextEntry: false,
        editable: true,
        className: 'custom-complex-input',
        style: { borderColor: 'green', borderWidth: 2 },
        testID: 'complex-input',
        accessibilityLabel: 'Complex input field',
      };

      const { toJSON } = render(<Input {...complexProps} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle form-like configuration', () => {
      const formInputProps = {
        placeholder: 'Email address',
        keyboardType: 'email-address' as const,
        autoComplete: 'email' as const,
        textContentType: 'emailAddress' as const,
        autoCapitalize: 'none' as const,
        autoCorrect: false,
        returnKeyType: 'next' as const,
      };

      const { toJSON } = render(<Input {...formInputProps} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle password input configuration', () => {
      const passwordProps = {
        placeholder: 'Password',
        secureTextEntry: true,
        textContentType: 'password' as const,
        autoComplete: 'password' as const,
        autoCapitalize: 'none' as const,
        autoCorrect: false,
        returnKeyType: 'done' as const,
      };

      const { toJSON } = render(<Input {...passwordProps} />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined props gracefully', () => {
      const { toJSON } = render(
        <Input
          value={undefined}
          placeholder={undefined}
          onChangeText={undefined}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle null values', () => {
      const { toJSON } = render(
        <Input
          style={null}
          className={undefined}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle special characters in value', () => {
      const specialValue = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const { getByDisplayValue } = render(<Input value={specialValue} />);
      expect(getByDisplayValue(specialValue)).toBeTruthy();
    });

    it('should handle emoji in value', () => {
      const emojiValue = '😀😂🎉🚀💯';
      const { getByDisplayValue } = render(<Input value={emojiValue} />);
      expect(getByDisplayValue(emojiValue)).toBeTruthy();
    });

    it('should handle very long text value', () => {
      const longValue = 'Lorem ipsum '.repeat(100);
      const { getByDisplayValue } = render(<Input value={longValue} />);
      expect(getByDisplayValue(longValue)).toBeTruthy();
    });
  });
});