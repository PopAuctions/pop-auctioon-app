import { renderHook, waitFor } from '@testing-library/react-native';
import { useOpenTerms } from '@/hooks/useOpenTerms';
import { useToast } from '@/hooks/useToast';
import * as Linking from 'expo-linking';

// Mock dependencies
jest.mock('@/hooks/useToast');
jest.mock('expo-linking');

describe('useOpenTerms', () => {
  const mockCallToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({
      callToast: mockCallToast,
    });
  });

  it('should open terms PDF when URL is supported', async () => {
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
    (Linking.openURL as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(() => useOpenTerms());

    await result.current.handleOpenTerms();

    await waitFor(() => {
      expect(Linking.canOpenURL).toHaveBeenCalledWith(
        'https://www.popauction.com/documents/TC-2025-07-14.pdf'
      );
      expect(Linking.openURL).toHaveBeenCalledWith(
        'https://www.popauction.com/documents/TC-2025-07-14.pdf'
      );
      expect(mockCallToast).not.toHaveBeenCalled();
    });
  });

  it('should show error toast when URL is not supported', async () => {
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

    const { result } = renderHook(() => useOpenTerms());

    await result.current.handleOpenTerms();

    await waitFor(() => {
      expect(Linking.canOpenURL).toHaveBeenCalledWith(
        'https://www.popauction.com/documents/TC-2025-07-14.pdf'
      );
      expect(Linking.openURL).not.toHaveBeenCalled();
      expect(mockCallToast).toHaveBeenCalledWith({
        variant: 'error',
        description: {
          es: 'No se pudo abrir el documento',
          en: 'Could not open document',
        },
      });
    });
  });

  it('should provide handleOpenTerms function', () => {
    const { result } = renderHook(() => useOpenTerms());

    expect(typeof result.current.handleOpenTerms).toBe('function');
  });
});
