'use client';

import { useEffect, useState } from 'react';
import { useFullScreen } from '@/hooks/useFullScreen';
import { Expand, Shrink } from 'lucide-react';

export const FullScreenGuide = () => {
  const { isFullScreen, toggleFullScreen } = useFullScreen();
  const [showGuide, setShowGuide] = useState(true);
  const [showExitGuide, setShowExitGuide] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isFullScreen) {
      setShowGuide(false);
      setShowExitGuide(true);
      const timer = setTimeout(() => {
        setShowExitGuide(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowGuide(true);
      setShowExitGuide(false);
    }
  }, [isFullScreen]);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Expand button */}
      {showGuide && (
        <button
          onClick={toggleFullScreen}
          className="fixed top-4 right-4 flex items-center gap-2 rounded-lg bg-black/70 px-4 py-2 text-white shadow-lg transition-all hover:bg-black/80"
        >
          <Expand className="h-5 w-5" />
          <span>画面を大きく</span>
        </button>
      )}

      {/* Exit guide */}
      {showExitGuide && (
        <div className="fixed top-4 right-4 flex items-center gap-2 rounded-lg bg-black/70 px-4 py-2 text-white shadow-lg transition-opacity">
          <Shrink className="h-5 w-5" />
          <span>元に戻す</span>
        </div>
      )}
    </>
  );
};
