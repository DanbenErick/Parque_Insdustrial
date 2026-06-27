import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosConfig';
import PeriodosSettingsTab from './PeriodosSettingsTab';
import CargosSettingsTab from './CargosSettingsTab';
import BulkImportModal from './BulkImportModal';
import TenantImportModal from '../tenants/TenantImportModal';

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
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isTenantImportOpen, setIsTenantImportOpen] = useState(false);

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
    socios: false,
    reportes: true
  });

  // Estados para tarifas base
  const [tarifas, setTarifas] = useState({
    monto_multa_base: 0,
    monto_instalacion_base: 0,
    cuenta_bancaria: ''
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
        monto_instalacion_base: res.data.monto_instalacion_base || 0,
        cuenta_bancaria: res.data.cuenta_bancaria || ''
      });
    }).catch(() => { /* Config load failed silently */ });
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
        if (!profile.nombre_razonsocial?.trim() || !profile.cargo_representante?.trim() || !profile.telefono?.trim() || !profile.correo?.trim()) {
          setIsSaving(false);
          return toast.error('Todos los campos del perfil son obligatorios.');
        }

        const phoneRegex = /^9\d{8}$/;
        if (!phoneRegex.test(profile.telefono)) {
          setIsSaving(false);
          return toast.error('El teléfono debe tener 9 dígitos y empezar con el número 9.');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profile.correo)) {
          setIsSaving(false);
          return toast.error('Ingrese un correo electrónico válido.');
        }

        if (!user || !user.id) {
          throw new Error('No se pudo identificar al usuario actual.');
        }
        await api.put(`/usuarios/${user.id}`, profile);
        await api.put('/config', { ...tarifas }); // Guardar cuenta bancaria
        toast.success('Perfil y configuración actualizados correctamente');
      } else if (activeTab === 'tarifas') {
        await api.put('/config', tarifas);
        toast.success('Tarifas globales guardadas exitosamente');
      } else {
        // Guardar preferencias en localStorage
        localStorage.setItem('luz_prefs', JSON.stringify({
          notifications
        }));
        
        toast.custom((t) => (
          <div className="bg-surface border border-outline-variant rounded-xl shadow-lg p-3.5 flex items-center gap-3.5 w-full min-w-[300px]">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
              <span className="material-symbols-outlined">task_alt</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-on-surface leading-tight mb-0.5">Preferencias Guardadas</h4>
              <p className="text-[11px] text-on-surface-variant leading-tight">Tu configuración local ha sido actualizada correctamente.</p>
            </div>
            <button onClick={() => toast.dismiss(t)} className="w-6 h-6 rounded-md hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors shrink-0">
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        ));
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Ocurrió un error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
    <main className="flex-grow flex flex-col relative overflow-hidden bg-background">
      <div className="flex-grow overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-4">
          
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl text-primary font-bold leading-tight">Configuración del Sistema</h2>
              <p className="text-sm text-on-surface-variant">Gestiona tus preferencias, perfil y notificaciones.</p>
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`px-4 py-1.5 h-8 text-xs bg-primary text-on-primary font-bold rounded-md shadow-sm transition-all flex items-center gap-1.5 ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 active:scale-95'}`}
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Sidebar nav for settings */}
            <div className="w-full md:w-72 space-y-1">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-left text-xs ${activeTab === 'profile' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                <span className="material-symbols-outlined text-[16px]">person</span>
                Perfil de Usuario
              </button>
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-left text-xs ${activeTab === 'notifications' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                Notificaciones
              </button>
              <button 
                onClick={() => setActiveTab('periodos')}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-left text-xs ${activeTab === 'periodos' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                Periodos de Facturación
              </button>
              <button 
                onClick={() => setActiveTab('tarifas')}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-left text-xs ${activeTab === 'tarifas' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                <span className="material-symbols-outlined text-[16px]">request_quote</span>
                Tarifas y Cobros
              </button>

              <div className="my-2 border-t border-outline-variant/30" />
              <p className="text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-widest px-3 mb-1">Herramientas</p>
              <button 
                onClick={() => setActiveTab('herramientas')}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-left text-xs ${activeTab === 'herramientas' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                <span className="material-symbols-outlined text-[16px]">build</span>
                Importar Datos
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-grow bg-surface border border-outline-variant rounded-lg shadow-sm p-4 md:p-6 min-h-[500px]">
              
              {activeTab === 'profile' && (
                <div className="animate-in fade-in space-y-6">
                  <div className="flex items-center gap-4 border-b border-outline-variant pb-4">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-sm">
                      <span className="material-symbols-outlined text-[32px]">account_circle</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-on-surface">{user?.nombre_razonsocial || 'Administrador'}</h3>
                      <p className="text-on-surface-variant text-[11px]">{user?.correo || 'admin@jicamarca.com'}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 bg-surface-container-high rounded text-[10px] font-bold text-on-surface-variant">
                        Rol: {user?.nombre_rol || 'Admin'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Nombre / Razón Social</label>
                      <input 
                        type="text" 
                        name="nombre_razonsocial"
                        value={profile.nombre_razonsocial}
                        onChange={handleProfileChange}
                        className="w-full bg-surface-container-lowest border border-outline-variant/50 hover:border-primary/50 focus:border-primary rounded-lg px-3 py-1.5 text-xs h-8 outline-none transition-colors shadow-sm" 
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Cargo Representante</label>
                      <input 
                        type="text" 
                        name="cargo_representante"
                        value={profile.cargo_representante}
                        onChange={handleProfileChange}
                        className="w-full bg-surface-container-lowest border border-outline-variant/50 hover:border-primary/50 focus:border-primary rounded-lg px-3 py-1.5 text-xs h-8 outline-none transition-colors shadow-sm" 
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Teléfono de Contacto</label>
                      <input 
                        type="tel" 
                        name="telefono"
                        maxLength="9"
                        value={profile.telefono}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 9) {
                            handleProfileChange({ target: { name: 'telefono', value: val } });
                          }
                        }}
                        className="w-full bg-surface-container-lowest border border-outline-variant/50 hover:border-primary/50 focus:border-primary rounded-lg px-3 py-1.5 text-xs h-8 outline-none transition-colors shadow-sm" 
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Correo Electrónico</label>
                      <input 
                        type="email" 
                        name="correo"
                        value={profile.correo}
                        onChange={handleProfileChange}
                        className="w-full bg-surface-container-lowest border border-outline-variant/50 hover:border-primary/50 focus:border-primary rounded-lg px-3 py-1.5 text-xs h-8 outline-none transition-colors shadow-sm" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-outline-variant/30 mt-6">
                    <h4 className="text-sm text-on-surface font-bold mb-2">Datos para Recibos</h4>
                    <div className="space-y-0.5 max-w-md">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Cuenta Bancaria Principal (Se mostrará en los recibos)</label>
                      <input 
                        type="text" 
                        name="cuenta_bancaria"
                        placeholder="Ej. BCP: 191-12345678-0-12 (Opcional)"
                        value={tarifas.cuenta_bancaria}
                        onChange={(e) => setTarifas(prev => ({ ...prev, cuenta_bancaria: e.target.value }))}
                        className="w-full bg-surface-container-lowest border border-outline-variant/50 hover:border-primary/50 focus:border-primary rounded-lg px-3 py-1.5 text-xs h-8 outline-none transition-colors shadow-sm" 
                      />
                      <p className="text-[10px] text-on-surface-variant mt-1">Este número de cuenta aparecerá en la parte inferior de los recibos en PDF generados.</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-outline-variant/30 mt-6">
                    <h4 className="text-sm text-on-surface font-bold mb-2">Seguridad</h4>
                    
                    {!showPasswordForm ? (
                      <div>
                        <p className="text-xs text-on-surface-variant mb-3">
                          Para proteger tu cuenta, te recomendamos usar una contraseña segura. El cambio afectará únicamente a tu sesión activa.
                        </p>
                        <button 
                          onClick={() => setShowPasswordForm(true)}
                          className="px-3 py-1.5 h-8 border border-primary text-primary hover:bg-primary/5 rounded-md transition-colors text-xs font-bold active:scale-95 duration-150"
                        >
                          Cambiar Contraseña
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handlePasswordSave} className="space-y-3 max-w-md bg-surface-container-low p-4 border border-outline-variant rounded-lg mt-2 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30 mb-2">
                          <span className="text-xs font-bold text-on-surface flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px] text-primary">key</span>
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
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="space-y-0.5">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Contraseña Actual</label>
                            <input 
                              required
                              type="password" 
                              name="clave_actual" 
                              value={passwordForm.clave_actual} 
                              onChange={handlePasswordInputChange}
                              placeholder="••••••••" 
                              className="w-full bg-surface-container-lowest border border-outline-variant/50 hover:border-primary/50 focus:border-primary rounded-lg px-3 py-1.5 h-8 text-xs outline-none transition-colors shadow-sm" 
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Nueva Contraseña</label>
                            <input 
                              required
                              type="password" 
                              name="clave_nueva"
                              minLength="6"
                              value={passwordForm.clave_nueva} 
                              onChange={handlePasswordInputChange}
                              placeholder="Mínimo 6 caracteres" 
                              className="w-full bg-surface-container-lowest border border-outline-variant/50 hover:border-primary/50 focus:border-primary rounded-lg px-3 py-1.5 h-8 text-xs outline-none transition-colors shadow-sm" 
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Confirmar Nueva Contraseña</label>
                            <input 
                              required
                              type="password" 
                              name="clave_confirmar" 
                              value={passwordForm.clave_confirmar} 
                              onChange={handlePasswordInputChange}
                              placeholder="Repite la contraseña" 
                              className="w-full bg-surface-container-lowest border border-outline-variant/50 hover:border-primary/50 focus:border-primary rounded-lg px-3 py-1.5 h-8 text-xs outline-none transition-colors shadow-sm" 
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button 
                            type="button" 
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPasswordForm({ clave_actual: '', clave_nueva: '', clave_confirmar: '' });
                            }}
                            className="px-3 py-1.5 border border-outline-variant text-on-surface-variant hover:text-on-surface h-8 text-xs font-bold rounded-lg hover:bg-surface-container-highest transition-colors"
                          >
                            Cancelar
                          </button>
                          <button 
                            type="submit" 
                            disabled={isChangingPassword}
                            className="px-3 py-1.5 bg-primary text-on-primary h-8 text-xs font-bold rounded-md shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1"
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
                <div className="animate-in fade-in space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-on-surface mb-1">Avisos y Notificaciones</h3>
                    <p className="text-[11px] text-on-surface-variant mb-4">Elige qué alertas deseas recibir localmente en la plataforma.</p>
                  </div>

                  <div className="space-y-0 divide-y divide-outline-variant border border-outline-variant rounded-md">
                    <div className="px-4 py-3 flex items-center justify-between hover:bg-surface-container-lowest" onClick={() => toggleNotification('pagos')}>
                      <div>
                        <p className="font-bold text-on-surface text-[11px]">Vencimiento de Pagos</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">Mostrar alertas cuando un socio tenga retraso.</p>
                      </div>
                      <div className={`w-8 h-4 rounded-full relative cursor-pointer shadow-inner transition-colors ${notifications.pagos ? 'bg-primary' : 'bg-surface-container-high'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${notifications.pagos ? 'right-0.5' : 'left-0.5'}`}></div>
                      </div>
                    </div>
                    
                    <div className="px-4 py-3 flex items-center justify-between hover:bg-surface-container-lowest" onClick={() => toggleNotification('facturas')}>
                      <div>
                        <p className="font-bold text-on-surface text-[11px]">Generación de Facturas Exitosas</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">Alerta al culminar el procesamiento masivo a fin de mes.</p>
                      </div>
                      <div className={`w-8 h-4 rounded-full relative cursor-pointer shadow-inner transition-colors ${notifications.facturas ? 'bg-primary' : 'bg-surface-container-high'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${notifications.facturas ? 'right-0.5' : 'left-0.5'}`}></div>
                      </div>
                    </div>

                    <div className="px-4 py-3 flex items-center justify-between hover:bg-surface-container-lowest" onClick={() => toggleNotification('socios')}>
                      <div>
                        <p className="font-bold text-on-surface text-[11px]">Nuevos Socios Registrados</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">Notificar cuando un operador registre una nueva empresa.</p>
                      </div>
                      <div className={`w-8 h-4 rounded-full relative cursor-pointer shadow-inner transition-colors ${notifications.socios ? 'bg-primary' : 'bg-surface-container-high'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${notifications.socios ? 'right-0.5' : 'left-0.5'}`}></div>
                      </div>
                    </div>

                    <div className="px-4 py-3 flex items-center justify-between hover:bg-surface-container-lowest" onClick={() => toggleNotification('reportes')}>
                      <div>
                        <p className="font-bold text-on-surface text-[11px]">Reporte Semanal Automatizado</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">Mostrar un resumen estadístico de consumos en el panel.</p>
                      </div>
                      <div className={`w-8 h-4 rounded-full relative cursor-pointer shadow-inner transition-colors ${notifications.reportes ? 'bg-primary' : 'bg-surface-container-high'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${notifications.reportes ? 'right-0.5' : 'left-0.5'}`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tarifas' && (
                <CargosSettingsTab />
              )}

              {activeTab === 'periodos' && (
                <PeriodosSettingsTab />
              )}

              {activeTab === 'herramientas' && (
                <div className="animate-in fade-in space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-on-surface mb-1">Herramientas de Importación</h3>
                    <p className="text-[11px] text-on-surface-variant mb-6">Carga datos históricos o masivos desde archivos Excel.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tarjeta de Importar Socios */}
                    <div className="bg-surface border border-outline-variant rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-colors flex flex-col">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                      <div className="flex flex-col gap-4 flex-grow ml-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary shadow-inner shrink-0">
                          <span className="material-symbols-outlined text-[24px]">group_add</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-on-surface text-sm mb-1">Importar Socios Masivamente</h4>
                          <p className="text-xs text-on-surface-variant leading-relaxed">Sube un Excel para registrar múltiples socios o inquilinos de una sola vez, junto con sus respectivos medidores si los tuvieran.</p>
                        </div>
                      </div>
                      <div className="mt-5 ml-2">
                        <button
                          onClick={() => setIsTenantImportOpen(true)}
                          className="w-full px-5 py-2.5 bg-surface-container-highest text-on-surface hover:text-primary font-bold text-xs rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary border border-outline-variant transition-all flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[16px]">upload_file</span>
                          Abrir Importador de Socios
                        </button>
                      </div>
                    </div>

                    {/* Tarjeta de Importar Facturación */}
                    <div className="bg-surface border border-outline-variant rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-colors flex flex-col">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                      <div className="flex flex-col gap-4 flex-grow ml-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary shadow-inner shrink-0">
                          <span className="material-symbols-outlined text-[24px]">database_upload</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-on-surface text-sm mb-1">Importar Facturación Masiva</h4>
                          <p className="text-xs text-on-surface-variant leading-relaxed">Herramienta integral para subir lecturas, generar recibos automáticamente y registrar pagos desde un solo archivo Excel.</p>
                        </div>
                      </div>
                      <div className="mt-5 ml-2">
                        <button
                          onClick={() => setIsBulkImportOpen(true)}
                          className="w-full px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[16px]">upload_file</span>
                          Abrir Importador de Facturación
                        </button>
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

    <BulkImportModal
      isOpen={isBulkImportOpen}
      onClose={() => setIsBulkImportOpen(false)}
      onImportSuccess={() => {
        toast.success('Datos importados. Revisa las secciones de Lecturas, Facturación y Pagos.');
      }}
    />

    {isTenantImportOpen && (
      <TenantImportModal
        onClose={() => setIsTenantImportOpen(false)}
        onImportSuccess={() => {
          // No cerramos el modal automáticamente para que el usuario pueda ver el resumen de errores si los hubiera
        }}
      />
    )}
    </>
  );
};

export default Settings;
