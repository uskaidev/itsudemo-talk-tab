'use client';

import { useEffect } from 'react';
import { useFullScreen } from '@/hooks/useFullScreen';

export const FullScreenHandler = () => {
  const { enterFullScreen } = useFullScreen();

  useEffect(() => {
    // Check if it's running on supported browsers
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isDesktop = !/Android|iPhone|iPad/i.test(navigator.userAgent);
    const isChrome = /Chrome/i.test(navigator.userAgent);
    const isEdge = /Edg/i.test(navigator.userAgent);

    if ((isAndroid && isChrome) || (isDesktop && (isChrome || isEdge))) {
      // Attempt to enter full-screen mode after a short delay
      // This delay helps ensure the browser is ready to handle the full-screen request
      const timer = setTimeout(() => {
        enterFullScreen();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [enterFullScreen]);

  // This component doesn't render anything
  return null;
};
