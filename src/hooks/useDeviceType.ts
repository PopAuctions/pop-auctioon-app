import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export type DeviceType = 'phone' | 'tablet';

/**
 * Hook para detectar el tipo de dispositivo basándose en el ancho de pantalla
 * @returns 'phone' o 'tablet'
 */
export const useDeviceType = (): DeviceType => {
  const { width } = useWindowDimensions();

  const deviceType = useMemo(() => {
    // Tablets generalmente tienen un ancho >= 768px
    return width >= 768 ? 'tablet' : 'phone';
  }, [width]);

  return deviceType;
};
