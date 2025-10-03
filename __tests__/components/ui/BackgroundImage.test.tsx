/**
 * Test suite for BackgroundImage component
 * Tests image handling, overlay functionality, and responsive design
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { BackgroundImage } from '@/components/ui/BackgroundImage';
import { Text } from 'react-native';

describe('BackgroundImage', () => {
  const mockChildren = <Text>Test Content</Text>;
  const mockImageUri = 'https://example.com/image.jpg';
  const mockRequiredImage = { uri: 'test://image.png' };

  describe('Basic rendering', () => {
    it('should render with string URI source', () => {
      const { getByText, toJSON } = render(
        <BackgroundImage source={mockImageUri}>{mockChildren}</BackgroundImage>
      );

      expect(getByText('Test Content')).toBeTruthy();
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render with required image source', () => {
      const { getByText, toJSON } = render(
        <BackgroundImage source={mockRequiredImage}>
          {mockChildren}
        </BackgroundImage>
      );

      expect(getByText('Test Content')).toBeTruthy();
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render children content', () => {
      const complexChildren = (
        <>
          <Text>Title</Text>
          <Text>Subtitle</Text>
        </>
      );

      const { getByText } = render(
        <BackgroundImage source={mockImageUri}>
          {complexChildren}
        </BackgroundImage>
      );

      expect(getByText('Title')).toBeTruthy();
      expect(getByText('Subtitle')).toBeTruthy();
    });
  });

  describe('Overlay functionality', () => {
    it('should render overlay by default', () => {
      const { toJSON } = render(
        <BackgroundImage source={mockImageUri}>{mockChildren}</BackgroundImage>
      );

      const component = toJSON();
      expect(component).toMatchSnapshot();
    });

    it('should not render overlay when overlay is false', () => {
      const { toJSON } = render(
        <BackgroundImage
          source={mockImageUri}
          overlay={false}
        >
          {mockChildren}
        </BackgroundImage>
      );

      const component = toJSON();
      expect(component).toMatchSnapshot();
    });

    it('should apply custom overlay opacity', () => {
      const { toJSON } = render(
        <BackgroundImage
          source={mockImageUri}
          overlayOpacity={0.7}
        >
          {mockChildren}
        </BackgroundImage>
      );

      const component = toJSON();
      expect(component).toMatchSnapshot();
    });

    it('should handle overlay opacity of 0', () => {
      const { toJSON } = render(
        <BackgroundImage
          source={mockImageUri}
          overlayOpacity={0}
        >
          {mockChildren}
        </BackgroundImage>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle overlay opacity of 1', () => {
      const { toJSON } = render(
        <BackgroundImage
          source={mockImageUri}
          overlayOpacity={1}
        >
          {mockChildren}
        </BackgroundImage>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Resize modes', () => {
    it('should apply cover resize mode by default', () => {
      const { toJSON } = render(
        <BackgroundImage source={mockImageUri}>{mockChildren}</BackgroundImage>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should apply contain resize mode', () => {
      const { toJSON } = render(
        <BackgroundImage
          source={mockImageUri}
          resizeMode='contain'
        >
          {mockChildren}
        </BackgroundImage>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should apply stretch resize mode', () => {
      const { toJSON } = render(
        <BackgroundImage
          source={mockImageUri}
          resizeMode='stretch'
        >
          {mockChildren}
        </BackgroundImage>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should apply repeat resize mode', () => {
      const { toJSON } = render(
        <BackgroundImage
          source={mockImageUri}
          resizeMode='repeat'
        >
          {mockChildren}
        </BackgroundImage>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should apply center resize mode', () => {
      const { toJSON } = render(
        <BackgroundImage
          source={mockImageUri}
          resizeMode='center'
        >
          {mockChildren}
        </BackgroundImage>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Styling and customization', () => {
    it('should apply default className', () => {
      const { toJSON } = render(
        <BackgroundImage source={mockImageUri}>{mockChildren}</BackgroundImage>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should apply custom className', () => {
      const { toJSON } = render(
        <BackgroundImage
          source={mockImageUri}
          className='h-64 w-full'
        >
          {mockChildren}
        </BackgroundImage>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should apply custom style', () => {
      const customStyle = {
        width: 300,
        height: 200,
        borderRadius: 10,
      };

      const { toJSON } = render(
        <BackgroundImage
          source={mockImageUri}
          style={customStyle}
        >
          {mockChildren}
        </BackgroundImage>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should combine className and style', () => {
      const customStyle = { opacity: 0.8 };

      const { toJSON } = render(
        <BackgroundImage
          source={mockImageUri}
          className='rounded-xl'
          style={customStyle}
        >
          {mockChildren}
        </BackgroundImage>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Image source handling', () => {
    it('should handle string URI correctly', () => {
      const { toJSON } = render(
        <BackgroundImage source='https://test.com/image.jpg'>
          {mockChildren}
        </BackgroundImage>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle required image source correctly', () => {
      const requiredImage = { uri: 'bundled://image.png' };

      const { toJSON } = render(
        <BackgroundImage source={requiredImage}>{mockChildren}</BackgroundImage>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle empty string URI', () => {
      const { toJSON } = render(
        <BackgroundImage source=''>{mockChildren}</BackgroundImage>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Complex configurations', () => {
    it('should handle all props together', () => {
      const complexConfig = {
        source: mockImageUri,
        overlay: true,
        overlayOpacity: 0.5,
        resizeMode: 'contain' as const,
        className: 'custom-bg',
        style: { borderWidth: 2 },
      };

      const { getByText, toJSON } = render(
        <BackgroundImage {...complexConfig}>{mockChildren}</BackgroundImage>
      );

      expect(getByText('Test Content')).toBeTruthy();
      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle no overlay with custom resize mode', () => {
      const { toJSON } = render(
        <BackgroundImage
          source={mockImageUri}
          overlay={false}
          resizeMode='stretch'
          className='flex-1 justify-center'
        >
          {mockChildren}
        </BackgroundImage>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should render multiple child components', () => {
      const multipleChildren = (
        <>
          <Text>Header</Text>
          <Text>Body</Text>
          <Text>Footer</Text>
        </>
      );

      const { getByText } = render(
        <BackgroundImage source={mockImageUri}>
          {multipleChildren}
        </BackgroundImage>
      );

      expect(getByText('Header')).toBeTruthy();
      expect(getByText('Body')).toBeTruthy();
      expect(getByText('Footer')).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should handle null children gracefully', () => {
      const { toJSON } = render(
        <BackgroundImage source={mockImageUri}>{null}</BackgroundImage>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle undefined overlay opacity', () => {
      const { toJSON } = render(
        <BackgroundImage
          source={mockImageUri}
          overlayOpacity={undefined}
        >
          {mockChildren}
        </BackgroundImage>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });
});
