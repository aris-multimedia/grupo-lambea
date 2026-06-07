// Esquema de ajustes del sitio — módulo PURO (sin acceso a DB).
// Lo importan tanto el formulario de admin (client) como las funciones de servidor.
// Fuente única de verdad para: claves de almacenamiento, valores por defecto,
// etiquetas del formulario y agrupación.

export type SettingGroup = 'contacto' | 'envio' | 'promo' | 'empresa';
export type SettingType = 'text' | 'textarea' | 'boolean';

// Tipos de promoción disponibles. Añadir uno nuevo = cambio de código
// (catálogo en lib/promotions.ts). El cliente elige cuál está activa.
export type PromoTipo = '3x2' | 'descuento' | 'envio_gratis';

export interface SettingField {
  key: string; // clave plana en la tabla site_settings (group_nombre)
  group: SettingGroup;
  label: string;
  help?: string;
  type: SettingType;
  default: string; // los booleanos se guardan como 'true' | 'false'
  placeholder?: string;
}

export const GROUP_META: Record<SettingGroup, { titulo: string; descripcion: string }> = {
  contacto: { titulo: 'Contacto', descripcion: 'Teléfonos y correo que se muestran en toda la web.' },
  envio:    { titulo: 'Envíos',   descripcion: 'Textos de envío que ve el cliente en la tienda y la ficha.' },
  promo:    { titulo: 'Promociones', descripcion: 'Se gestionan desde el Escritorio.' },
  empresa:  { titulo: 'Datos de la empresa', descripcion: 'Aparecen en el pie, contacto y páginas legales.' },
};

// Valores por defecto = los que hoy están escritos a fuego en la web.
// Si la tabla está vacía, la web sigue mostrando exactamente lo mismo que ahora.
export const FIELDS: SettingField[] = [
  // ── Contacto ──────────────────────────────────────────────
  { key: 'contacto_telefono', group: 'contacto', type: 'text', label: 'Teléfono principal', default: '637 916 345', help: 'Se muestra en la cabecera, el pie y la página de contacto.' },
  { key: 'contacto_whatsapp', group: 'contacto', type: 'text', label: 'WhatsApp', default: '637 916 345', help: 'Número para el botón de WhatsApp (se ignoran espacios).' },
  { key: 'contacto_email', group: 'contacto', type: 'text', label: 'Email de contacto', default: 'francisco@grupolambea.com' },
  { key: 'contacto_telefono_toxicologia', group: 'contacto', type: 'text', label: 'Teléfono toxicología (24 h)', default: '915 620 420', help: 'Obligatorio en las fichas de producto.' },
  { key: 'contacto_horario', group: 'contacto', type: 'text', label: 'Horario de atención', default: 'Lunes a viernes, 9:00–18:00' },

  // ── Envíos ────────────────────────────────────────────────
  { key: 'envio_texto_peninsula', group: 'envio', type: 'text', label: 'Texto envío Península', default: 'Envío gratis en Península' },
  { key: 'envio_coste_baleares', group: 'envio', type: 'text', label: 'Coste envío Baleares', default: '4 €' },
  { key: 'envio_umbral_gratis', group: 'envio', type: 'text', label: 'Umbral de envío gratis', default: '', placeholder: 'Ej: 60 € (vacío = siempre gratis en Península)', help: 'Déjalo vacío si el envío es gratis sin mínimo.' },
  { key: 'envio_entrega_estimada', group: 'envio', type: 'text', label: 'Plazo de entrega', default: '24–48 h laborables' },

  // ── Promoción (se edita desde el manager del Escritorio, no en el form de Ajustes) ──
  { key: 'promo_activa', group: 'promo', type: 'boolean', label: 'Promoción activa', default: 'true', help: 'Muestra u oculta la promo en toda la web.' },
  { key: 'promo_tipo', group: 'promo', type: 'text', label: 'Tipo de promoción', default: '3x2' },
  { key: 'promo_titulo', group: 'promo', type: 'text', label: 'Título de la promo', default: '3×2 en todo el catálogo' },
  { key: 'promo_descripcion', group: 'promo', type: 'text', label: 'Descripción de la promo', default: 'Llévate tres y paga solo dos' },
  { key: 'promo_valor', group: 'promo', type: 'text', label: 'Parámetro de la promo', default: '' },

  // ── Empresa ───────────────────────────────────────────────
  { key: 'empresa_razon_social', group: 'empresa', type: 'text', label: 'Razón social', default: 'SOLUCIONES ECOLAM S.L' },
  { key: 'empresa_cif', group: 'empresa', type: 'text', label: 'CIF / NIF', default: 'B55380679' },
  { key: 'empresa_direccion', group: 'empresa', type: 'text', label: 'Dirección', default: 'Calle Caserna 48' },
  { key: 'empresa_cp', group: 'empresa', type: 'text', label: 'Código postal', default: '43877' },
  { key: 'empresa_ciudad', group: 'empresa', type: 'text', label: 'Ciudad', default: "Sant Jaume d'Enveja" },
  { key: 'empresa_provincia', group: 'empresa', type: 'text', label: 'Provincia', default: 'Tarragona' },
  { key: 'empresa_anio_fundacion', group: 'empresa', type: 'text', label: 'Año de fundación', default: '1952' },
  { key: 'empresa_registro_toxicologico', group: 'empresa', type: 'text', label: 'Registro toxicológico', default: 'DRP19-0005580' },
];

export const DEFAULTS: Record<string, string> = Object.fromEntries(
  FIELDS.map((f) => [f.key, f.default])
);

// Vista anidada y tipada para consumir en la web.
export interface SiteSettings {
  contacto: {
    telefono: string;
    whatsapp: string;
    email: string;
    telefono_toxicologia: string;
    horario: string;
  };
  envio: {
    texto_peninsula: string;
    coste_baleares: string;
    umbral_gratis: string;
    entrega_estimada: string;
  };
  promo: {
    activa: boolean;
    tipo: PromoTipo;
    titulo: string;
    descripcion: string;
    valor: number; // descuento: %; envío gratis: importe mínimo (solo texto)
  };
  empresa: {
    razon_social: string;
    cif: string;
    direccion: string;
    ciudad: string;
    cp: string;
    provincia: string;
    anio_fundacion: string;
    registro_toxicologico: string;
  };
}

/** La promoción activa, tal como la consume la web. */
export type ActivePromo = SiteSettings['promo'];

/** Convierte el registro plano (DB + defaults) en la estructura anidada. */
export function toNested(record: Record<string, string>): SiteSettings {
  const v = (key: string) => record[key] ?? DEFAULTS[key] ?? '';
  const b = (key: string) => (record[key] ?? DEFAULTS[key]) === 'true';
  return {
    contacto: {
      telefono: v('contacto_telefono'),
      whatsapp: v('contacto_whatsapp'),
      email: v('contacto_email'),
      telefono_toxicologia: v('contacto_telefono_toxicologia'),
      horario: v('contacto_horario'),
    },
    envio: {
      texto_peninsula: v('envio_texto_peninsula'),
      coste_baleares: v('envio_coste_baleares'),
      umbral_gratis: v('envio_umbral_gratis'),
      entrega_estimada: v('envio_entrega_estimada'),
    },
    promo: {
      activa: b('promo_activa'),
      tipo: ((['3x2', 'descuento', 'envio_gratis'] as const).includes(v('promo_tipo') as PromoTipo)
        ? v('promo_tipo')
        : '3x2') as PromoTipo,
      titulo: v('promo_titulo'),
      descripcion: v('promo_descripcion'),
      valor: Number((v('promo_valor') || '0').replace(',', '.')) || 0,
    },
    empresa: {
      razon_social: v('empresa_razon_social'),
      cif: v('empresa_cif'),
      direccion: v('empresa_direccion'),
      ciudad: v('empresa_ciudad'),
      cp: v('empresa_cp'),
      provincia: v('empresa_provincia'),
      anio_fundacion: v('empresa_anio_fundacion'),
      registro_toxicologico: v('empresa_registro_toxicologico'),
    },
  };
}

/** Solo dígitos, con prefijo país por defecto para enlaces wa.me / tel:. */
export function phoneDigits(raw: string, countryPrefix = '34'): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return '';
  // Si ya incluye prefijo internacional (>9 dígitos) lo dejamos tal cual.
  return digits.length > 9 ? digits : `${countryPrefix}${digits}`;
}
