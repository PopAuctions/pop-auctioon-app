import React from 'react';
import { render, screen } from '@testing-library/react-native';
import RegisterAuctioneerScreen from '@/app/(tabs)/auth/register-auctioneer';

describe('RegisterAuctioneerScreen', () => {
  it('should render coming soon message', () => {
    render(<RegisterAuctioneerScreen />);

    expect(screen.getByText(/registerAsAuctioneer/i)).toBeTruthy();
    expect(screen.getByText(/globals.back/i)).toBeTruthy();
  });

  it('should show Spanish coming soon message when no translation key', () => {
    render(<RegisterAuctioneerScreen />);

    // Should show either translation key or fallback message
    const comingSoonText = screen.getByText(
      /Próximamente podrás registrarte como subastador|You will soon be able to register as an auctioneer|comingSoon/i
    );
    expect(comingSoonText).toBeTruthy();
  });

  it('should have back link to register screen', () => {
    const { getByText } = render(<RegisterAuctioneerScreen />);

    const backLink = getByText(/globals.back/i);
    expect(backLink).toBeTruthy();
    expect(backLink.props.href).toBe('/(tabs)/auth/register');
  });

  it('should not render RegisterAuctioneerForm', () => {
    const { queryByTestId } = render(<RegisterAuctioneerScreen />);

    // Ensure form is not rendered
    expect(queryByTestId('auctioneer-form')).toBeNull();
  });

  it('should render in SafeAreaView with white background', () => {
    const { getByTestId } = render(<RegisterAuctioneerScreen />);

    const safeArea = screen.getByTestId('safe-area-view');
    expect(safeArea.props.className).toContain('bg-white');
  });
});
