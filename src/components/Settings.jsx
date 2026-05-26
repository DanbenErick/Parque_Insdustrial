import React, { useState } from 'react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <main className="flex-grow flex flex-col relative overflow-hidden bg-background">
      <div className="flex-grow overflow-y-auto p-xl">
        <div className="max-w-6xl mx-auto space-y-lg">
          
          <div className="flex justify-between items-center mb-lg">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary font-bold">Configuración del Sistema</h2>
              <p className="font-body-md text-on-surface-variant">Gestiona tus preferencias, perfil y notificaciones.</p>
            </div>
            <button className="px-lg py-2 bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity">
              Guardar Cambios
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-lg">
            {/* Sidebar nav for settings */}
            <div className="w-full md:w-64 space-y-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-md px-md py-sm rounded-lg transition-colors text-left ${activeTab === 'profile' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                <span className="material-symbols-outlined text-[20px]">person</span>
                Perfil de Usuario
              </button>
              <button 
                onClick={() => setActiveTab('system')}
                className={`w-full flex items-center gap-md px-md py-sm rounded-lg transition-colors text-left ${activeTab === 'system' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                <span className="material-symbols-outlined text-[20px]">tune</span>
                Preferencias del Sistema
              </button>
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-md px-md py-sm rounded-lg transition-colors text-left ${activeTab === 'notifications' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                Notificaciones
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-grow bg-surface border border-outline-variant rounded-xl shadow-sm p-xl min-h-[500px]">
              
              {activeTab === 'profile' && (
                <div className="animate-in fade-in space-y-xl">
                  <div className="flex items-center gap-lg border-b border-outline-variant pb-lg">
                    <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container relative group cursor-pointer overflow-hidden">
                      <span className="material-symbols-outlined text-[40px]">account_circle</span>
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-white">photo_camera</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-headline-sm font-bold text-on-surface">Administrador Principal</h3>
                      <p className="text-on-surface-variant text-sm">administrador@jicamarca.com</p>
                      <button className="mt-2 text-sm text-primary font-bold hover:underline">Cambiar foto</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nombre Completo</label>
                      <input type="text" className="w-full bg-surface-container border border-outline-variant rounded p-3 text-sm focus:border-primary outline-none" defaultValue="Carlos Mendoza" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Cargo</label>
                      <input type="text" className="w-full bg-surface-container border border-outline-variant rounded p-3 text-sm focus:border-primary outline-none" defaultValue="Gerente de Operaciones" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Teléfono de Contacto</label>
                      <input type="tel" className="w-full bg-surface-container border border-outline-variant rounded p-3 text-sm focus:border-primary outline-none" defaultValue="+51 987 654 321" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Correo Electrónico</label>
                      <input type="email" className="w-full bg-surface-container border border-outline-variant rounded p-3 text-sm focus:border-primary outline-none" defaultValue="administrador@jicamarca.com" />
                    </div>
                  </div>

                  <div className="pt-md">
                    <h4 className="font-bold text-on-surface mb-sm">Seguridad</h4>
                    <button className="px-md py-2 border border-outline-variant text-on-surface rounded hover:bg-surface-container transition-colors text-sm font-bold">
                      Cambiar Contraseña
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'system' && (
                <div className="animate-in fade-in space-y-xl">
                  <div>
                    <h3 className="font-headline-sm font-bold text-on-surface mb-xs">Preferencias de Sistema</h3>
                    <p className="text-sm text-on-surface-variant mb-lg">Personaliza la apariencia y el comportamiento de la plataforma.</p>
                  </div>

                  <div className="space-y-lg">
                    <div className="space-y-sm">
                      <label className="text-sm font-bold text-on-surface">Apariencia (Tema)</label>
                      <div className="flex gap-md">
                        <label className="flex flex-col items-center gap-2 p-md border border-primary bg-primary/5 rounded-lg cursor-pointer">
                          <span className="material-symbols-outlined text-primary text-[32px]">light_mode</span>
                          <span className="text-xs font-bold text-primary">Claro</span>
                        </label>
                        <label className="flex flex-col items-center gap-2 p-md border border-outline-variant hover:bg-surface-container rounded-lg cursor-pointer opacity-70">
                          <span className="material-symbols-outlined text-on-surface text-[32px]">dark_mode</span>
                          <span className="text-xs font-bold text-on-surface">Oscuro</span>
                        </label>
                        <label className="flex flex-col items-center gap-2 p-md border border-outline-variant hover:bg-surface-container rounded-lg cursor-pointer opacity-70">
                          <span className="material-symbols-outlined text-on-surface text-[32px]">settings_suggest</span>
                          <span className="text-xs font-bold text-on-surface">Automático</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-md pt-md border-t border-outline-variant">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Idioma de la Interfaz</label>
                        <select className="w-full bg-surface-container border border-outline-variant rounded p-3 text-sm focus:border-primary outline-none">
                          <option>Español (Perú)</option>
                          <option>Inglés (US)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Zona Horaria</label>
                        <select className="w-full bg-surface-container border border-outline-variant rounded p-3 text-sm focus:border-primary outline-none">
                          <option>(GMT-05:00) Lima</option>
                          <option>(GMT-05:00) Bogotá</option>
                          <option>(GMT-04:00) Santiago</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="animate-in fade-in space-y-xl">
                  <div>
                    <h3 className="font-headline-sm font-bold text-on-surface mb-xs">Avisos y Notificaciones</h3>
                    <p className="text-sm text-on-surface-variant mb-lg">Elige qué alertas deseas recibir en tu correo o en la plataforma.</p>
                  </div>

                  <div className="space-y-0 divide-y divide-outline-variant border border-outline-variant rounded-lg">
                    <div className="p-md flex items-center justify-between hover:bg-surface-container-lowest">
                      <div>
                        <p className="font-bold text-on-surface text-sm">Vencimiento de Pagos</p>
                        <p className="text-xs text-on-surface-variant mt-1">Recibir un correo cuando un inquilino tenga 2 o más días de retraso.</p>
                      </div>
                      <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer shadow-inner">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                      </div>
                    </div>
                    <div className="p-md flex items-center justify-between hover:bg-surface-container-lowest">
                      <div>
                        <p className="font-bold text-on-surface text-sm">Generación de Facturas Exitosas</p>
                        <p className="text-xs text-on-surface-variant mt-1">Alerta al culminar el procesamiento masivo a fin de mes.</p>
                      </div>
                      <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer shadow-inner">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                      </div>
                    </div>
                    <div className="p-md flex items-center justify-between hover:bg-surface-container-lowest">
                      <div>
                        <p className="font-bold text-on-surface text-sm">Nuevos Inquilinos Registrados</p>
                        <p className="text-xs text-on-surface-variant mt-1">Notificar cuando un operador registre una nueva empresa.</p>
                      </div>
                      <div className="w-10 h-6 bg-surface-container-high rounded-full relative cursor-pointer shadow-inner">
                        <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm"></div>
                      </div>
                    </div>
                    <div className="p-md flex items-center justify-between hover:bg-surface-container-lowest">
                      <div>
                        <p className="font-bold text-on-surface text-sm">Reporte Semanal Automatizado</p>
                        <p className="text-xs text-on-surface-variant mt-1">Recibir un resumen estadístico de consumos cada lunes.</p>
                      </div>
                      <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer shadow-inner">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Settings;
