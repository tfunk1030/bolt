import { ComponentType } from 'react';
import { Button as TamaguiButton, ButtonProps as TamaguiButtonProps } from '@tamagui/core';
import { IconProps } from '@tamagui/lucide-icons';

export interface CustomButtonProps extends TamaguiButtonProps {
  leftIcon?: ComponentType<IconProps>;
  rightIcon?: ComponentType<IconProps>;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
}

export interface IconButtonProps extends Omit<CustomButtonProps, 'leftIcon' | 'rightIcon'> {
  icon: ComponentType<IconProps>;
  'aria-label': string;
}

export function Button({
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  children,
  variant = 'default',
  size = 'md',
  isLoading,
  isDisabled,
  ...props
}: CustomButtonProps) {
  return (
    <TamaguiButton
      {...props}
      disabled={isDisabled || isLoading}
      opacity={isDisabled ? 0.5 : 1}
    >
      {LeftIcon && <LeftIcon size={16} />}
      {children}
      {RightIcon && <RightIcon size={16} />}
    </TamaguiButton>
  );
}

export function IconButton({
  icon: Icon,
  size = 'md',
  'aria-label': ariaLabel,
  ...props
}: IconButtonProps) {
  return (
    <TamaguiButton
      {...props}
      aria-label={ariaLabel}
      height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
      width={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
      padding={0}
      alignItems="center"
      justifyContent="center"
    >
      <Icon size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
    </TamaguiButton>
  );
}

export type { TamaguiButtonProps as ButtonProps };
