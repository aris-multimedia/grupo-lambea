import { logout } from '@/app/actions/auth';
import { getSession } from '@/lib/session';
import { sql } from '@/lib/db';
import { LogOut, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { AdminNav } from './AdminNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Login page uses this layout too — render children without the chrome
  if (!session) return <>{children}</>;

  // Pedidos pendientes → badge en el menú
  let nuevosCount = 0;
  try {
    const [{ count }] = await sql`SELECT COUNT(*) as count FROM orders WHERE estado = 'nuevo'`;
    nuevosCount = Number(count);
  } catch {
    nuevosCount = 0;
  }

  return (
    // h-screen + overflow-hidden → la ventana NO scrollea; el scroll vive en <main>.
    // Es lo que hace que los headers sticky (botón Guardar) queden realmente fijos.
    <div className="h-screen flex bg-(--bg-soft) overflow-hidden">
      {/* ── Sidebar — azul profundo de marca (el de la franja superior de la web) ── */}
      <aside
        className="w-60 flex flex-col shrink-0 h-screen text-white"
        style={{ background: 'var(--blue-deep)' }}
      >
        <div className="px-6 py-5 border-b border-white/10">
          <div className="font-(family-name:--font-lora) text-[18px] font-semibold tracking-tight leading-none">
            Grupo Lambea
          </div>
          <div className="text-[11px] text-white/55 mt-1.5 uppercase tracking-wider">
            Panel de administración
          </div>
        </div>

        <AdminNav nuevosCount={nuevosCount} />

        <div className="px-3 py-3 border-t border-white/10 space-y-0.5">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-white/70 hover:text-white hover:bg-white/10 rounded-(--r-sm) transition-colors no-underline"
          >
            <ExternalLink size={14} />
            Ver la web
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-white/70 hover:text-white hover:bg-white/10 rounded-(--r-sm) transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              Cerrar sesión
            </button>
          </form>
          <div className="text-[11px] text-white/40 px-3 pt-2 truncate">{session.email}</div>
        </div>
      </aside>

      {/* Main — único contenedor con scroll; ancho amplio para aprovechar la pantalla */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-420 mx-auto px-6 lg:px-10 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
