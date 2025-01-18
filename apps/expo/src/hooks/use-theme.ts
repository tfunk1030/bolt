import { useTheme as useTamaguiTheme } from '@tamagui/core';
import { useColorScheme } from 'react-native';

export function useTheme() {
  const theme = useTamaguiTheme();
  const colorScheme = useColorScheme();

  return {
    ...theme,
    isDark: colorScheme === 'dark',
    colorScheme,
    // Common color shortcuts
    colors: {
      primary: theme.primary.val,
      background: theme.background.val,
      text: theme.color.val,
      border: theme.borderColor.val,
      error: theme.red.val,
      success: theme.green.val,
      warning: theme.yellow.val,
      info: theme.blue.val,
      // Semantic colors
      textPrimary: theme.color.val,
      textSecondary: theme.gray.val,
      textDisabled: theme.gray.val,
      divider: theme.borderColor.val,
    },
    // Common spacing shortcuts
    spacing: {
      xs: theme.space[1].val,
      sm: theme.space[2].val,
      md: theme.space[3].val,
      lg: theme.space[4].val,
      xl: theme.space[5].val,
    },
    // Common radius shortcuts
    radius: {
      sm: theme.radius[1].val,
      md: theme.radius[2].val,
      lg: theme.radius[3].val,
      full: 9999,
    },
  };
}

export type Theme = ReturnType<typeof useTheme>;
