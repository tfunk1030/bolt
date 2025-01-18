import { YStack, StackProps } from 'tamagui';

interface CardProps extends StackProps {
  variant?: 'default' | 'outlined';
}

export function Card({ variant = 'default', ...props }: CardProps) {
  return (
    <YStack
      backgroundColor={variant === 'default' ? '$background' : 'transparent'}
      padding="$4"
      borderRadius="$4"
      elevation={5}
      borderWidth={1}
      borderColor="$borderColor"
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.25}
      shadowRadius={3.84}
      {...props}
    />
  );
}
