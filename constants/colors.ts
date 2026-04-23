export const colors = {
  // Top-level shorthand (used by prayer-session and PrayerLockScreen)
  primary: '#0D9488',

  // Core surfaces
  background: '#080808',
  surface: '#141414',
  surfaceElevated: '#1E1E1E',
  border: '#282828',
  borderSubtle: '#1C1C1C',

  // Legacy aliases — same values, used by older imports
  card: '#141414',
  cardBorder: '#282828',

  // Text hierarchy
  text: {
    primary: '#F5F5F5',
    secondary: '#A3A3A3',
    tertiary: '#525252',
    muted: '#525252', // legacy alias for tertiary
  },

  // Brand & semantic accents
  accent: {
    primary: '#0D9488',
    primaryLight: 'rgba(13,148,136,0.15)',
    teal: '#0D9488', // legacy alias
    amber: '#D97706',
    success: '#10B981',
    destructive: '#EF4444',
    // Kept for backward compat — use sparingly
    purple: '#7C3AED',
    blue: '#3B82F6',
    pink: '#EC4899',
  },

  // Gradients — immersive screens only
  gradient: {
    brand: ['#0D9488', '#0F766E', '#134E4A'] as const,
    intercept: ['#12091F', '#1E1035', '#2D1760'] as const,
    activePrayer: ['#080808', '#111827', '#0F2922'] as const,
    complete: ['#080808', '#0F2922', '#134E4A'] as const,
    premium: ['#14082B', '#1E1035', '#2D1760'] as const,
  },

  // Legacy gradient aliases
  gradients: {
    teal: ['#0D9488', '#0F766E', '#134E4A'] as const,
    purple: ['#7c3aed', '#6d28d9', '#4c1d95'] as const,
    amber: ['#f59e0b', '#d97706', '#b45309'] as const,
    blue: ['#3b82f6', '#2563eb', '#1e40af'] as const,
    pink: ['#ec4899', '#db2777', '#be185d'] as const,
    darkPurple: ['#12091F', '#1E1035', '#2D1760', '#3d2060', '#4a2080'] as const,
  },
};
