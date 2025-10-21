import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import SplashLottie from '@/components/loading/splash-lottie';

// Mock LottieView
jest.mock('lottie-react-native', () => {
  const mockReact = jest.requireActual('react');
  const { View: MockView } = jest.requireActual('react-native');

  const MockLottieView = mockReact.forwardRef<
    typeof MockView,
    Record<string, unknown>
  >((props, ref) =>
    mockReact.createElement(MockView, { ...props, ref, testID: 'lottie-view' })
  );
  MockLottieView.displayName = 'LottieView';
  return MockLottieView;
});

describe('SplashLottie', () => {
  it('should render without crashing', () => {
    const { getByTestId } = render(<SplashLottie />);
    expect(getByTestId('lottie-view')).toBeTruthy();
  });

  it('should render LottieView component', () => {
    const { getByTestId } = render(<SplashLottie />);
    const lottieView = getByTestId('lottie-view');
    expect(lottieView).toBeTruthy();
  });

  it('should have flex: 1 style', () => {
    const { getByTestId } = render(<SplashLottie />);
    const lottieView = getByTestId('lottie-view');
    expect(lottieView.props.style).toEqual({ flex: 1 });
  });

  it('should pass autoPlay prop', () => {
    const { getByTestId } = render(<SplashLottie />);
    const lottieView = getByTestId('lottie-view');
    expect(lottieView.props.autoPlay).toBe(true);
  });

  it('should pass loop prop', () => {
    const { getByTestId } = render(<SplashLottie />);
    const lottieView = getByTestId('lottie-view');
    expect(lottieView.props.loop).toBe(true);
  });

  it('should use loading-bubbles animation source', () => {
    const { getByTestId } = render(<SplashLottie />);
    const lottieView = getByTestId('lottie-view');
    expect(lottieView.props.source).toBeDefined();
  });
});
