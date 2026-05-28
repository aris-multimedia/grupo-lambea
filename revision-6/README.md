# Revisión de imágenes — subapp temporal

Aplicación interna y temporal para que el cliente revise las 48 parejas
antes/después generadas para el catálogo de Grupo Lambea.

## URLs locales

Dev server en puerto **3001** (para no chocar con el proyecto `web/` en 3000):

```bash
cd revision
npm run dev
```

- **Cliente**: http://localhost:3001/c/[CLIENT_TOKEN]
- **Admin (tú)**: http://localhost:3001/admin/[ADMIN_TOKEN]

Los tokens están en `revision/.env.local` (NO commitear).

## Stack

- Next.js 16.2.6 (App Router) — mismo stack que `web/`
- Tailwind v4 + CSS variables propias (no comparte estilos con `web/`)
- Neon (mismo `DATABASE_URL` que `web/`)
- Tabla aislada: `image_feedback`

## Deploy a Vercel

Es un **proyecto Vercel separado** que apunta al mismo repo de GitHub
(`aris-multimedia/grupo-lambea`) pero con Root Directory distinto.

### 1. Asegúrate de commitear `revision/` al repo

```bash
git add revision/
git commit -m "feat: subapp temporal de revisión de imágenes"
git push
```

> ⚠️ **NO** commitees `revision/.env.local` (ya está en `.gitignore`).
> ⚠️ Las 96 imágenes en `revision/public/assets/before-after/` SÍ se commitean
>    (son ~67 MB, dentro del límite razonable de Vercel).

### 2. Crea un nuevo proyecto en Vercel

1. https://vercel.com/new
2. Importa el repo `aris-multimedia/grupo-lambea`
3. En "Configure project":
   - **Root Directory**: `revision`
   - **Framework Preset**: Next.js (auto-detect)
   - **Build Command**: `npm run build` (default)
4. Antes de hacer deploy, en "Environment Variables" añade:
   - `DATABASE_URL` — el mismo de tu Neon
   - `CLIENT_TOKEN` — el de `.env.local`
   - `ADMIN_TOKEN` — el de `.env.local`
5. Deploy

URL temporal: `https://grupo-lambea-revision.vercel.app` (o el nombre que le pongas).

### 3. (Opcional) Subdominio `revision.grupolambea.com`

En el proyecto recién creado de Vercel:

1. Settings → Domains → Add `revision.grupolambea.com`
2. Vercel te dará un registro CNAME, algo como:
   ```
   revision.grupolambea.com → cname.vercel-dns.com
   ```
3. Lo añades en el panel DNS de tu proveedor de dominios.
4. Espera unos minutos para que propague.

## Compartir el link con el cliente

Solo el de **cliente** (NUNCA el de admin):

```
https://revision.grupolambea.com/c/[CLIENT_TOKEN]
```

Si el cliente comparte el link, cualquiera con el link entra — pero
**no hay forma de adivinarlo** (es un token aleatorio de 24 bytes).

## Cómo regenerar imágenes que el cliente marca "rehacer"

1. Entra a `/admin/[ADMIN_TOKEN]`
2. Filtra por "Rehacer"
3. Para cada slug, ajusta el prompt en `web/public/assets/before-after/generate-pairs.sh`
4. Borra los `.png` de ese slug en `before/` y `after/`
5. Ejecuta `bash generate-pairs.sh nombre-del-slug` para regenerar solo esa pareja
6. Copia el nuevo `.png` a `revision/public/assets/before-after/` (o deja un script que lo haga)
7. Commit + push → Vercel redeploya solo

## Cleanup (cuando termine la revisión)

Esta app es temporal. Para apagarla:

1. **En Vercel**: Settings → General → Delete Project
2. **En tu proveedor DNS**: borra el registro CNAME de `revision.grupolambea.com`
3. **En la base de datos Neon** (para liberar la tabla):
   ```sql
   DROP TABLE image_feedback;
   ```
4. **En el repo local**:
   ```bash
   rm -rf revision/
   git add -A && git commit -m "chore: remove revision subapp" && git push
   ```
