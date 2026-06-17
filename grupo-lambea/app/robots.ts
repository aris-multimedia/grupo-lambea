import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/checkout', '/pedido-confirmado', '/carrito'],
      },
    ],
    sitemap: 'https://grupolambea.com/sitemap.xml',
    host: 'https://grupolambea.com',
  };
}
