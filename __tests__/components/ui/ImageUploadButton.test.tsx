import React from 'react';
import { render } from '@testing-library/react-native';
import { ImageUploadButton } from '@/components/ui/ImageUploadButton';

describe('ImageUploadButton', () => {
  it('renders upload button in simple mode', () => {
    const { getByText } = render(
      <ImageUploadButton onImageSelected={() => {}} />
    );
    expect(getByText(/upload/i)).toBeTruthy();
  });

  it('renders image preview in simple mode', () => {
    const { getByTestId } = render(
      <ImageUploadButton
        selectedImage='https://example.com/image.jpg'
        onImageSelected={() => {}}
      />
    );
    // Should render an Image component
    expect(getByTestId('image')).toBeTruthy();
  });

  it('renders multiple images in multiple mode', () => {
    const { getAllByTestId } = render(
      <ImageUploadButton
        multiple
        selectedImages={['a.jpg', 'b.jpg']}
        onImagesSelected={() => {}}
      />
    );
    expect(getAllByTestId('image').length).toBe(2);
  });
});
