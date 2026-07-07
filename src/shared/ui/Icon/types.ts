import { ViewStyle } from 'react-native';

export type IconName =
  | 'Home'
  | 'Album'
  | 'Report'
  | 'Setting'
  | 'Alarm'
  | 'Profile'
  | 'Arrow'
  | 'Check'
  | 'Graph'
  | 'Plus'
  | 'Picture'
  | 'Calendar'
  | 'Map'
  | 'People'
  | 'Heart'
  | 'Comment'
  | 'More'
  | 'Sent'
  | 'Quiz'
  | 'Circle';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
}
