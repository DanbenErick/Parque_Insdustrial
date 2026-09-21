import FloatingActionMenu from '../../../components/ui/FloatingActionMenu';

const ReadingActionMenu = ({ menu, onClose, onView, onEdit }) => {
  if (!menu) return null;

  const run = (callback) => {
    onClose();
    callback?.(menu.reading);
  };

  return (
    <FloatingActionMenu menu={menu} onClose={onClose} className="w-52">
      <div className="px-3.5 py-2 mb-1 border-b border-outline-variant/50 bg-surface-container-lowest">
        <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Acciones de lectura</span>
        <span className="block mt-0.5 text-[10px] font-data-mono font-bold text-primary truncate">{menu.medidor.num_serie}</span>
      </div>
      <button type="button" onClick={() => run(onView)} className="w-full px-3.5 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors">
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant" translate="no">visibility</span>
        Ver detalle
      </button>
      <button type="button" onClick={() => run(onEdit)} className="w-full px-3.5 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors">
        <span className="material-symbols-outlined text-[18px] text-primary" translate="no">edit</span>
        Modificar lectura
      </button>
    </FloatingActionMenu>
  );
};

export default ReadingActionMenu;
