declare module 'react-lottie' {
  import * as React from 'react';

  interface LottieOptions {
    loop?: boolean;
    autoplay?: boolean;
    animationData: any;
    rendererSettings?: {
      preserveAspectRatio?: string;
    };
  }

  interface LottieProps {
    options: LottieOptions;
    height?: number | string;
    width?: number | string;
    style?: React.CSSProperties;
  }

  const Lottie: React.FC<LottieProps>;
  export default Lottie;
}