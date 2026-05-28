export default function Home() {
  return (
    <main style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        maxWidth: 480,
        textAlign: 'center',
        background: 'white',
        padding: 40,
        borderRadius: 12,
        border: '1px solid #e2e8ef',
      }}>
        <h1 style={{ fontSize: 22, marginBottom: 12, fontWeight: 600 }}>
          Herramienta de revisión
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
          Esta página es privada. Si necesitas acceso, contacta con quien te envió el link.
        </p>
      </div>
    </main>
  )
}
