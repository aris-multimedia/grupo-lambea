import { phoneDigits } from '@/lib/settings-schema'

// Botón flotante de WhatsApp (todas las páginas públicas). En móvil se eleva
// para no tapar la barra de compra sticky de la ficha de producto.
export function WhatsAppFab({ numero }: { numero: string }) {
  const digits = phoneDigits(numero)
  if (!digits) return null

  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      title="Escríbenos por WhatsApp"
      className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-105"
      style={{ background: '#25D366', boxShadow: '0 6px 20px rgba(37, 211, 102, 0.4)' }}
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="#fff" aria-hidden="true">
        <path d="M16.04 5.33c-5.87 0-10.64 4.77-10.64 10.64 0 1.88.49 3.71 1.43 5.32L5.33 26.7l5.55-1.46a10.6 10.6 0 0 0 5.16 1.32h.01c5.86 0 10.63-4.77 10.63-10.64 0-2.84-1.1-5.51-3.11-7.52a10.57 10.57 0 0 0-7.53-3.07zm0 19.43h-.01a8.8 8.8 0 0 1-4.49-1.23l-.32-.19-3.34.88.89-3.26-.21-.33a8.78 8.78 0 0 1-1.35-4.69c0-4.87 3.97-8.84 8.84-8.84 2.36 0 4.58.92 6.25 2.59a8.78 8.78 0 0 1 2.59 6.26c0 4.88-3.97 8.84-8.85 8.84zm4.85-6.62c-.27-.13-1.57-.78-1.82-.86-.24-.09-.42-.13-.6.13-.17.27-.68.86-.84 1.04-.15.18-.31.2-.57.07-.27-.14-1.12-.42-2.14-1.32-.79-.71-1.32-1.58-1.48-1.84-.15-.27-.02-.41.12-.55.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.33-.02-.47-.07-.13-.6-1.44-.82-1.97-.21-.52-.43-.45-.6-.46l-.51-.01c-.18 0-.47.07-.71.33-.24.27-.93.91-.93 2.22 0 1.31.95 2.57 1.09 2.75.13.18 1.87 2.86 4.54 4.01.63.27 1.13.44 1.51.56.64.2 1.22.17 1.68.11.51-.08 1.57-.64 1.79-1.27.22-.62.22-1.15.16-1.26-.07-.11-.25-.18-.51-.31z" />
      </svg>
    </a>
  )
}
