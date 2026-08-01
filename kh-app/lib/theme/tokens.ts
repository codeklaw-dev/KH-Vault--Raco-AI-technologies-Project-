/**
 * KH Timber & Co. design tokens.
 * Primary: white. Secondary: crimson red. Accent: black.
 * Warm wood-toned neutrals carry the surfaces.
 */

export const colors = {
  // Brand
  crimson: '#C8202B',
  crimsonDark: '#A31A22',
  crimsonDeep: '#7E141A',
  crimsonTint: '#FBEAEB',
  crimsonSoft: '#F4D3D5',

  // Accent / ink
  ink: '#14110F',
  ink70: '#3D3833',
  ink50: '#6B635A',
  ink30: '#A89E92',

  white: '#FFFFFF',

  // Warm neutrals (wood-toned)
  bg: '#FAF7F3',
  surface: '#FFFFFF',
  surfaceAlt: '#F3EEE7',
  border: '#EBE4DB',
  borderStrong: '#DDD3C7',

  // Text
  textPrimary: '#14110F',
  textSecondary: '#6B635A',
  textMuted: '#9C9389',
  textInverse: '#FFFFFF',

  // Semantic (state only)
  success: '#2E7D52',
  successTint: '#E4F2EA',
  warning: '#B9791A',
  warningTint: '#FAEEDA',
  danger: '#C8202B',
  dangerTint: '#FBEAEB',
  info: '#2B6CB0',
  infoTint: '#E4EDF7',

  // Wood accent (for hero overlays/illustration)
  wood: '#A9743C',
  woodDark: '#6E4A24',

  overlay: 'rgba(20,17,15,0.55)',
  scrim: 'rgba(20,17,15,0.35)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const fonts = {
  // Latin
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
  // Arabic
  arRegular: 'Cairo_400Regular',
  arSemibold: 'Cairo_600SemiBold',
  arBold: 'Cairo_700Bold',
} as const;

export const type = {
  display: { fontSize: 30, lineHeight: 36, letterSpacing: -0.5 },
  h1: { fontSize: 24, lineHeight: 30, letterSpacing: -0.4 },
  h2: { fontSize: 20, lineHeight: 26, letterSpacing: -0.3 },
  h3: { fontSize: 17, lineHeight: 23, letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 22 },
  bodySm: { fontSize: 13, lineHeight: 19 },
  label: { fontSize: 12, lineHeight: 16, letterSpacing: 0.2 },
  caption: { fontSize: 11, lineHeight: 14, letterSpacing: 0.3 },
} as const;

export const shadow = {
  card: {
    shadowColor: '#3B2A1A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  soft: {
    shadowColor: '#3B2A1A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#3B2A1A',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
} as const;
