import type { Metadata } from 'next';
import { Lora, Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import { CartProvider } from '@/components/CartProvider';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

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

export const metadata: Metadata = {
  title: 'Grupo Lambea — Productos profesionales de limpieza y mantenimiento',
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
        <Suspense fallback={null}>
          <CartProvider>
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
          </CartProvider>
        </Suspense>
      </body>
    </html>
  );
}
