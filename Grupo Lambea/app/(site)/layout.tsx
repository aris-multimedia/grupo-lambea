import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CartProvider } from '@/components/CartProvider';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { CookieBanner } from '@/components/CookieBanner';
import { getSettings } from '@/lib/settings';
import { phoneDigits } from '@/lib/settings-schema';

const SITE_URL = 'https://grupolambea.com';
const OG_IMAGE = '/assets/categorias/foto-productos-barco.jpg';
const SITE_DESC =
  'Empresa familiar fundada en 1952. Productos de limpieza especializados para náutica, caravaning e industria. 3×2 en todo el catálogo.';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'Grupo Lambea',
    url: '/',
    title: 'Grupo Lambea — Productos profesionales de limpieza y mantenimiento',
    description: SITE_DESC,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Grupo Lambea' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grupo Lambea — Productos profesionales de limpieza y mantenimiento',
    description: SITE_DESC,
    images: [OG_IMAGE],
  },
};

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Grupo Lambea',
    legalName: settings.empresa.razon_social,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    foundingDate: settings.empresa.anio_fundacion,
    email: settings.contacto.email,
    telephone: `+${phoneDigits(settings.contacto.telefono)}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.empresa.direccion,
      postalCode: settings.empresa.cp,
      addressLocality: settings.empresa.ciudad,
      addressRegion: settings.empresa.provincia,
      addressCountry: 'ES',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <Suspense fallback={null}>
        <CartProvider promo={settings.promo}>
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-(--blue) focus:text-white focus:px-4 focus:py-2 focus:rounded-(--r-sm) focus:font-semibold focus:no-underline"
          >
            Saltar al contenido
          </a>
          <SiteHeader settings={settings} />
          <main id="contenido">{children}</main>
          <SiteFooter settings={settings} />
          <CookieBanner />
        </CartProvider>
      </Suspense>
    </>
  );
}
