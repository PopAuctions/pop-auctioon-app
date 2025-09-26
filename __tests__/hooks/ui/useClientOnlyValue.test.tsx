import { renderHook } from '@testing-library/react-native';
import { useClientOnlyValue } from '@/hooks/ui/useClientOnlyValue';

describe('useClientOnlyValue', () => {
  it('should return a value', () => {
    const serverValue = 'server';
    const clientValue = 'client';

    const { result } = renderHook(() =>
      useClientOnlyValue(serverValue, clientValue)
    );

    // En el entorno de tests, debería devolver el server value o client value
    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('string');
  });

  it('should handle different data types', () => {
    const serverValue = { theme: 'light' };
    const clientValue = { theme: 'dark' };

    const { result } = renderHook(() =>
      useClientOnlyValue(serverValue, clientValue)
    );

    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('object');
  });

  it('should handle boolean values', () => {
    const serverValue = false;
    const clientValue = true;

    const { result } = renderHook(() =>
      useClientOnlyValue(serverValue, clientValue)
    );

    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('boolean');
  });

  it('should handle undefined client value', () => {
    const serverValue = 'server';
    const clientValue = undefined;

    const { result } = renderHook(() =>
      useClientOnlyValue(serverValue, clientValue)
    );

    // El hook siempre devuelve el clientValue, incluso si es undefined
    expect(result.current).toBe(clientValue);
  });

  it('should not throw when called', () => {
    expect(() => {
      renderHook(() => useClientOnlyValue('server', 'client'));
    }).not.toThrow();
  });
});
