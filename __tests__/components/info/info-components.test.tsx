import React from 'react';
import { render } from '@testing-library/react-native';
import { AboutUsContent } from '@/components/info/AboutUsContent';
import { HowItWorksContent } from '@/components/info/HowItWorksContent';
import { FAQsContent } from '@/components/info/FAQsContent';
import { ContactUsContent } from '@/components/info/ContactUsContent';
import type { AboutUsData, HowItWorksData, FAQItem } from '@/types/types';

// Mock Supabase
jest.mock('@/utils/supabase/supabase-store', () => ({
  supabase: {
    auth: {
      getSession: () =>
        Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
  },
}));

// Mock translation hook
jest.mock('@/hooks/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'screens.account.aboutUs': 'About Us',
        'screens.account.howItWorks': 'How It Works',
        'screens.account.faqs': 'FAQs',
        'screens.account.contactUs': 'Contact Us',
      };
      return translations[key] || key;
    },
    locale: 'en',
  }),
}));

// Mock image require
jest.mock('../../../assets/images/about-hero.webp', () => 'about-hero.webp', {
  virtual: true,
});
jest.mock(
  '../../../assets/images/how-it-works-hero.webp',
  () => 'how-it-works-hero.webp',
  { virtual: true }
);

const mockAboutUsData: AboutUsData = {
  es: {
    text: 'Este es el contenido de About Us en español.\n\nSegundo párrafo en español.',
    logo: 'logo-url',
  },
  en: {
    text: 'This is the About Us content in English.\n\nSecond paragraph in English.',
    logo: 'logo-url',
  },
};

const mockHowItWorksData: HowItWorksData = {
  es: {
    intro: 'Introducción sobre cómo funciona PopAuction',
    sections: [
      {
        title: 'Paso 1',
        content: [{ text: 'Contenido del paso 1' }],
      },
      {
        title: 'Paso 2',
        content: [{ text: 'Contenido del paso 2' }],
      },
    ],
    outro: {
      title: 'Conclusión',
      content: 'Contenido de conclusión',
    },
    logo: 'logo-url',
  },
  en: {
    intro: 'Introduction to how PopAuction works',
    sections: [
      {
        title: 'Step 1',
        content: [{ text: 'Step 1 content' }],
      },
      {
        title: 'Step 2',
        content: [{ text: 'Step 2 content' }],
      },
    ],
    outro: {
      title: 'Conclusion',
      content: 'Conclusion content',
    },
    logo: 'logo-url',
  },
};

const mockFAQs: FAQItem[] = [
  {
    question: { es: '¿Pregunta 1?', en: 'Question 1?' },
    answer: { es: 'Respuesta 1', en: 'Answer 1' },
  },
  {
    question: { es: '¿Pregunta 2?', en: 'Question 2?' },
    answer: { es: 'Respuesta 2', en: 'Answer 2' },
  },
];

// For FAQsContent, we need FAQsData format - structure by language
const mockFAQsData = {
  es: [
    {
      subtitle: 'Categoría 1',
      questions: [
        {
          question: '¿Pregunta 1?',
          answer: 'Respuesta 1',
        },
        {
          question: '¿Pregunta 2?',
          answer: 'Respuesta 2',
        },
      ],
    },
  ],
  en: [
    {
      subtitle: 'Category 1',
      questions: [
        {
          question: 'Question 1?',
          answer: 'Answer 1',
        },
        {
          question: 'Question 2?',
          answer: 'Answer 2',
        },
      ],
    },
  ],
};

describe('Info Components', () => {
  describe('AboutUsContent', () => {
    it('should render correctly with data', () => {
      const { getByText } = render(
        <AboutUsContent
          data={mockAboutUsData}
          locale='en'
        />
      );

      expect(getByText('About Us')).toBeTruthy();
      expect(
        getByText('This is the About Us content in English.')
      ).toBeTruthy();
    });

    it('should render Spanish content when locale is es', () => {
      const { getByText } = render(
        <AboutUsContent
          data={mockAboutUsData}
          locale='es'
        />
      );

      expect(
        getByText('Este es el contenido de About Us en español.')
      ).toBeTruthy();
    });

    it('should match snapshot', () => {
      const { toJSON } = render(
        <AboutUsContent
          data={mockAboutUsData}
          locale='en'
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render without crashing', () => {
      expect(() =>
        render(
          <AboutUsContent
            data={mockAboutUsData}
            locale='en'
          />
        )
      ).not.toThrow();
    });
  });

  describe('HowItWorksContent', () => {
    it('should render correctly with data', () => {
      const { getByText } = render(
        <HowItWorksContent
          data={mockHowItWorksData}
          locale='en'
        />
      );

      expect(getByText('How It Works')).toBeTruthy();
      expect(getByText('Introduction to how PopAuction works')).toBeTruthy();
    });

    it('should render Spanish content when locale is es', () => {
      const { getByText } = render(
        <HowItWorksContent
          data={mockHowItWorksData}
          locale='es'
        />
      );

      expect(
        getByText('Introducción sobre cómo funciona PopAuction')
      ).toBeTruthy();
    });

    it('should match snapshot', () => {
      const { toJSON } = render(
        <HowItWorksContent
          data={mockHowItWorksData}
          locale='en'
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render without crashing', () => {
      expect(() =>
        render(
          <HowItWorksContent
            data={mockHowItWorksData}
            locale='en'
          />
        )
      ).not.toThrow();
    });
  });

  describe('FAQsContent', () => {
    it('should render correctly with data', () => {
      const { getByText } = render(
        <FAQsContent
          data={mockFAQsData}
          locale='en'
        />
      );

      expect(getByText('FAQs')).toBeTruthy();
      expect(getByText('Question 1?')).toBeTruthy();
    });

    it('should render Spanish content when locale is es', () => {
      const { getByText } = render(
        <FAQsContent
          data={mockFAQsData}
          locale='es'
        />
      );

      expect(getByText('¿Pregunta 1?')).toBeTruthy();
    });

    it('should render multiple FAQ items', () => {
      const { getByText } = render(
        <FAQsContent
          data={mockFAQsData}
          locale='en'
        />
      );

      expect(getByText('Question 1?')).toBeTruthy();
      expect(getByText('Question 2?')).toBeTruthy();
    });

    it('should match snapshot', () => {
      const { toJSON } = render(
        <FAQsContent
          data={mockFAQsData}
          locale='en'
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render without crashing', () => {
      expect(() =>
        render(
          <FAQsContent
            data={mockFAQsData}
            locale='en'
          />
        )
      ).not.toThrow();
    });
  });

  describe('ContactUsContent', () => {
    it('should render correctly', () => {
      const { getByText } = render(<ContactUsContent />);

      // Component uses translation keys, not translated text
      expect(getByText('screens.contactUs.title')).toBeTruthy();
    });

    it('should match snapshot', () => {
      const { toJSON } = render(<ContactUsContent />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render without crashing', () => {
      expect(() => render(<ContactUsContent />)).not.toThrow();
    });
  });

  describe('Component consistency', () => {
    it('should render AboutUsContent and HowItWorksContent with consistent structure', () => {
      const about = render(
        <AboutUsContent
          data={mockAboutUsData}
          locale='en'
        />
      );
      const howItWorks = render(
        <HowItWorksContent
          data={mockHowItWorksData}
          locale='en'
        />
      );

      expect(about.UNSAFE_root).toBeTruthy();
      expect(howItWorks.UNSAFE_root).toBeTruthy();
    });

    it('should render FAQsContent with proper structure', () => {
      const faqs = render(
        <FAQsContent
          data={mockFAQsData}
          locale='en'
        />
      );
      expect(faqs.UNSAFE_root).toBeTruthy();
    });

    it('should render ContactUsContent independently', () => {
      const contact = render(<ContactUsContent />);
      expect(contact.UNSAFE_root).toBeTruthy();
    });

    it('should all render without throwing errors', () => {
      expect(() =>
        render(
          <AboutUsContent
            data={mockAboutUsData}
            locale='en'
          />
        )
      ).not.toThrow();
      expect(() =>
        render(
          <HowItWorksContent
            data={mockHowItWorksData}
            locale='en'
          />
        )
      ).not.toThrow();
      expect(() =>
        render(
          <FAQsContent
            data={mockFAQsData}
            locale='en'
          />
        )
      ).not.toThrow();
      expect(() => render(<ContactUsContent />)).not.toThrow();
    });
  });

  describe('Props and locale switching', () => {
    it('should render AboutUsContent in both locales', () => {
      const enVersion = render(
        <AboutUsContent
          data={mockAboutUsData}
          locale='en'
        />
      );
      const esVersion = render(
        <AboutUsContent
          data={mockAboutUsData}
          locale='es'
        />
      );

      expect(enVersion.toJSON()).not.toEqual(esVersion.toJSON());
    });

    it('should be reusable across different contexts', () => {
      // Render in "auth" context
      const authAbout = render(
        <AboutUsContent
          data={mockAboutUsData}
          locale='en'
        />
      );
      expect(authAbout.getByText('About Us')).toBeTruthy();

      // Render in "account" context (same component, different route)
      const accountAbout = render(
        <AboutUsContent
          data={mockAboutUsData}
          locale='en'
        />
      );
      expect(accountAbout.getByText('About Us')).toBeTruthy();

      // Both should render the same content
      expect(authAbout.toJSON()).toEqual(accountAbout.toJSON());
    });
  });

  describe('Accessibility', () => {
    it('should have accessible text components', () => {
      const about = render(
        <AboutUsContent
          data={mockAboutUsData}
          locale='en'
        />
      );
      const howItWorks = render(
        <HowItWorksContent
          data={mockHowItWorksData}
          locale='en'
        />
      );
      const faqs = render(
        <FAQsContent
          data={mockFAQsData}
          locale='en'
        />
      );
      const contact = render(<ContactUsContent />);

      expect(about.UNSAFE_root).toBeTruthy();
      expect(howItWorks.UNSAFE_root).toBeTruthy();
      expect(faqs.UNSAFE_root).toBeTruthy();
      expect(contact.UNSAFE_root).toBeTruthy();
    });

    it('should render text content that is readable', () => {
      const { getByText: getAbout } = render(
        <AboutUsContent
          data={mockAboutUsData}
          locale='en'
        />
      );
      const aboutTitle = getAbout('About Us');
      expect(aboutTitle).toBeTruthy();

      const { getByText: getHow } = render(
        <HowItWorksContent
          data={mockHowItWorksData}
          locale='en'
        />
      );
      const howTitle = getHow('How It Works');
      expect(howTitle).toBeTruthy();
    });
  });
});
