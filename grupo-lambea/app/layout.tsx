import type { Metadata } from 'next';
import { Lora, Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

const SITE_URL = 'https://grupolambea.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Grupo Lambea — Productos profesionales de limpieza y mantenimiento',
    template: '%s — Grupo Lambea',
  },
  description:
    'Empresa familiar fundada en 1952. Productos de limpieza especializados para náutica, caravaning e industria. 3×2 en todo el catálogo.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${lora.variable}`}>
      <body className="font-(family-name:--font-inter)">
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  );
}
