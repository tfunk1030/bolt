import { createTamagui, createFont, createTokens } from '@tamagui/core'
import { themes } from '@tamagui/themes'

const font = createFont({
  family: 'Inter',
  size: {
    1: 12,
    2: 14,
    3: 16,
  },
  lineHeight: {
    1: 16,
    2: 20,
    3: 24,
  },
  weight: {
    4: '300',
    6: '600',
  },
  letterSpacing: {
    4: 0,
    8: -1,
  },
})

const tokens = createTokens({
  color: themes.light,
  radius: {
    0: 0,
    1: 3,
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
  },
})

const config = createTamagui({
  themes,
  fonts: {
    heading: font,
    body: font,
  },
  tokens,
})

export type AppConfig = typeof config

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config