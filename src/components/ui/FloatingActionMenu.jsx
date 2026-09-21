import { createPortal } from 'react-dom';

const FloatingActionMenu = ({ menu, onClose, className = 'w-56', children }) => {
  if (!menu) return null;

  return createPortal(
    <div className="dropdown-portal">
      <div
        className="fixed inset-0 z-[80]"
        onClick={onClose}
        onContextMenu={(event) => {
          event.preventDefault();
          onClose();
        }}
      />
      <div
        role="menu"
        style={{
          top: menu.top !== undefined ? `${menu.top}px` : 'auto',
          bottom: menu.bottom !== undefined ? `${menu.bottom}px` : 'auto',
          right: `${menu.right}px`,
        }}
        className={`fixed z-[85] bg-white rounded-xl shadow-2xl border border-outline-variant/80 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${className}`}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default FloatingActionMenu;
