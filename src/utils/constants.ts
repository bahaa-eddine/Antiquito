import { Dimensions } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const Colors = {
  // Backgrounds
  background: '#F7F3EE',
  surface: '#FFFFFF',
  surfaceAlt: '#EDE8E0',

  // Brand
  primary: '#8B6914',
  primaryLight: '#C8A441',
  primaryDark: '#6B4F0F',

  // Text
  text: '#1C1A18',
  textSecondary: '#6B6560',
  textTertiary: '#A09890',

  // Authenticity
  real: '#1A7340',
  realLight: '#E8F5EE',
  fake: '#C0392B',
  fakeLight: '#FDECEA',
  uncertain: '#B7770D',
  uncertainLight: '#FEF6E4',

  // UI
  border: '#E8E0D5',
  separator: '#F0EBE3',
  skeleton: '#E8E0D5',

  // Camera / overlays
  black: '#000000',
  white: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.55)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;
