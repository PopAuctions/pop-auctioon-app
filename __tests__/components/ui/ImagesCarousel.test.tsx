import React from 'react';
import { render } from '@testing-library/react-native';
import { ImagesCarousel } from '@/components/ui/ImagesCarousel';

describe('ImagesCarousel', () => {
  it('renders with no images', () => {
    const { toJSON } = render(<ImagesCarousel images={[]} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders with multiple images', () => {
    const images = [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ];
    const { toJSON } = render(<ImagesCarousel images={images} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
