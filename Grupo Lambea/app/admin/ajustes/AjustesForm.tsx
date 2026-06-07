'use client';

import { useState } from 'react';
import { Save, Phone, Truck, Tag, Building2 } from 'lucide-react';
import { updateSettings } from '@/app/actions/settings';
import {
  FIELDS,
  GROUP_META,
  type SettingGroup,
  type SettingField,
} from '@/lib/settings-schema';
import { Section, Field, Toggle, inputClass } from '@/app/admin/_components/ui';

const GROUP_ICON: Record<SettingGroup, React.ReactNode> = {
  contacto: <Phone size={14} />,
  envio: <Truck size={14} />,
  promo: <Tag size={14} />,
  empresa: <Building2 size={14} />,
};

// La promo NO se edita aquí: tiene su propio manager en el Escritorio.
const GROUP_ORDER: SettingGroup[] = ['contacto', 'envio', 'empresa'];

export function AjustesForm({ record }: { record: Record<string, string> }) {
  const [values, setValues] = useState<Record<string, string>>(record);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setSaved(false);
    setError(null);

    // Solo enviamos los campos de los grupos que este formulario muestra
    // (la promo se guarda aparte desde el manager del Escritorio).
    const formData = new FormData();
    for (const f of FIELDS) {
      if (!GROUP_ORDER.includes(f.group)) continue;
      formData.set(f.key, values[f.key] ?? '');
    }

    try {
      await updateSettings(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('No se pudieron guardar los cambios. Inténtalo de nuevo.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Sticky save bar — sin -mt negativo para no solapar (recortar) la cabecera de la página */}
      <div className="sticky top-0 z-20 -mx-6 lg:-mx-10 mb-6 bg-[rgba(247,249,251,0.92)] backdrop-blur px-6 lg:px-10 py-3 flex items-center justify-end gap-3 border-b border-(--line)">
        {error && <span className="text-[12px] text-red-600 font-medium">{error}</span>}
        {saved && <span className="text-[12px] text-[#15803d] font-medium">✓ Guardado</span>}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 bg-blue hover:bg-blue-dark disabled:opacity-60 text-white font-semibold text-[13px] px-5 py-2 rounded-(--r-sm) transition-colors cursor-pointer"
        >
          <Save size={14} />
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {GROUP_ORDER.map((group) => {
          const fields = FIELDS.filter((f) => f.group === group);
          return (
            <Section
              key={group}
              icon={GROUP_ICON[group]}
              title={GROUP_META[group].titulo}
              description={GROUP_META[group].descripcion}
            >
              <div className="space-y-4">
                {fields.map((f) => (
                  <FieldRenderer
                    key={f.key}
                    field={f}
                    value={values[f.key] ?? f.default}
                    onChange={(v) => setValue(f.key, v)}
                  />
                ))}
              </div>
            </Section>
          );
        })}
      </div>
    </form>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: SettingField;
  value: string;
  onChange: (v: string) => void;
}) {
  if (field.type === 'boolean') {
    return (
      <Toggle
        label={field.label}
        description={field.help}
        checked={value === 'true'}
        onChange={(v) => onChange(v ? 'true' : 'false')}
      />
    );
  }
  if (field.type === 'textarea') {
    return (
      <Field label={field.label} help={field.help}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={inputClass}
          placeholder={field.placeholder}
        />
      </Field>
    );
  }
  return (
    <Field label={field.label} help={field.help}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder={field.placeholder}
      />
    </Field>
  );
}
