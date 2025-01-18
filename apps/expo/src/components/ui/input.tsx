import * as React from 'react'
import type { TextInputProps } from 'react-native'
import { Input as TamaguiInput, InputProps } from 'tamagui'

export interface CustomInputProps extends InputProps {
  error?: boolean
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
}

const Input = React.forwardRef<TextInputProps, CustomInputProps>((props, ref) => {
  const { error, disabled, size = 'medium', ...rest } = props

  const getPadding = () => {
    switch (size) {
      case 'small':
        return '$2'
      case 'large':
        return '$4'
      default:
        return '$3'
    }
  }

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return '$2'
      case 'large':
        return '$4'
      default:
        return '$3'
    }
  }

  const getTheme = () => {
    if (error) return 'error'
    if (disabled) return 'disabled'
    return undefined
  }

  return (
    <TamaguiInput
      // @ts-ignore - Tamagui types issue
      ref={ref}
      padding={getPadding()}
      fontSize={getFontSize()}
      theme={getTheme()}
      disabled={disabled}
      {...rest}
    />
  )
})

Input.displayName = 'Input'

export { Input }
export type { InputProps }
