import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ramalin — Pembacaan Tarot Interaktif',
  description: 'Permainan simulasi pembacaan kartu tarot interaktif dipandu peramal senja dengan tebaran 3 kartu masa lalu, kini, dan masa depan.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#150F21',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full bg-tarot-canvas">
      <body className="h-full bg-tarot-canvas text-tarot-text font-sans antialiased selection:bg-tarot-amber selection:text-black overflow-hidden">
        {children}
      </body>
    </html>
  );
}
