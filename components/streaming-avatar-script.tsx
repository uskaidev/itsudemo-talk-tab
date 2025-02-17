"use client";

import Script from "next/script";

export default function StreamingAvatarScript() {
  return (
    <Script
      src="https://sdk.heygen.ai/streaming-avatar/2.0/streaming-avatar.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        console.log('StreamingAvatar SDK loaded successfully');
      }}
      onError={() => {
        console.error('Failed to load StreamingAvatar SDK');
      }}
    />
  );
}
