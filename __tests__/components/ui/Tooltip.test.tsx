import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Tooltip } from '@/components/ui/Tooltip';

describe('Tooltip', () => {
  it('renders tooltip pressable', async () => {
    const { findByTestId } = render(<Tooltip content='info' />);
    const pressable = await findByTestId('tooltip-pressable');
    expect(pressable).toBeTruthy();
  });

  it('opens modal when pressed and displays tooltip text', async () => {
    const { findByTestId, getByText } = render(
      <Tooltip content='This is a test tooltip message' />
    );

    const pressable = await findByTestId('tooltip-pressable');
    fireEvent.press(pressable);

    await waitFor(() => {
      expect(getByText('This is a test tooltip message')).toBeTruthy();
    });
  });

  it('renders with custom text content', () => {
    const { toJSON } = render(<Tooltip content='Test tooltip message' />);
    expect(toJSON()).toMatchSnapshot();
  });
});
