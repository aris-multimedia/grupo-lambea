import { getSettingsRaw } from '@/lib/settings';
import { AjustesForm } from './AjustesForm';
import { PageHeader } from '../_components/layout';

export default async function AjustesPage() {
  const record = await getSettingsRaw();

  return (
    <div>
      <PageHeader
        title="Ajustes del sitio"
        subtitle="Datos de tu negocio que aparecen en toda la web. Cámbialos aquí y se actualizan al instante en la cabecera, el pie, la página de contacto y las fichas. No necesitas tocar el código."
      />
      <AjustesForm record={record} />
    </div>
  );
}
