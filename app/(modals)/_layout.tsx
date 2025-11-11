import { Stack } from 'expo-router';

/**
 * Layout para modales de la aplicación
 * Este grupo (modals) mantiene todos los modales organizados
 * y separados de las pantallas normales
 */
export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: true,
      }}
    />
  );
}
