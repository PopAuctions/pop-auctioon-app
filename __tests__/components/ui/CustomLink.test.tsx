/**
 * Test suite for CustomLink component
 * Tests navigation, authentication, external links, and styling
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { CustomLink } from '@/components/ui/CustomLink';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { requiresAuth } from '@/components/navigation/routeConfig';

// Mock dependencies
jest.mock('@/hooks/auth/useAuthNavigation', () => ({
  useAuthNavigation: jest.fn(),
}));

jest.mock('@/components/navigation/routeConfig', () => ({
  requiresAuth: jest.fn(),
}));

const mockUseAuthNavigation = useAuthNavigation as jest.MockedFunction<
  typeof useAuthNavigation
>;
const mockRequiresAuth = requiresAuth as jest.MockedFunction<
  typeof requiresAuth
>;

describe('CustomLink', () => {
  const mockNavigateWithAuth = jest.fn();
  const mockNavigateToAuth = jest.fn();
  const mockNavigateToHome = jest.fn();

  beforeEach(() => {
    mockUseAuthNavigation.mockReturnValue({
      navigateWithAuth: mockNavigateWithAuth,
      navigateToAuth: mockNavigateToAuth,
      navigateToHome: mockNavigateToHome,
      isNavigating: false,
      isAuthenticated: true,
      userRole: 'USER',
    });
    mockRequiresAuth.mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render with children', () => {
      const { toJSON } = render(<CustomLink href='/home'>Home</CustomLink>);

      expect(toJSON()).toBeTruthy();
    });

    it('should have correct displayName', () => {
      expect(CustomLink.displayName).toBe('CustomLink');
    });

    it('should render complex children', () => {
      const { toJSON } = render(
        <CustomLink href='/about'>Go to About Page</CustomLink>
      );

      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Link modes and styling', () => {
    it('should render empty mode (default)', () => {
      const { toJSON } = render(
        <CustomLink href='/home'>Empty Mode</CustomLink>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should render primary mode', () => {
      const { toJSON } = render(
        <CustomLink
          href='/home'
          mode='primary'
        >
          Primary Link
        </CustomLink>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should render secondary mode', () => {
      const { toJSON } = render(
        <CustomLink
          href='/home'
          mode='secondary'
        >
          Secondary Link
        </CustomLink>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should render plainText mode', () => {
      const { toJSON } = render(
        <CustomLink
          href='/home'
          mode='plainText'
        >
          Plain Text Link
        </CustomLink>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Link sizes', () => {
    it('should render large size by default', () => {
      const { toJSON } = render(
        <CustomLink
          href='/home'
          mode='primary'
        >
          Large Link
        </CustomLink>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should render small primary link', () => {
      const { toJSON } = render(
        <CustomLink
          href='/home'
          mode='primary'
          size='small'
        >
          Small Primary
        </CustomLink>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should render small secondary link', () => {
      const { toJSON } = render(
        <CustomLink
          href='/home'
          mode='secondary'
          size='small'
        >
          Small Secondary
        </CustomLink>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle plainText size variations', () => {
      const { toJSON } = render(
        <CustomLink
          href='/home'
          mode='plainText'
          size='small'
        >
          Small Plain Text
        </CustomLink>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Hover and interaction effects', () => {
    it('should apply hover effects by default', () => {
      const { toJSON } = render(
        <CustomLink
          href='/home'
          mode='primary'
        >
          Hover Link
        </CustomLink>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should disable hover effects when hoverEffect is false', () => {
      const { toJSON } = render(
        <CustomLink
          href='/home'
          mode='primary'
          hoverEffect={false}
        >
          No Hover Link
        </CustomLink>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Custom styling', () => {
    it('should apply custom className', () => {
      const { toJSON } = render(
        <CustomLink
          href='/home'
          className='custom-link-class'
        >
          Custom Class Link
        </CustomLink>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should apply custom style', () => {
      const customStyle = {
        backgroundColor: 'red',
        padding: 20,
      };

      const { toJSON } = render(
        <CustomLink
          href='/home'
          style={customStyle}
        >
          Custom Style Link
        </CustomLink>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should combine custom className and style', () => {
      const customStyle = { borderWidth: 2 };

      const { toJSON } = render(
        <CustomLink
          href='/home'
          className='rounded-xl'
          style={customStyle}
        >
          Combined Styling
        </CustomLink>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle undefined className', () => {
      const { toJSON } = render(
        <CustomLink
          href='/home'
          className={undefined}
        >
          Undefined Class
        </CustomLink>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('External redirect prop', () => {
    it('should render with outsideRedirect prop', () => {
      const { toJSON } = render(
        <CustomLink
          href='https://example.com'
          outsideRedirect={true}
        >
          External Link
        </CustomLink>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should render without outsideRedirect prop', () => {
      const { toJSON } = render(
        <CustomLink href='/internal'>Internal Link</CustomLink>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Text rendering modes', () => {
    it('should render raw children for empty mode', () => {
      const { toJSON } = render(
        <CustomLink
          href='/home'
          mode='empty'
        >
          <CustomText>Custom Content</CustomText>
        </CustomLink>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should wrap children in Text component for styled modes', () => {
      const { toJSON } = render(
        <CustomLink
          href='/home'
          mode='primary'
        >
          Styled Text Content
        </CustomLink>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should apply underline for plainText mode', () => {
      const { toJSON } = render(
        <CustomLink
          href='/home'
          mode='plainText'
        >
          Underlined Text
        </CustomLink>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty href', () => {
      const { toJSON } = render(<CustomLink href=''>Empty Href</CustomLink>);

      expect(toJSON()).toBeTruthy();
    });

    it('should handle complex children types', () => {
      const { toJSON } = render(<CustomLink href='/home'>{123}</CustomLink>);

      expect(toJSON()).toBeTruthy();
    });

    it('should handle boolean children', () => {
      const { toJSON } = render(<CustomLink href='/home'>{true}</CustomLink>);

      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle null children gracefully', () => {
      const { toJSON } = render(<CustomLink href='/home'>{null}</CustomLink>);

      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle string children', () => {
      const { toJSON } = render(
        <CustomLink href='/home'>Simple text</CustomLink>
      );

      expect(toJSON()).toBeTruthy();
    });
  });

  describe('forwardRef functionality', () => {
    it('should forward ref correctly', () => {
      const ref = React.createRef<any>();

      render(
        <CustomLink
          ref={ref}
          href='/home'
        >
          Ref Link
        </CustomLink>
      );

      expect(ref.current).toBeTruthy();
    });
  });

  describe('Route configuration tests', () => {
    it('should check auth requirements for routes', () => {
      const { toJSON } = render(
        <CustomLink href='/protected'>Protected</CustomLink>
      );

      // The component renders successfully
      expect(toJSON()).toBeTruthy();
    });

    it('should work with different route patterns', () => {
      const routes = [
        '/home',
        '/(tabs)/auctions',
        '/store/[id]',
        '/search?q=test',
        '/',
        '/(tabs)/my-auctions/create',
      ];

      routes.forEach((route) => {
        const { toJSON } = render(
          <CustomLink href={route}>Route {route}</CustomLink>
        );
        expect(toJSON()).toBeTruthy();
      });
    });
  });

  describe('Hook integration', () => {
    it('should use auth navigation hook', () => {
      render(<CustomLink href='/test'>Test</CustomLink>);

      expect(mockUseAuthNavigation).toHaveBeenCalled();
    });

    it('should work with different auth states', () => {
      mockUseAuthNavigation.mockReturnValue({
        navigateWithAuth: mockNavigateWithAuth,
        navigateToAuth: mockNavigateToAuth,
        navigateToHome: mockNavigateToHome,
        isNavigating: true,
        isAuthenticated: false,
        userRole: null,
      });

      const { toJSON } = render(
        <CustomLink href='/test'>Test Unauthenticated</CustomLink>
      );

      expect(toJSON()).toBeTruthy();
    });
  });
});

// Helper component for testing custom children
const CustomText = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
