import { TamaguiProvider as Provider } from 'tamagui';
import config from '../tamagui.config';

interface TamaguiProviderProps {
  children: React.ReactNode;
}

export function TamaguiProvider({ children }: TamaguiProviderProps) {
  return (
    <Provider config={config}>
      {children}
    </Provider>
  );
}
