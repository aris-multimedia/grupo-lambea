import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Revisión de imágenes',
  description: 'Herramienta interna de revisión',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
