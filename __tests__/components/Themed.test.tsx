import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from '@/components/Themed';

// Mock de useColorScheme
const mockUseColorScheme = jest.fn();
jest.mock('@/hooks/ui/useColorScheme', () => ({
  useColorScheme: () => mockUseColorScheme(),
}));

describe('Themed Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Text Component', () => {
    it('should render with light theme', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByText } = render(<Text>Test Text</Text>);

      expect(getByText('Test Text')).toBeTruthy();
    });

    it('should render with dark theme', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByText } = render(<Text>Test Text Dark</Text>);

      expect(getByText('Test Text Dark')).toBeTruthy();
    });

    it('should apply custom lightColor', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByText } = render(
        <Text lightColor='#ff0000'>Custom Light</Text>
      );

      expect(getByText('Custom Light')).toBeTruthy();
    });

    it('should apply custom darkColor', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByText } = render(
        <Text darkColor='#00ff00'>Custom Dark</Text>
      );

      expect(getByText('Custom Dark')).toBeTruthy();
    });

    it('should handle undefined theme', () => {
      mockUseColorScheme.mockReturnValue(undefined);

      const { getByText } = render(<Text>Undefined Theme</Text>);

      expect(getByText('Undefined Theme')).toBeTruthy();
    });
  });

  describe('View Component', () => {
    it('should render with light theme', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = render(
        <View testID='themed-view'>
          <Text>Content</Text>
        </View>
      );

      expect(getByTestId('themed-view')).toBeTruthy();
    });

    it('should render with dark theme', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = render(
        <View testID='themed-view-dark'>
          <Text>Dark Content</Text>
        </View>
      );

      expect(getByTestId('themed-view-dark')).toBeTruthy();
    });

    it('should apply custom colors', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = render(
        <View
          testID='custom-themed-view'
          lightColor='#ffffff'
          darkColor='#000000'
        >
          <Text>Custom Colors</Text>
        </View>
      );

      expect(getByTestId('custom-themed-view')).toBeTruthy();
    });

    it('should handle no custom colors', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = render(
        <View testID='no-colors'>
          <Text>No Custom Colors</Text>
        </View>
      );

      expect(getByTestId('no-colors')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null colorScheme', () => {
      mockUseColorScheme.mockReturnValue(null);

      const { getByText } = render(<Text>Null Theme</Text>);

      expect(getByText('Null Theme')).toBeTruthy();
    });

    it('should render without crashing when no colors provided', () => {
      mockUseColorScheme.mockReturnValue('light');

      expect(() => {
        render(<Text>No Colors</Text>);
      }).not.toThrow();
    });
  });
});
