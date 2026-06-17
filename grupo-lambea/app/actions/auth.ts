'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { createSession, deleteSession } from '@/lib/session';

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function login(formData: FormData) {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: 'Datos inválidos' };
  }

  const { email, password } = parsed.data;

  const validEmail = process.env.ADMIN_EMAIL;
  const validHash = process.env.ADMIN_PASSWORD_HASH;

  if (!validEmail || !validHash || email !== validEmail) {
    return { error: 'Credenciales incorrectas' };
  }

  const ok = await bcrypt.compare(password, validHash);
  if (!ok) {
    return { error: 'Credenciales incorrectas' };
  }

  await createSession(email);
  redirect('/admin');
}

export async function logout() {
  await deleteSession();
  redirect('/admin/login');
}
