import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * This file controls the HTML shell for the web build.
 * It injects PWA manifest, theme color, Apple touch icon meta tags,
 * and registers the service worker.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* Responsive */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme color (Android Chrome address bar) */}
        <meta name="theme-color" content="#1a1a2e" />

        {/* iOS PWA meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="RservPro" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* Favicon */}
        <link rel="icon" type="image/png" href="/favicon.png" />

        {/* Expo web scroll reset */}
        <ScrollViewStyleReset />

        {/* Register service worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) { console.log('SW registered:', reg.scope); })
                    .catch(function(err) { console.log('SW registration failed:', err); });
                });
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
