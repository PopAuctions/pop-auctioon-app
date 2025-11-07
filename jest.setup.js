// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Picker
jest.mock('@react-native-picker/picker', () => ({
  Picker: 'Picker',
}));
