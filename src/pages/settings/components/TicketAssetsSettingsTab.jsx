import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../../../api/axiosConfig';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const ASSETS = [
  {
    type: 'firma',
    title: 'Firma autorizada',
    description: 'Se mostrará en el espacio de validación del comprobante.',
    icon: 'draw',
    previewClass: 'h-36'
  },
  {
    type: 'sello',
    title: 'Sello institucional',
    description: 'Se colocará junto a la firma en cada ticket emitido.',
    icon: 'approval',
    previewClass: 'h-36'
  }
];

const formatUpdatedAt = (value) => {
  if (!value) return 'Aún no se ha cargado una imagen';
  return `Actualizado ${new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))}`;
};

const TicketAssetCard = ({ definition, asset, draft, isSaving, onSelect, onSave, onDiscard }) => {
  const preview = draft?.preview || asset?.preview;
  const inputId = `ticket-asset-${definition.type}`;

  return (
    <article className="rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden shadow-sm">
      <div className="flex items-start gap-3 px-4 py-3 border-b border-outline-variant bg-surface-container-low">
        <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]" translate="no">{definition.icon}</span>
        </span>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-on-surface">{definition.title}</h4>
          <p className="text-xs text-on-surface-variant mt-0.5">{definition.description}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className={`${definition.previewClass} relative flex items-center justify-center rounded-lg border border-dashed border-outline-variant bg-white p-3 overflow-hidden`}>
          {preview ? (
            <img src={preview} alt={`Vista previa de ${definition.title.toLowerCase()}`} className="w-full h-full object-contain" />
          ) : (
            <div className="text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[34px] opacity-40" translate="no">image</span>
              <p className="text-xs mt-1">Sin imagen configurada</p>
            </div>
          )}
          {draft && (
            <span className="absolute top-2 right-2 rounded-full bg-tertiary-container text-on-tertiary-container px-2 py-0.5 text-[10px] font-bold">
              Vista previa
            </span>
          )}
        </div>

        <div className="min-h-9">
          <p className="text-xs font-semibold text-on-surface truncate">{draft?.name || `${definition.title}.jpg`}</p>
          <p className="text-[11px] text-on-surface-variant mt-0.5">
            {draft ? 'La imagen todavía no ha sido guardada' : formatUpdatedAt(asset?.updated_at)}
          </p>
        </div>

        <input
          id={inputId}
          type="file"
          accept="image/jpeg,.jpg,.jpeg"
          className="sr-only"
          onChange={(event) => onSelect(definition.type, event.target.files?.[0], event.target)}
        />

        <div className="flex flex-wrap justify-end gap-2 pt-1">
          {draft && (
            <button type="button" onClick={() => onDiscard(definition.type)} disabled={isSaving} className="h-8 px-3 rounded-md text-xs font-bold text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 transition-colors">
              Descartar
            </button>
          )}
          <label htmlFor={inputId} className="h-8 px-3 rounded-md border border-outline-variant text-xs font-bold text-on-surface cursor-pointer hover:bg-surface-container-high transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]" translate="no">upload</span>
            {preview ? 'Elegir otra' : 'Seleccionar JPG'}
          </label>
          <button type="button" onClick={() => onSave(definition.type)} disabled={!draft || isSaving} className="h-8 px-3 rounded-md bg-primary text-on-primary text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center gap-1.5">
            <span className={`material-symbols-outlined text-[16px] ${isSaving ? 'animate-spin' : ''}`} translate="no">{isSaving ? 'sync' : 'save'}</span>
            {isSaving ? 'Guardando...' : 'Guardar imagen'}
          </button>
        </div>
      </div>
    </article>
  );
};

const TicketAssetsSettingsTab = () => {
  const [assets, setAssets] = useState({ firma: null, sello: null });
  const [drafts, setDrafts] = useState({ firma: null, sello: null });
  const [isLoading, setIsLoading] = useState(true);
  const [savingType, setSavingType] = useState(null);

  useEffect(() => {
    let active = true;
    api.get('/config/ticket-assets')
      .then(({ data }) => {
        if (active) setAssets({ firma: data.firma, sello: data.sello });
      })
      .catch((error) => toast.error(error.response?.data?.error || 'No se pudieron cargar la firma y el sello.'))
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, []);

  const handleSelect = (type, file, input) => {
    if (!file) return;
    input.value = '';

    const hasJpegExtension = /\.jpe?g$/i.test(file.name);
    if (file.type !== 'image/jpeg' && !hasJpegExtension) {
      toast.error('Selecciona una imagen en formato JPG.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('La imagen no debe superar los 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDrafts((current) => ({
        ...current,
        [type]: { preview: reader.result, name: file.name }
      }));
    };
    reader.onerror = () => toast.error('No se pudo leer la imagen seleccionada.');
    reader.readAsDataURL(file);
  };

  const handleSave = async (type) => {
    const draft = drafts[type];
    if (!draft) return;

    setSavingType(type);
    try {
      const { data } = await api.put(`/config/ticket-assets/${type}`, { image: draft.preview });
      setAssets((current) => ({ ...current, [type]: data.asset }));
      setDrafts((current) => ({ ...current, [type]: null }));
      toast.success(data.message || 'Imagen actualizada correctamente.');
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo guardar la imagen.');
    } finally {
      setSavingType(null);
    }
  };

  const handleDiscard = (type) => setDrafts((current) => ({ ...current, [type]: null }));

  if (isLoading) {
    return (
      <div className="min-h-64 flex items-center justify-center text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin mr-2" translate="no">sync</span>
        <span className="text-sm">Cargando imágenes del comprobante...</span>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-on-surface">Firma y sello del comprobante</h3>
        <p className="text-sm text-on-surface-variant mt-1">Administra las imágenes que aparecerán en los tickets de pago A5. El cambio se aplicará a los comprobantes que se generen después de guardar.</p>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5" translate="no">info</span>
        <div className="text-xs text-on-surface-variant leading-relaxed">
          <p className="font-bold text-on-surface">Recomendación de imagen</p>
          <p>Usa archivos JPG con fondo blanco, bien recortados y de máximo 2 MB. Para la firma conviene un formato horizontal; para el sello, uno cuadrado.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {ASSETS.map((definition) => (
          <TicketAssetCard
            key={definition.type}
            definition={definition}
            asset={assets[definition.type]}
            draft={drafts[definition.type]}
            isSaving={savingType === definition.type}
            onSelect={handleSelect}
            onSave={handleSave}
            onDiscard={handleDiscard}
          />
        ))}
      </div>
    </section>
  );
};

export default TicketAssetsSettingsTab;
