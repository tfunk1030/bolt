import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Dashboard: undefined;
  ShotCalculator: undefined;
  WindCalculator: undefined;
  Settings: undefined;
};

export type TabParamList = {
  Home: NavigatorScreenParams<RootStackParamList>;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
