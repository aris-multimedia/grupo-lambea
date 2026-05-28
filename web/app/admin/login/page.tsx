'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';

export default function LoginPage() {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const result = await login(formData);
      return result ?? null;
    },
    null,
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f9]">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-[22px] font-semibold text-[#1a1f2a] mb-1">Panel de administración</div>
          <div className="text-[13px] text-[#6b7280]">Grupo Lambea</div>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[13px] font-medium text-[#374151]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="border border-[#d1d5db] rounded-lg px-3.5 py-2.5 text-[14px] outline-none focus:border-[#1E92D8] focus:ring-2 focus:ring-[#1E92D8]/20 transition-all"
              placeholder="tu@email.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[13px] font-medium text-[#374151]">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="border border-[#d1d5db] rounded-lg px-3.5 py-2.5 text-[14px] outline-none focus:border-[#1E92D8] focus:ring-2 focus:ring-[#1E92D8]/20 transition-all"
            />
          </div>

          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-lg px-3.5 py-2.5">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 bg-[#1E92D8] hover:bg-[#1370A8] text-white font-semibold text-[14px] rounded-lg py-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
