import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import PeriodosSettingsTab from './PeriodosSettingsTab';

const Settings = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Estados para cambio de contraseña
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    clave_actual: '',
    clave_nueva: '',
    clave_confirmar: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Estados para el perfil
  const [profile, setProfile] = useState({
    nombre_razonsocial: '',
    cargo_representante: '',
    telefono: '',
    correo: ''
  });

  // Estados para notificaciones
  const [notifications, setNotifications] = useState({
    pagos: true,
    facturas: true,
    miembros: false,
    reportes: true
  });

  // Estados para tarifas base
  const [tarifas, setTarifas] = useState({
    monto_multa_base: 0,
    monto_instalacion_base: 0
  });

  // Cargar datos del usuario y configuración global
  useEffect(() => {
    if (user) {
      setProfile({
        nombre_razonsocial: user.nombre_razonsocial || '',
        cargo_representante: user.cargo_representante || '',
        telefono: user.telefono || '',
        correo: user.correo || ''
      });
    }

    // Cargar preferencias locales
    const savedPrefs = localStorage.getItem('luz_prefs');
    if (savedPrefs) {
      const parsed = JSON.parse(savedPrefs);
      if (parsed.notifications) setNotifications(parsed.notifications);
    }
    
    // Cargar configuraciones globales
    api.get('/config').then(res => {
      setTarifas({
        monto_multa_base: res.data.monto_multa_base || 0,
        monto_instalacion_base: res.data.monto_instalacion_base || 0
      });
    }).catch(err => console.error("Error cargando configuración", err));
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!passwordForm.clave_actual || !passwordForm.clave_nueva || !passwordForm.clave_confirmar) {
      return toast.error('Todos los campos son obligatorios.');
    }
    if (passwordForm.clave_nueva !== passwordForm.clave_confirmar) {
      return toast.error('La nueva contraseña y la confirmación no coinciden.');
    }
    if (passwordForm.clave_nueva.length < 6) {
      return toast.error('La nueva contraseña debe tener al menos 6 caracteres.');
    }

    setIsChangingPassword(true);
    try {
      await api.put('/auth/change-password', {
        clave_actual: passwordForm.clave_actual,
        clave_nueva: passwordForm.clave_nueva
      });
      toast.success('Contraseña actualizada correctamente.');
      setPasswordForm({ clave_actual: '', clave_nueva: '', clave_confirmar: '' });
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      toast.error(error.response?.data?.error || 'Ocurrió un error al cambiar la contraseña');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      if (activeTab === 'profile') {
        if (!user || !user.id) {
          throw new Error('No se pudo identificar al usuario actual.');
        }
        await api.put(`/usuarios/${user.id}`, profile);
        toast.success('Perfil actualizado correctamente');
      } else if (activeTab === 'tarifas') {
        await api.put('/config', tarifas);
        toast.success('Tarifas globales guardadas exitosamente');
      } else {
        // Guardar preferencias en localStorage
        localStorage.setItem('luz_prefs', JSON.stringify({
          notifications
        }));
        toast.success('Preferencias guardadas correctamente');
      }
    } catch (error) {
      console.error('Error guardando configuración:', error);
      toast.error(error.response?.data?.error || 'Ocurrió un error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex-grow flex flex-col relative overflow-hidden bg-background">
      <div className="flex-grow overflow-y-auto p-xl custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-lg">
          
          <div className="flex justify-between items-center mb-lg">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary font-bold">Configuración del Sistema</h2>
              <p className="font-body-md text-on-surface-variant">Gestiona tus preferencias, perfil y notificaciones.</p>
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`px-lg py-2 bg-primary text-on-primary font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 active:scale-95'}`}
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
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
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-md px-md py-sm rounded-lg transition-colors text-left ${activeTab === 'notifications' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                Notificaciones
              </button>
              <button 
                onClick={() => setActiveTab('periodos')}
                className={`w-full flex items-center gap-md px-md py-sm rounded-lg transition-colors text-left ${activeTab === 'periodos' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                Periodos de Facturación
              </button>
              <button 
                onClick={() => setActiveTab('tarifas')}
                className={`w-full flex items-center gap-md px-md py-sm rounded-lg transition-colors text-left ${activeTab === 'tarifas' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                <span className="material-symbols-outlined text-[20px]">request_quote</span>
                Tarifas y Cobros
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
                      <h3 className="font-headline-sm font-bold text-on-surface">{user?.nombre_razonsocial || 'Administrador'}</h3>
                      <p className="text-on-surface-variant text-sm">{user?.correo || 'admin@jicamarca.com'}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-surface-container-high rounded text-xs font-bold text-on-surface-variant">
                        Rol: {user?.nombre_rol || 'Admin'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nombre / Razón Social</label>
                      <input 
                        type="text" 
                        name="nombre_razonsocial"
                        value={profile.nombre_razonsocial}
                        onChange={handleProfileChange}
                        className="w-full bg-surface-container border border-outline-variant rounded p-3 text-sm focus:border-primary outline-none transition-colors" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Cargo Representante</label>
                      <input 
                        type="text" 
                        name="cargo_representante"
                        value={profile.cargo_representante}
                        onChange={handleProfileChange}
                        className="w-full bg-surface-container border border-outline-variant rounded p-3 text-sm focus:border-primary outline-none transition-colors" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Teléfono de Contacto</label>
                      <input 
                        type="tel" 
                        name="telefono"
                        value={profile.telefono}
                        onChange={handleProfileChange}
                        className="w-full bg-surface-container border border-outline-variant rounded p-3 text-sm focus:border-primary outline-none transition-colors" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Correo Electrónico</label>
                      <input 
                        type="email" 
                        name="correo"
                        value={profile.correo}
                        onChange={handleProfileChange}
                        className="w-full bg-surface-container border border-outline-variant rounded p-3 text-sm focus:border-primary outline-none transition-colors" 
                      />
                    </div>
                  </div>

                  <div className="pt-md border-t border-outline-variant/30 mt-lg">
                    <h4 className="font-headline-sm text-[16px] text-on-surface font-bold mb-xs">Seguridad</h4>
                    
                    {!showPasswordForm ? (
                      <div>
                        <p className="text-sm text-on-surface-variant mb-sm">
                          Para proteger tu cuenta, te recomendamos usar una contraseña segura. El cambio afectará únicamente a tu sesión activa.
                        </p>
                        <button 
                          onClick={() => setShowPasswordForm(true)}
                          className="px-md py-2 border border-primary text-primary hover:bg-primary/5 rounded-lg transition-colors text-sm font-bold active:scale-95 duration-150"
                        >
                          Cambiar Contraseña
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handlePasswordSave} className="space-y-md max-w-md bg-surface-container-low p-md border border-outline-variant rounded-xl mt-sm animate-in slide-in-from-top-2 duration-200">
                        <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30 mb-sm">
                          <span className="text-sm font-bold text-on-surface flex items-center gap-xs">
                            <span className="material-symbols-outlined text-[18px] text-primary">key</span>
                            Actualizar Contraseña
                          </span>
                          <button 
                            type="button" 
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPasswordForm({ clave_actual: '', clave_nueva: '', clave_confirmar: '' });
                            }}
                            className="p-1 hover:bg-surface-container-highest rounded text-on-surface-variant"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                        
                        <div className="space-y-sm">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Contraseña Actual</label>
                            <input 
                              required
                              type="password" 
                              name="clave_actual" 
                              value={passwordForm.clave_actual} 
                              onChange={handlePasswordInputChange}
                              placeholder="••••••••" 
                              className="w-full bg-white border border-outline-variant rounded px-md py-2 text-sm focus:border-primary outline-none" 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nueva Contraseña</label>
                            <input 
                              required
                              type="password" 
                              name="clave_nueva" 
                              value={passwordForm.clave_nueva} 
                              onChange={handlePasswordInputChange}
                              placeholder="Mínimo 6 caracteres" 
                              className="w-full bg-white border border-outline-variant rounded px-md py-2 text-sm focus:border-primary outline-none" 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Confirmar Nueva Contraseña</label>
                            <input 
                              required
                              type="password" 
                              name="clave_confirmar" 
                              value={passwordForm.clave_confirmar} 
                              onChange={handlePasswordInputChange}
                              placeholder="Repite la contraseña" 
                              className="w-full bg-white border border-outline-variant rounded px-md py-2 text-sm focus:border-primary outline-none" 
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-sm pt-xs">
                          <button 
                            type="button" 
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPasswordForm({ clave_actual: '', clave_nueva: '', clave_confirmar: '' });
                            }}
                            className="px-md py-1.5 border border-outline text-on-surface text-xs font-bold rounded hover:bg-surface transition-colors"
                          >
                            Cancelar
                          </button>
                          <button 
                            type="submit" 
                            disabled={isChangingPassword}
                            className="px-md py-1.5 bg-primary text-on-primary text-xs font-bold rounded shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-xs"
                          >
                            {isChangingPassword ? 'Guardando...' : 'Guardar Clave'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="animate-in fade-in space-y-xl">
                  <div>
                    <h3 className="font-headline-sm font-bold text-on-surface mb-xs">Avisos y Notificaciones</h3>
                    <p className="text-sm text-on-surface-variant mb-lg">Elige qué alertas deseas recibir localmente en la plataforma.</p>
                  </div>

                  <div className="space-y-0 divide-y divide-outline-variant border border-outline-variant rounded-lg">
                    <div className="p-md flex items-center justify-between hover:bg-surface-container-lowest" onClick={() => toggleNotification('pagos')}>
                      <div>
                        <p className="font-bold text-on-surface text-sm">Vencimiento de Pagos</p>
                        <p className="text-xs text-on-surface-variant mt-1">Mostrar alertas cuando un miembro tenga retraso.</p>
                      </div>
                      <div className={`w-10 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${notifications.pagos ? 'bg-primary' : 'bg-surface-container-high'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${notifications.pagos ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    </div>
                    
                    <div className="p-md flex items-center justify-between hover:bg-surface-container-lowest" onClick={() => toggleNotification('facturas')}>
                      <div>
                        <p className="font-bold text-on-surface text-sm">Generación de Facturas Exitosas</p>
                        <p className="text-xs text-on-surface-variant mt-1">Alerta al culminar el procesamiento masivo a fin de mes.</p>
                      </div>
                      <div className={`w-10 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${notifications.facturas ? 'bg-primary' : 'bg-surface-container-high'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${notifications.facturas ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    </div>

                    <div className="p-md flex items-center justify-between hover:bg-surface-container-lowest" onClick={() => toggleNotification('miembros')}>
                      <div>
                        <p className="font-bold text-on-surface text-sm">Nuevos Miembros Registrados</p>
                        <p className="text-xs text-on-surface-variant mt-1">Notificar cuando un operador registre una nueva empresa.</p>
                      </div>
                      <div className={`w-10 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${notifications.miembros ? 'bg-primary' : 'bg-surface-container-high'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${notifications.miembros ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    </div>

                    <div className="p-md flex items-center justify-between hover:bg-surface-container-lowest" onClick={() => toggleNotification('reportes')}>
                      <div>
                        <p className="font-bold text-on-surface text-sm">Reporte Semanal Automatizado</p>
                        <p className="text-xs text-on-surface-variant mt-1">Mostrar un resumen estadístico de consumos en el panel.</p>
                      </div>
                      <div className={`w-10 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${notifications.reportes ? 'bg-primary' : 'bg-surface-container-high'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${notifications.reportes ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tarifas' && (
                <div className="animate-in fade-in space-y-xl">
                  <div>
                    <h3 className="font-headline-sm font-bold text-on-surface mb-xs">Tarifas y Cobros Especiales</h3>
                    <p className="text-sm text-on-surface-variant mb-lg">Ajusta los montos base automáticos que se cobrarán por defectos o infracciones.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                    <div className="bg-surface-container-low border border-outline-variant rounded-xl p-lg flex flex-col gap-4 shadow-sm">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[24px]">build</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface text-lg">Costo de Instalación de Medidor</h4>
                        <p className="text-sm text-on-surface-variant mt-1">
                          Este monto se aplicará <strong>automáticamente</strong> al recibo de un cliente la primera vez que se registre en el sistema.
                        </p>
                      </div>
                      <div className="relative mt-2">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">S/</span>
                        <input 
                          type="number" step="0.01" min="0"
                          value={tarifas.monto_instalacion_base}
                          onChange={(e) => setTarifas({...tarifas, monto_instalacion_base: e.target.value})}
                          className="w-full bg-white border-2 border-primary/20 rounded-xl pl-10 pr-4 py-3 text-xl font-data-mono font-bold text-primary focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="bg-surface-container-low border border-outline-variant rounded-xl p-lg flex flex-col gap-4 shadow-sm">
                      <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center text-error">
                        <span className="material-symbols-outlined text-[24px]">gavel</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface text-lg">Multa Estándar por Infracción</h4>
                        <p className="text-sm text-on-surface-variant mt-1">
                          Este monto aparecerá como "Multa Estándar" para que puedas aplicarlo rápidamente con un clic al editar un recibo.
                        </p>
                      </div>
                      <div className="relative mt-2">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">S/</span>
                        <input 
                          type="number" step="0.01" min="0"
                          value={tarifas.monto_multa_base}
                          onChange={(e) => setTarifas({...tarifas, monto_multa_base: e.target.value})}
                          className="w-full bg-white border-2 border-error/20 rounded-xl pl-10 pr-4 py-3 text-xl font-data-mono font-bold text-error focus:border-error focus:ring-4 focus:ring-error/10 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'periodos' && (
                <PeriodosSettingsTab />
              )}

            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Settings;
