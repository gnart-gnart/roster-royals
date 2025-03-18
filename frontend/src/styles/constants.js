// Common style constants for consistent UI across the app

// Add these imports at the top of the file
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsHockeyIcon from '@mui/icons-material/SportsHockey';
import SportsMmaIcon from '@mui/icons-material/SportsMma';

// Color palette
export const COLORS = {
  // Primary colors
  primary: '#8b5cf6', // Purple
  primaryLight: '#a78bfa',
  primaryDark: '#7c3aed',
  
  // Secondary colors
  secondary: '#10b981', // Green
  secondaryLight: '#34d399',
  secondaryDark: '#059669',
  
  // Accent colors
  accent: '#60a5fa', // Blue
  accentLight: '#93c5fd',
  accentDark: '#3b82f6',
  
  // Alert colors
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981',
  info: '#60a5fa',
  
  // Background colors
  bgDark: '#0f0f13',
  bgCard: 'rgba(25, 25, 35, 0.8)',
  bgCardDarker: 'rgba(17, 17, 23, 0.8)',
  bgInput: 'rgba(0, 0, 0, 0.2)',
  
  // Text colors
  textPrimary: '#f8fafc',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  
  // Border colors
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  borderAccent: 'rgba(139, 92, 246, 0.3)',
};

// Spacing scale
export const SPACING = {
  xs: 0.5, // 4px
  sm: 1,   // 8px
  md: 2,   // 16px
  lg: 3,   // 24px
  xl: 4,   // 32px
  xxl: 6,  // 48px
};

// Component styling
export const CARD_STYLES = {
  default: {
    backgroundColor: COLORS.bgCard,
    backdropFilter: 'blur(8px)',
    borderRadius: 3,
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  },
  hoverable: {
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 12px 20px -5px rgba(139, 92, 246, 0.2)`,
      borderColor: `${COLORS.primary}50`,
    },
  },
};

export const BUTTON_STYLES = {
  primary: {
    backgroundColor: COLORS.primary,
    '&:hover': {
      backgroundColor: COLORS.primaryDark,
    },
    borderRadius: 2,
    fontWeight: '500',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
  },
  secondary: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    color: COLORS.textPrimary,
    '&:hover': {
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      border: '1px solid rgba(139, 92, 246, 0.6)',
    },
    borderRadius: 2,
  },
  success: {
    backgroundColor: COLORS.success,
    '&:hover': {
      backgroundColor: COLORS.secondaryDark,
    },
    borderRadius: 2,
    fontWeight: '500',
  },
  danger: {
    backgroundColor: COLORS.error,
    '&:hover': {
      backgroundColor: '#dc2626',
    },
    borderRadius: 2,
    fontWeight: '500',
  },
};

export const INPUT_STYLES = {
  default: {
    '& .MuiOutlinedInput-root': {
      backgroundColor: COLORS.bgInput,
      borderRadius: 2,
      border: `1px solid ${COLORS.borderLight}`,
    },
    '& .MuiOutlinedInput-root:hover': {
      borderColor: COLORS.border,
    },
    '& .MuiOutlinedInput-root.Mui-focused': {
      borderColor: `${COLORS.primary}80`,
    },
  },
};

// Reusable animations
export const ANIMATIONS = {
  fadeIn: {
    animation: 'fadeIn 0.5s ease-in-out',
    '@keyframes fadeIn': {
      '0%': {
        opacity: 0,
      },
      '100%': {
        opacity: 1,
      },
    },
  },
  slideUp: {
    animation: 'slideUp 0.5s ease-out',
    '@keyframes slideUp': {
      '0%': {
        transform: 'translateY(20px)',
        opacity: 0,
      },
      '100%': {
        transform: 'translateY(0)',
        opacity: 1,
      },
    },
  },
};

// Typography styles
export const TYPOGRAPHY = {
  heading: {
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subheading: {
    fontWeight: 'medium',
    color: COLORS.textSecondary,
  },
  body: {
    color: COLORS.textPrimary,
  },
  caption: {
    color: COLORS.textMuted,
    fontSize: '0.875rem',
  },
};

// Sports icons mapping
export const SPORT_COLORS = {
  basketball: '#8b5cf6', // Purple
  football: '#10b981',   // Green 
  baseball: '#3b82f6',   // Blue
  hockey: '#f59e0b',     // Amber
  soccer: '#60a5fa',     // Light Blue
};

// Sport-specific styling information
export const SPORT_CONFIG = {
  nba: {
    color: '#8b5cf6', // Purple
    icon: SportsBasketballIcon,
    displayName: 'Basketball',
  },
  nfl: {
    color: '#2563eb', // Blue
    icon: SportsFootballIcon,
    displayName: 'American Football',
  },
  mlb: {
    color: '#ef4444', // Red
    icon: SportsBaseballIcon,
    displayName: 'Baseball',
  },
  soccer: {
    color: '#10b981', // Green
    icon: SportsSoccerIcon,
    displayName: 'Soccer',
  },
  nhl: {
    color: '#60a5fa', // Light blue
    icon: SportsHockeyIcon,
    displayName: 'Ice Hockey',
  },
  ufc: {
    color: '#f59e0b', // Amber
    icon: SportsMmaIcon,
    displayName: 'UFC',
  },
};

// Status chip styles
export const STATUS_CHIP_STYLES = {
  open: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  closed: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  pending: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    color: '#f59e0b',
    border: '1px solid rgba(245, 158, 11, 0.3)',
  }
}; 