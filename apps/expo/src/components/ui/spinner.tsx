import * as React from 'react'
import type { ActivityIndicatorProps } from 'react-native'
import { Spinner as TamaguiSpinner, SpinnerProps } from 'tamagui'

export interface CustomSpinnerProps extends SpinnerProps {
  size?: 'small' | 'large'
  color?: string
}

const Spinner = React.forwardRef<ActivityIndicatorProps, CustomSpinnerProps>((props, ref) => {
  const { size = 'small', color, ...rest } = props

  const getSize = () => {
    switch (size) {
      case 'large':
        return 'large'
      default:
        return 'small'
    }
  }

  return (
    <TamaguiSpinner
      // @ts-ignore - Tamagui types issue
      ref={ref}
      size={getSize()}
      color={color}
      {...rest}
    />
  )
})

Spinner.displayName = 'Spinner'

export { Spinner }
export type { SpinnerProps }
