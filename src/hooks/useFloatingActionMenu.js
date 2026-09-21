import { useCallback, useEffect, useState } from 'react';

export const useFloatingActionMenu = ({ menuHeight = 240, viewportMargin = 12 } = {}) => {
  const [actionMenu, setActionMenu] = useState(null);

  const closeActionMenu = useCallback(() => setActionMenu(null), []);

  const openActionMenu = useCallback((event, payload, key) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const openUp = window.innerHeight - rect.bottom < menuHeight && rect.top > menuHeight;

    setActionMenu((current) => {
      if (current?.key === key) return null;
      return {
        ...payload,
        key,
        top: openUp ? undefined : rect.bottom + 4,
        bottom: openUp ? window.innerHeight - rect.top + 4 : undefined,
        right: Math.max(viewportMargin, window.innerWidth - rect.right),
      };
    });
  }, [menuHeight, viewportMargin]);

  useEffect(() => {
    if (!actionMenu) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeActionMenu();
    };
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', closeActionMenu, true);
    window.addEventListener('resize', closeActionMenu);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', closeActionMenu, true);
      window.removeEventListener('resize', closeActionMenu);
    };
  }, [actionMenu, closeActionMenu]);

  return { actionMenu, setActionMenu, openActionMenu, closeActionMenu };
};
