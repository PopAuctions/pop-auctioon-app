import { renderHook, act } from '@testing-library/react-native';
import { useToast } from '@/hooks/useToast';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

// Mock dependencies
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  NotificationFeedbackType: {
    Success: 'success',
    Error: 'error',
    Warning: 'warning',
  },
  notificationAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock ToastProvider constants
jest.mock('@/providers/ToastProvider', () => ({
  TOAST_TEXTS: {
    es: {
      success: 'Éxito',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información',
    },
    en: {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information',
    },
  },
}));

// Mock i18n
jest.mock('@/i18n', () => ({
  t: jest.fn((key: string) => {
    const translations: Record<string, string> = {
      'screens.editProfile.updateSuccess': 'Profile updated successfully',
      'screens.addresses.success': 'Address saved successfully',
      'screens.billingInfo.deleteSuccess': 'Billing information deleted',
      'screens.verifyPhone.codeSentSuccess': 'Code sent successfully',
      'screens.editProfile.compressionError': 'Failed to compress image',
    };
    return translations[key] || key;
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useToast', () => {
  describe('callToast function', () => {
    it('should show success toast with default settings', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.callToast({
          variant: 'success',
          description: { es: 'Operación exitosa', en: 'Operation successful' },
        });
      });

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        position: 'top',
        text1: 'Éxito',
        text2: 'Operación exitosa',
        visibilityTime: undefined,
      });
    });

    it('should show error toast with Spanish locale', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.callToast({
          variant: 'error',
          description: { es: 'Hubo un error', en: 'There was an error' },
        });
      });

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error
      );
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        position: 'top',
        text1: 'Error',
        text2: 'Hubo un error',
        visibilityTime: undefined,
      });
    });

    it('should show warning toast with English locale', () => {
      const { result } = renderHook(() => useToast('en'));

      act(() => {
        result.current.callToast({
          variant: 'warning',
          description: { es: 'Advertencia', en: 'Warning message' },
        });
      });

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Warning
      );
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'warning',
        position: 'top',
        text1: 'Warning',
        text2: 'Warning message',
        visibilityTime: undefined,
      });
    });

    it('should show info toast', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.callToast({
          variant: 'info',
          description: { es: 'Información', en: 'Information' },
        });
      });

      // Info uses warning haptic feedback
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Warning
      );
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'info',
        position: 'top',
        text1: 'Información',
        text2: 'Información',
        visibilityTime: undefined,
      });
    });

    it('should handle custom position', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.callToast({
          variant: 'success',
          description: { es: 'Mensaje', en: 'Message' },
          position: 'bottom',
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          position: 'bottom',
        })
      );
    });

    it('should handle custom duration', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.callToast({
          variant: 'success',
          description: { es: 'Mensaje', en: 'Message' },
          durationMs: 5000,
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          visibilityTime: 5000,
        })
      );
    });

    it('should disable haptics when haptics=false', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.callToast({
          variant: 'success',
          description: { es: 'Mensaje', en: 'Message' },
          haptics: false,
        });
      });

      expect(Haptics.notificationAsync).not.toHaveBeenCalled();
      expect(Toast.show).toHaveBeenCalled();
    });

    it('should handle null description', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.callToast({
          variant: 'success',
          description: null,
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text2: undefined,
        })
      );
    });

    it('should handle undefined description', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.callToast({
          variant: 'success',
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text2: undefined,
        })
      );
    });

    it('should handle haptics failure gracefully', () => {
      const mockError = new Error('Haptics not available');
      (Haptics.notificationAsync as jest.Mock).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.callToast({
          variant: 'success',
          description: { es: 'Mensaje', en: 'Message' },
        });
      });

      // Should still show toast even if haptics fails
      expect(Toast.show).toHaveBeenCalled();
    });
  });

  describe('toast shorthand methods', () => {
    it('should show success toast via toast.success', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.toast.success({
          description: { es: 'Éxito', en: 'Success' },
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          text2: 'Éxito',
        })
      );
    });

    it('should show error toast via toast.error', () => {
      const { result } = renderHook(() => useToast('en'));

      act(() => {
        result.current.toast.error({
          description: { es: 'Error', en: 'Error occurred' },
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text2: 'Error occurred',
        })
      );
    });

    it('should show warning toast via toast.warning', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.toast.warning({
          description: { es: 'Advertencia', en: 'Warning' },
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          text2: 'Advertencia',
        })
      );
    });

    it('should show info toast via toast.info', () => {
      const { result } = renderHook(() => useToast('en'));

      act(() => {
        result.current.toast.info({
          description: { es: 'Info', en: 'Information' },
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'info',
          text2: 'Information',
        })
      );
    });

    it('should dismiss toast via toast.dismiss', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.toast.dismiss();
      });

      expect(Toast.hide).toHaveBeenCalled();
    });

    it('should accept all callToast options in shorthand methods', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.toast.success({
          description: { es: 'Éxito', en: 'Success' },
          position: 'bottom',
          durationMs: 3000,
          haptics: false,
        });
      });

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        position: 'bottom',
        text1: 'Éxito',
        text2: 'Éxito',
        visibilityTime: 3000,
      });
      expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    });
  });

  describe('Locale switching', () => {
    it('should use Spanish locale for text1 and text2', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.toast.success({
          description: {
            es: 'Operación completada',
            en: 'Operation completed',
          },
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text1: 'Éxito',
          text2: 'Operación completada',
        })
      );
    });

    it('should use English locale for text1 and text2', () => {
      const { result } = renderHook(() => useToast('en'));

      act(() => {
        result.current.toast.success({
          description: {
            es: 'Operación completada',
            en: 'Operation completed',
          },
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text1: 'Success',
          text2: 'Operation completed',
        })
      );
    });

    it('should handle locale change between renders', () => {
      const { result, rerender } = renderHook(({ lang }) => useToast(lang), {
        initialProps: { lang: 'es' as 'es' | 'en' },
      });

      act(() => {
        result.current.toast.error({
          description: { es: 'Error español', en: 'English error' },
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text1: 'Error',
          text2: 'Error español',
        })
      );

      // Change locale to English
      rerender({ lang: 'en' });

      act(() => {
        result.current.toast.error({
          description: { es: 'Error español', en: 'English error' },
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text1: 'Error',
          text2: 'English error',
        })
      );
    });
  });

  describe('Haptic feedback types', () => {
    it('should use Success haptic for success toast', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.toast.success({
          description: { es: 'Éxito', en: 'Success' },
        });
      });

      expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
    });

    it('should use Error haptic for error toast', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.toast.error({
          description: { es: 'Error', en: 'Error' },
        });
      });

      expect(Haptics.notificationAsync).toHaveBeenCalledWith('error');
    });

    it('should use Warning haptic for warning toast', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.toast.warning({
          description: { es: 'Advertencia', en: 'Warning' },
        });
      });

      expect(Haptics.notificationAsync).toHaveBeenCalledWith('warning');
    });

    it('should use Warning haptic for info toast', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.toast.info({
          description: { es: 'Info', en: 'Info' },
        });
      });

      expect(Haptics.notificationAsync).toHaveBeenCalledWith('warning');
    });
  });

  describe('Default values', () => {
    it('should default to success variant', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.callToast({
          description: { es: 'Mensaje', en: 'Message' },
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
        })
      );
    });

    it('should default to top position', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.callToast({
          variant: 'success',
          description: { es: 'Mensaje', en: 'Message' },
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          position: 'top',
        })
      );
    });

    it('should default haptics to true', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.callToast({
          variant: 'success',
          description: { es: 'Mensaje', en: 'Message' },
        });
      });

      expect(Haptics.notificationAsync).toHaveBeenCalled();
    });
  });

  describe('Real-world usage patterns', () => {
    it('should handle API error toast pattern', () => {
      const { result } = renderHook(() => useToast('es'));

      const apiError = {
        en: 'Failed to load data',
        es: 'Error al cargar datos',
      };

      act(() => {
        result.current.toast.error({ description: apiError });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text1: 'Error',
          text2: 'Error al cargar datos',
        })
      );
    });

    it('should handle API success toast pattern', () => {
      const { result } = renderHook(() => useToast('en'));

      const successMessage = {
        en: 'Data saved successfully',
        es: 'Datos guardados con éxito',
      };

      act(() => {
        result.current.toast.success({ description: successMessage });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          text1: 'Success',
          text2: 'Data saved successfully',
        })
      );
    });

    it('should handle form validation error pattern', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.toast.warning({
          description: {
            en: 'Please fill all required fields',
            es: 'Por favor complete todos los campos requeridos',
          },
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          text2: 'Por favor complete todos los campos requeridos',
        })
      );
    });

    it('should handle quick success toast with short duration', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.toast.success({
          description: {
            en: 'Link copied!',
            es: '¡Enlace copiado!',
          },
          durationMs: 2000,
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          visibilityTime: 2000,
        })
      );
    });
  });

  describe('Multiple toasts in sequence', () => {
    it('should allow showing multiple toasts', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.toast.info({
          description: { es: 'Info 1', en: 'Info 1' },
        });
        result.current.toast.success({
          description: { es: 'Éxito 1', en: 'Success 1' },
        });
        result.current.toast.error({
          description: { es: 'Error 1', en: 'Error 1' },
        });
      });

      expect(Toast.show).toHaveBeenCalledTimes(3);
    });

    it('should dismiss and show new toast', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.toast.success({
          description: { es: 'Primer mensaje', en: 'First message' },
        });
        result.current.toast.dismiss();
        result.current.toast.error({
          description: { es: 'Segundo mensaje', en: 'Second message' },
        });
      });

      expect(Toast.show).toHaveBeenCalledTimes(2);
      expect(Toast.hide).toHaveBeenCalledTimes(1);
    });
  });

  describe('Translation key support', () => {
    it('should accept translation key as string and translate it', () => {
      const { result } = renderHook(() => useToast('en'));

      act(() => {
        result.current.callToast({
          variant: 'success',
          description: 'screens.editProfile.updateSuccess',
        });
      });

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        position: 'top',
        text1: 'Success',
        text2: 'Profile updated successfully',
        visibilityTime: undefined,
      });
    });

    it('should handle translation key for error toast', () => {
      const { result } = renderHook(() => useToast('en'));

      act(() => {
        result.current.toast.error({
          description: 'screens.editProfile.compressionError',
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text2: 'Failed to compress image',
        })
      );
    });

    it('should handle translation key via shorthand methods', () => {
      const { result } = renderHook(() => useToast('en'));

      act(() => {
        result.current.toast.success({
          description: 'screens.addresses.success',
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text2: 'Address saved successfully',
        })
      );
    });

    it('should still accept LangMap objects', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.callToast({
          variant: 'success',
          description: { es: 'Éxito manual', en: 'Manual success' },
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text2: 'Éxito manual',
        })
      );
    });

    it('should accept plain error message strings', () => {
      const { result } = renderHook(() => useToast('en'));

      act(() => {
        result.current.toast.error({
          description: 'Network error occurred',
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text2: 'Network error occurred',
        })
      );
    });

    it('should handle null description with translation key support', () => {
      const { result } = renderHook(() => useToast('en'));

      act(() => {
        result.current.callToast({
          variant: 'success',
          description: null,
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text2: undefined,
        })
      );
    });

    it('should handle undefined description with translation key support', () => {
      const { result } = renderHook(() => useToast('en'));

      act(() => {
        result.current.callToast({
          variant: 'info',
          description: undefined,
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text2: undefined,
        })
      );
    });
  });

  describe('Real-world patterns with translation keys', () => {
    it('should handle billing delete success pattern', () => {
      const { result } = renderHook(() => useToast('en'));

      act(() => {
        result.current.toast.success({
          description: 'screens.billingInfo.deleteSuccess',
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          text2: 'Billing information deleted',
        })
      );
    });

    it('should handle phone verification pattern', () => {
      const { result } = renderHook(() => useToast('en'));

      act(() => {
        result.current.toast.success({
          description: 'screens.verifyPhone.codeSentSuccess',
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text2: 'Code sent successfully',
        })
      );
    });

    it('should handle API error with LangMap (backend errors)', () => {
      const { result } = renderHook(() => useToast('es'));

      const apiError = {
        en: 'Server error occurred',
        es: 'Ocurrió un error en el servidor',
      };

      act(() => {
        result.current.toast.error({ description: apiError });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text2: 'Ocurrió un error en el servidor',
        })
      );
    });

    it('should handle mixed usage in sequence', () => {
      const { result } = renderHook(() => useToast('en'));

      act(() => {
        // Translation key
        result.current.toast.success({
          description: 'screens.addresses.success',
        });

        // LangMap
        result.current.toast.error({
          description: { en: 'Network error', es: 'Error de red' },
        });

        // Plain string
        result.current.toast.info({
          description: 'Processing...',
        });
      });

      expect(Toast.show).toHaveBeenCalledTimes(3);
      expect(Toast.show).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ text2: 'Address saved successfully' })
      );
      expect(Toast.show).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ text2: 'Network error' })
      );
      expect(Toast.show).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({ text2: 'Processing...' })
      );
    });
  });

  describe('Type priority and edge cases', () => {
    it('should prioritize LangMap object over string translation', () => {
      const { result } = renderHook(() => useToast('es'));

      // LangMap objects should always be treated as LangMap, not as translation keys
      act(() => {
        result.current.callToast({
          variant: 'success',
          description: { es: 'Mensaje directo', en: 'Direct message' },
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text2: 'Mensaje directo',
        })
      );
    });

    it('should handle object type correctly (LangMap vs string)', () => {
      const { result } = renderHook(() => useToast('en'));

      act(() => {
        // LangMap object
        result.current.callToast({
          variant: 'success',
          description: { es: 'Español', en: 'English' },
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text2: 'English',
        })
      );

      act(() => {
        // Translation key string
        result.current.callToast({
          variant: 'success',
          description: 'screens.addresses.success',
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text2: 'Address saved successfully',
        })
      );
    });

    it('should handle empty object as LangMap', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.callToast({
          variant: 'success',
          description: {} as any,
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text2: undefined,
        })
      );
    });

    it('should handle LangMap with only one language key', () => {
      const { result } = renderHook(() => useToast('es'));

      act(() => {
        result.current.callToast({
          variant: 'success',
          description: { es: 'Solo español' } as any,
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text2: 'Solo español',
        })
      );
    });

    it('should use correct language from LangMap when locale changes', () => {
      const { result, rerender } = renderHook(({ lang }) => useToast(lang), {
        initialProps: { lang: 'es' as 'es' | 'en' },
      });

      const message = { es: 'Mensaje español', en: 'English message' };

      act(() => {
        result.current.callToast({
          variant: 'success',
          description: message,
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text2: 'Mensaje español',
        })
      );

      // Change to English
      rerender({ lang: 'en' });

      act(() => {
        result.current.callToast({
          variant: 'success',
          description: message,
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text2: 'English message',
        })
      );
    });

    it('should not confuse string with object property access', () => {
      const { result } = renderHook(() => useToast('en'));

      // This should be treated as a translation key, not object property
      act(() => {
        result.current.callToast({
          variant: 'success',
          description: 'screens.billingInfo.deleteSuccess',
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text2: 'Billing information deleted',
        })
      );
    });

    it('should handle null explicitly', () => {
      const { result } = renderHook(() => useToast('en'));

      act(() => {
        result.current.callToast({
          variant: 'info',
          description: null,
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text2: undefined,
        })
      );
    });

    it('should handle undefined explicitly', () => {
      const { result } = renderHook(() => useToast('en'));

      act(() => {
        result.current.callToast({
          variant: 'info',
          description: undefined,
        });
      });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text2: undefined,
        })
      );
    });
  });
});
