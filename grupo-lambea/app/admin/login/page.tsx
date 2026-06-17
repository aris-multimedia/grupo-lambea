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
    <div className="min-h-screen flex items-center justify-center bg-(--bg-soft) px-4">
      <div className="bg-white rounded-(--r-lg) shadow-[0_20px_50px_rgba(14,87,132,0.12)] border border-(--line) p-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="font-(family-name:--font-lora) text-[24px] font-semibold text-(--ink) leading-none">Grupo Lambea</div>
          <div className="text-[12px] text-(--ink-500) mt-2 uppercase tracking-wider">Panel de administración</div>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[13px] font-medium text-(--ink-700)">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="border border-[#d7dde6] rounded-(--r-sm) px-3.5 py-2.5 text-[14px] text-(--ink) outline-none focus:border-(--blue) focus:ring-2 focus:ring-[rgba(30,146,216,0.18)] transition-colors"
              placeholder="tu@email.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[13px] font-medium text-(--ink-700)">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="border border-[#d7dde6] rounded-(--r-sm) px-3.5 py-2.5 text-[14px] text-(--ink) outline-none focus:border-(--blue) focus:ring-2 focus:ring-[rgba(30,146,216,0.18)] transition-colors"
            />
          </div>

          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-(--r-sm) px-3.5 py-2.5">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 bg-blue hover:bg-blue-dark text-white font-semibold text-[14px] rounded-(--r-sm) py-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {pending ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
