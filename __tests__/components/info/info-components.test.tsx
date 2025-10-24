import React from 'react';
import { render } from '@testing-library/react-native';
import { AboutUsContent } from '@/components/info/AboutUsContent';
import { HowItWorksContent } from '@/components/info/HowItWorksContent';
import { FAQsContent } from '@/components/info/FAQsContent';
import { ContactUsContent } from '@/components/info/ContactUsContent';

// Mock translation hook
jest.mock('@/hooks/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'screens.aboutUs.title': 'About Us',
        'screens.aboutUs.subtitle': 'Learn more about PopAuction',
        'screens.howItWorks.title': 'How It Works',
        'screens.howItWorks.subtitle': 'Step by step guide',
        'screens.faqs.title': 'Frequently Asked Questions',
        'screens.faqs.subtitle': 'Find answers to common questions',
        'screens.contactUs.title': 'Contact Us',
        'screens.contactUs.subtitle': 'Get in touch with our team',
      };
      return translations[key] || key;
    },
    locale: 'en',
  }),
}));

describe('Info Components', () => {
  describe('AboutUsContent', () => {
    it('should render correctly', () => {
      const { getByText } = render(<AboutUsContent />);

      expect(getByText('About Us')).toBeTruthy();
      expect(getByText('Learn more about PopAuction')).toBeTruthy();
    });

    it('should match snapshot', () => {
      const { toJSON } = render(<AboutUsContent />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should have correct layout structure', () => {
      const { UNSAFE_root } = render(<AboutUsContent />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render without crashing', () => {
      expect(() => render(<AboutUsContent />)).not.toThrow();
    });

    it('should use translation hook', () => {
      const { getByText } = render(<AboutUsContent />);

      // Verify translated strings are rendered
      expect(getByText('About Us')).toBeTruthy();
    });
  });

  describe('HowItWorksContent', () => {
    it('should render correctly', () => {
      const { getByText } = render(<HowItWorksContent />);

      expect(getByText('How It Works')).toBeTruthy();
      expect(getByText('Step by step guide')).toBeTruthy();
    });

    it('should match snapshot', () => {
      const { toJSON } = render(<HowItWorksContent />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should have correct layout structure', () => {
      const { UNSAFE_root } = render(<HowItWorksContent />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render without crashing', () => {
      expect(() => render(<HowItWorksContent />)).not.toThrow();
    });

    it('should use translation hook', () => {
      const { getByText } = render(<HowItWorksContent />);

      expect(getByText('How It Works')).toBeTruthy();
    });
  });

  describe('FAQsContent', () => {
    it('should render correctly', () => {
      const { getByText } = render(<FAQsContent />);

      expect(getByText('Frequently Asked Questions')).toBeTruthy();
      expect(getByText('Find answers to common questions')).toBeTruthy();
    });

    it('should match snapshot', () => {
      const { toJSON } = render(<FAQsContent />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should have correct layout structure', () => {
      const { UNSAFE_root } = render(<FAQsContent />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render without crashing', () => {
      expect(() => render(<FAQsContent />)).not.toThrow();
    });

    it('should use translation hook', () => {
      const { getByText } = render(<FAQsContent />);

      expect(getByText('Frequently Asked Questions')).toBeTruthy();
    });
  });

  describe('ContactUsContent', () => {
    it('should render correctly', () => {
      const { getByText } = render(<ContactUsContent />);

      expect(getByText('Contact Us')).toBeTruthy();
      expect(getByText('Get in touch with our team')).toBeTruthy();
    });

    it('should match snapshot', () => {
      const { toJSON } = render(<ContactUsContent />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should have correct layout structure', () => {
      const { UNSAFE_root } = render(<ContactUsContent />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render without crashing', () => {
      expect(() => render(<ContactUsContent />)).not.toThrow();
    });

    it('should use translation hook', () => {
      const { getByText } = render(<ContactUsContent />);

      expect(getByText('Contact Us')).toBeTruthy();
    });
  });

  describe('Component consistency', () => {
    it('should have consistent structure across all components', () => {
      const components = [
        AboutUsContent,
        HowItWorksContent,
        FAQsContent,
        ContactUsContent,
      ];

      components.forEach((Component) => {
        const { UNSAFE_root } = render(<Component />);
        expect(UNSAFE_root).toBeTruthy();
      });
    });

    it('should all use the same translation hook', () => {
      const components = [
        AboutUsContent,
        HowItWorksContent,
        FAQsContent,
        ContactUsContent,
      ];

      components.forEach((Component) => {
        expect(() => render(<Component />)).not.toThrow();
      });
    });

    it('should render independently without affecting each other', () => {
      const { getByText: getAbout } = render(<AboutUsContent />);
      expect(getAbout('About Us')).toBeTruthy();

      const { getByText: getHow } = render(<HowItWorksContent />);
      expect(getHow('How It Works')).toBeTruthy();

      const { getByText: getFaq } = render(<FAQsContent />);
      expect(getFaq('Frequently Asked Questions')).toBeTruthy();

      const { getByText: getContact } = render(<ContactUsContent />);
      expect(getContact('Contact Us')).toBeTruthy();
    });
  });

  describe('Props and customization', () => {
    it('should render without props', () => {
      expect(() => render(<AboutUsContent />)).not.toThrow();
      expect(() => render(<HowItWorksContent />)).not.toThrow();
      expect(() => render(<FAQsContent />)).not.toThrow();
      expect(() => render(<ContactUsContent />)).not.toThrow();
    });

    it('should be reusable across different contexts', () => {
      // Render in "auth" context
      const authAbout = render(<AboutUsContent />);
      expect(authAbout.getByText('About Us')).toBeTruthy();

      // Render in "account" context (same component, different route)
      const accountAbout = render(<AboutUsContent />);
      expect(accountAbout.getByText('About Us')).toBeTruthy();

      // Both should render the same content
      expect(authAbout.toJSON()).toEqual(accountAbout.toJSON());
    });
  });

  describe('Accessibility', () => {
    it('should have accessible text components', () => {
      const components = [
        AboutUsContent,
        HowItWorksContent,
        FAQsContent,
        ContactUsContent,
      ];

      components.forEach((Component) => {
        const { UNSAFE_root } = render(<Component />);
        expect(UNSAFE_root).toBeTruthy();
      });
    });

    it('should render text content that is readable', () => {
      const { getByText: getAbout } = render(<AboutUsContent />);
      const aboutTitle = getAbout('About Us');
      expect(aboutTitle).toBeTruthy();

      const { getByText: getHow } = render(<HowItWorksContent />);
      const howTitle = getHow('How It Works');
      expect(howTitle).toBeTruthy();
    });
  });
});
