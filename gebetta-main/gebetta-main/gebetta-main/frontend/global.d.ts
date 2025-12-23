// Type definitions for Node.js require
interface NodeRequire {
  (path: string): any;
  context(directory: string, useSubdirectories?: boolean, regExp?: RegExp): any;
  ensure: (paths: string[], callback: (require: (path: string) => any) => void) => void;
  resolve: (path: string) => string;
}

declare const require: NodeRequire;

// Add global type definitions as needed
declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

declare module '*.jpeg' {
  const value: any;
  export default value;
}

declare module '*.gif' {
  const value: any;
  export default value;
}

declare module '*.svg' {
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
