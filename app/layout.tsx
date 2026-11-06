import type { Metadata } from 'next';
import {
  Inter,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
  Space_Grotesk,
} from 'next/font/google';
import { AppShell } from './components/AppShell';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const fontVariables = [
  inter.variable,
  jetbrainsMono.variable,
  plusJakarta.variable,
  spaceGrotesk.variable,
].join(' ');

export const metadata: Metadata = {
  title: 'KitaMCTools: Minecraft tools for builders & creators',
  description:
    'Plan builds, generate shapes, create map art, explore seeds, and export useful files without leaving the page. High-performance browser utilities for Minecraft architects.',
  keywords: [
    'Minecraft tools',
    'Minecraft build planner',
    'Minecraft circle generator',
    'schematic viewer',
    'voxel builder',
    'seed map',
    'enchant optimizer',
  ],
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full ${fontVariables}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Icons still load from Google Fonts; text fonts are self-hosted via next/font */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        {/* Anti-FOUC Theme Script: Sync theme immediately before render */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('KitaMCTools_theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (stored === 'dark' || (!stored && prefersDark)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.dataset.theme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.dataset.theme = 'light';
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col antialiased"
        suppressHydrationWarning
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}