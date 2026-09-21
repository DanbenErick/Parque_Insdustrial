import { useEffect } from 'react';

let lockCount = 0;
let originalBodyOverflow = '';
let originalBodyTouchAction = '';
let originalHtmlOverflow = '';
let originalContainerOverflow = '';
let originalContainerTouchAction = '';

/**
 * useBodyScrollLock
 * Bloquea completamente el desplazamiento de la pantalla de fondo cuando un modal o drawer está abierto.
 * Bloquea document.body, document.documentElement y el contenedor principal #app-main-scroll-container.
 * Soporta modales anidados con un contador de bloqueos.
 */
export const useBodyScrollLock = (isLocked = true) => {
  useEffect(() => {
    if (!isLocked) return;

    if (lockCount === 0) {
      originalBodyOverflow = document.body.style.overflow;
      originalBodyTouchAction = document.body.style.touchAction;
      originalHtmlOverflow = document.documentElement.style.overflow;

      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');

      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.documentElement.style.overflow = 'hidden';

      const mainContainer = document.getElementById('app-main-scroll-container') || document.querySelector('[data-app-scroll="true"]');
      if (mainContainer) {
        originalContainerOverflow = mainContainer.style.overflow;
        originalContainerTouchAction = mainContainer.style.touchAction;
        mainContainer.style.overflow = 'hidden';
        mainContainer.style.touchAction = 'none';
      }
    }

    lockCount++;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');

        document.body.style.overflow = originalBodyOverflow;
        document.body.style.touchAction = originalBodyTouchAction;
        document.documentElement.style.overflow = originalHtmlOverflow;

        const mainContainer = document.getElementById('app-main-scroll-container') || document.querySelector('[data-app-scroll="true"]');
        if (mainContainer) {
          mainContainer.style.overflow = originalContainerOverflow;
          mainContainer.style.touchAction = originalContainerTouchAction;
        }
      }
    };
  }, [isLocked]);
};

export default useBodyScrollLock;
