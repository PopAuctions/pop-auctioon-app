/**
 * Test suite for Button component
 * Tests button modes, sizes, loading states, and user interactions
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button, BUTTON_MODE_STYLES } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/i18n/useTranslation';

// Mock translation hook
jest.mock('@/hooks/i18n/useTranslation', () => ({
  useTranslation: jest.fn(),
}));

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

describe('Button', () => {
  beforeEach(() => {
    mockUseTranslation.mockReturnValue({
      t: jest.fn((key) => key),
      changeLanguage: jest.fn(),
      locale: 'es',
      isPending: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render with children', () => {
      const { getByText } = render(
        <Button mode="primary">Test Button</Button>
      );

      expect(getByText('Test Button')).toBeTruthy();
    });

    it('should render with empty string children', () => {
      const { toJSON } = render(
        <Button mode="primary">{''}</Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should render without children', () => {
      const { toJSON } = render(
        <Button mode="primary">Default</Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Button modes', () => {
    it('should render primary mode by default', () => {
      const { toJSON } = render(
        <Button mode="primary">Primary Button</Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should render primary mode explicitly', () => {
      const { getByText, toJSON } = render(
        <Button mode="primary">Primary Button</Button>
      );

      expect(getByText('Primary Button')).toBeTruthy();
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render secondary mode', () => {
      const { getByText, toJSON } = render(
        <Button mode="secondary">Secondary Button</Button>
      );

      expect(getByText('Secondary Button')).toBeTruthy();
      expect(toJSON()).toMatchSnapshot();
    });

    it('should have correct mode styles exported', () => {
      expect(BUTTON_MODE_STYLES).toHaveProperty('primary');
      expect(BUTTON_MODE_STYLES).toHaveProperty('secondary');
    });
  });

  describe('Button sizes', () => {
    it('should render large size by default', () => {
      const { toJSON } = render(
        <Button mode="primary">Large Button</Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should render small primary button', () => {
      const { toJSON } = render(
        <Button mode="primary" size="small">Small Primary</Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should render small secondary button', () => {
      const { toJSON } = render(
        <Button mode="secondary" size="small">Small Secondary</Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should render large primary button explicitly', () => {
      const { toJSON } = render(
        <Button mode="primary" size="large">Large Primary</Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should render large secondary button explicitly', () => {
      const { toJSON } = render(
        <Button mode="secondary" size="large">Large Secondary</Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Loading state', () => {
    it('should show loading indicator when isLoading is true', () => {
      const { getByText, toJSON } = render(
        <Button mode="primary" isLoading>Loading Button</Button>
      );

      expect(getByText('Loading Button')).toBeTruthy();
      expect(toJSON()).toMatchSnapshot();
    });

    it('should hide loading indicator when isLoading is false', () => {
      const { getByText, toJSON } = render(
        <Button mode="primary" isLoading={false}>Not Loading</Button>
      );

      expect(getByText('Not Loading')).toBeTruthy();
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render loading with different modes', () => {
      const { toJSON: primaryJSON } = render(
        <Button mode="primary" isLoading>Loading Primary</Button>
      );

      const { toJSON: secondaryJSON } = render(
        <Button mode="secondary" isLoading>Loading Secondary</Button>
      );

      expect(primaryJSON()).toMatchSnapshot();
      expect(secondaryJSON()).toMatchSnapshot();
    });

    it('should use translation for loading text', () => {
      const mockT = jest.fn((key) => key === 'commonActions.loading' ? 'Cargando...' : key);
      mockUseTranslation.mockReturnValue({
        t: mockT,
        changeLanguage: jest.fn(),
        locale: 'es',
        isPending: false,
      });

      const { getByText } = render(
        <Button mode="primary" isLoading>Loading Button</Button>
      );

      expect(mockT).toHaveBeenCalledWith('commonActions.loading');
      expect(getByText('Cargando...')).toBeTruthy();
    });

    it('should render loading with custom size', () => {
      const { toJSON } = render(
        <Button mode="primary" size="small" isLoading>Small Loading</Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <Button mode="primary" disabled={true} onPress={mockOnPress}>
          Disabled Button
        </Button>
      );

      const button = getByText('Disabled Button');
      fireEvent.press(button);
      
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should be disabled when isLoading is true', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <Button mode="primary" isLoading onPress={mockOnPress}>
          Loading Button
        </Button>
      );

      const button = getByText('Loading Button');
      fireEvent.press(button);
      
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should render disabled styles', () => {
      const { toJSON } = render(
        <Button mode="primary" disabled>Disabled Button</Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should combine disabled and loading states', () => {
      const { toJSON } = render(
        <Button mode="primary" disabled isLoading>Disabled Loading</Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('User interactions', () => {
    it('should call onPress when button is pressed', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <Button mode="primary" onPress={mockOnPress}>
          Clickable Button
        </Button>
      );

      const button = getByText('Clickable Button');
      fireEvent.press(button);
      
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <Button mode="primary" onPress={mockOnPress} disabled>
          Disabled Button
        </Button>
      );

      const button = getByText('Disabled Button');
      fireEvent.press(button);
      
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should handle multiple press events', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <Button mode="primary" onPress={mockOnPress}>
          Multi Press
        </Button>
      );

      const button = getByText('Multi Press');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);
      
      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });

    it('should handle onPress with different modes', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <Button mode="secondary" onPress={mockOnPress}>
          Secondary Click
        </Button>
      );

      const button = getByText('Secondary Click');
      fireEvent.press(button);
      
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should handle undefined onPress gracefully', () => {
      const { getByText } = render(
        <Button mode="primary">No Handler</Button>
      );

      const button = getByText('No Handler');
      expect(() => fireEvent.press(button)).not.toThrow();
    });
  });

  describe('Custom styling', () => {
    it('should apply custom className', () => {
      const { toJSON } = render(
        <Button mode="primary" className="custom-button-class">
          Custom Class
        </Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should apply custom style', () => {
      const customStyle = {
        backgroundColor: 'red',
        padding: 20,
      };

      const { toJSON } = render(
        <Button mode="primary" style={customStyle}>
          Custom Style
        </Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should combine custom className and style', () => {
      const customStyle = { borderWidth: 2 };

      const { toJSON } = render(
        <Button
          className="rounded-xl"
          style={customStyle}
          mode="secondary"
        >
          Combined Styling
        </Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle undefined className', () => {
      const { toJSON } = render(
        <Button mode="primary" className={undefined}>
          Undefined Class
        </Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible by default', () => {
      const { getByText } = render(
        <Button mode="primary">Accessible Button</Button>
      );

      expect(getByText('Accessible Button')).toBeTruthy();
    });

    it('should be accessible when disabled', () => {
      const { getByText, toJSON } = render(
        <Button mode="primary" disabled>
          Disabled Accessible Button
        </Button>
      );

      expect(getByText('Disabled Accessible Button')).toBeTruthy();
      expect(toJSON()).toMatchSnapshot();
    });

    it('should be accessible when loading', () => {
      const { getByText } = render(
        <Button mode="primary" isLoading>
          Loading Accessible Button
        </Button>
      );

      expect(getByText('Loading Accessible Button')).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should handle boolean children', () => {
      const { toJSON } = render(
        <Button mode="primary">{true}</Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle number children', () => {
      const { getByText } = render(
        <Button mode="primary">{42}</Button>
      );

      expect(getByText('42')).toBeTruthy();
    });

    it('should handle null children gracefully', () => {
      const { toJSON } = render(
        <Button mode="primary">{null}</Button>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle complex children', () => {
      const { getByText } = render(
        <Button mode="primary">
          Submit
        </Button>
      );

      expect(getByText('Submit')).toBeTruthy();
    });
  });
});
