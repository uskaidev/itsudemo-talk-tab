'use client';

import { FullScreenGuide } from './full-screen-guide';

export const FullScreenHandler = () => {
  // Check if it's running on supported browsers
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
  const isDesktop = typeof navigator !== 'undefined' && !/Android|iPhone|iPad/i.test(navigator.userAgent);
  const isChrome = typeof navigator !== 'undefined' && /Chrome/i.test(navigator.userAgent);
  const isEdge = typeof navigator !== 'undefined' && /Edg/i.test(navigator.userAgent);

  if ((isAndroid && isChrome) || (isDesktop && (isChrome || isEdge))) {
    return <FullScreenGuide />;
  }

  return null;
};
