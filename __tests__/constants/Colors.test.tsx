import Colors from '@/constants/Colors';

describe('Colors Constants', () => {
  it('should export light theme colors', () => {
    expect(Colors.light).toBeDefined();
    expect(Colors.light.text).toBeDefined();
    expect(Colors.light.background).toBeDefined();
    expect(Colors.light.tint).toBeDefined();
  });

  it('should export dark theme colors', () => {
    expect(Colors.dark).toBeDefined();
    expect(Colors.dark.text).toBeDefined();
    expect(Colors.dark.background).toBeDefined();
    expect(Colors.dark.tint).toBeDefined();
  });

  it('should have consistent color properties', () => {
    const lightKeys = Object.keys(Colors.light);
    const darkKeys = Object.keys(Colors.dark);

    expect(lightKeys).toEqual(darkKeys);
  });
});
