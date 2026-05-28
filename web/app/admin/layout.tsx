import Link from 'next/link';
import { logout } from '@/app/actions/auth';
import { getSession } from '@/lib/session';
import { LogOut } from 'lucide-react';
import { AdminNav } from './AdminNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Login page uses this layout too — render children without the sidebar
  if (!session) return <>{children}</>;

  return (
    <div className="min-h-screen flex bg-[#f4f6f9]">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-[#e5e7eb] flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-[#e5e7eb]">
          <div className="text-[13px] font-bold text-[#1E92D8] tracking-widest uppercase">Grupo Lambea</div>
          <div className="text-[11px] text-[#9ca3af] mt-0.5">Panel de administración</div>
        </div>

        <AdminNav />

        <div className="px-3 py-4 border-t border-[#e5e7eb]">
          <div className="text-[11px] text-[#9ca3af] px-3 mb-2 truncate">{session.email}</div>
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#6b7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={14} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

