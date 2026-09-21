import React from 'react';
import FullScreenLoader from './FullScreenLoader';

/**
 * LoadingCurtain - Carga limitada a la sección de contenido actual.
 * Mantiene visibles los elementos persistentes de navegación.
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
  logoSrc = '/logo-192.png',
}) => {
  if (!isOpen) return null;

  return (
    <FullScreenLoader
      title={title}
      subtitle={subtitle}
      badgeText={badgeText}
      logoSrc={logoSrc}
    />
  );
};

export default React.memo(LoadingCurtain);
