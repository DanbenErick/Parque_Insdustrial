import React from 'react';
import { createPortal } from 'react-dom';
import FullScreenLoader from './FullScreenLoader';

/**
 * LoadingCurtain - Cortina de carga de pantalla completa con el logo institucional
 * del Parque Industrial Jicamarca y diseño glassmorphism prémium.
 *
 * @param {boolean} isOpen - Estado de visibilidad de la cortina
 * @param {string} title - Título principal (ej. "Cargando datos...")
 * @param {string} subtitle - Mensaje secundario (ej. "Obteniendo información del periodo seleccionado")
 * @param {string} badgeText - Texto de insignia institucional
 * @param {string} logoSrc - Ruta al logotipo institucional
 */
const LoadingCurtain = ({
  isOpen = false,
  title = 'Cargando datos...',
  subtitle = 'Obteniendo información del periodo seleccionado',
  badgeText = 'Parque Industrial Jicamarca',
  logoSrc = '/logo.png',
}) => {
  if (!isOpen) return null;

  return createPortal(
    <FullScreenLoader
      title={title}
      subtitle={subtitle}
      badgeText={badgeText}
      logoSrc={logoSrc}
    />,
    document.body,
  );
};

export default React.memo(LoadingCurtain);
