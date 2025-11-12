declare module 'lucide-react-native' {
  import { ComponentType, ReactNode } from 'react';
  import { StyleProp, TextStyle } from 'react-native';

  interface IconProps {
    size?: number;
    color?: string;
    strokeWidth?: number;
    style?: StyleProp<TextStyle>;
  }

  export const Activity: ComponentType<IconProps>;
  export const AlertCircle: ComponentType<IconProps>;
  export const AlertTriangle: ComponentType<IconProps>;
  export const ArrowLeft: ComponentType<IconProps>;
  export const ArrowRight: ComponentType<IconProps>;
  export const Bookmark: ComponentType<IconProps>;
  export const Check: ComponentType<IconProps>;
  export const ChevronDown: ComponentType<IconProps>;
  export const ChevronLeft: ComponentType<IconProps>;
  export const ChevronRight: ComponentType<IconProps>;
  export const ChevronUp: ComponentType<IconProps>;
  export const Clock: ComponentType<IconProps>;
  export const CreditCard: ComponentType<IconProps>;
  export const Edit2: ComponentType<IconProps>;
  export const Grid: ComponentType<IconProps>;
  export const Gift: ComponentType<IconProps>;
  export const Home: ComponentType<IconProps>;
  export const Info: ComponentType<IconProps>;
  export const LogOut: ComponentType<IconProps>;
  export const Lock: ComponentType<IconProps>;
  export const Mail: ComponentType<IconProps>;
  export const MapPin: ComponentType<IconProps>;
  export const Menu: ComponentType<IconProps>;
  export const Office: ComponentType<IconProps>;
  export const Search: ComponentType<IconProps>;
  export const Settings: ComponentType<IconProps>;
  export const ShoppingBag: ComponentType<IconProps>;
  export const User: ComponentType<IconProps>;
  export const UserMinus: ComponentType<IconProps>;
  export const UserPlus: ComponentType<IconProps>;
  export const X: ComponentType<IconProps>;
}
