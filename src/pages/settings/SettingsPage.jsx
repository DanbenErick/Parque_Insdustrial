import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import TenantImportModal from '../tenants/TenantImportModal';
import BulkImportModal from './BulkImportModal';
import CargosSettingsTab from './CargosSettingsTab';
import PeriodosSettingsTab from './PeriodosSettingsTab';
import ImportToolsTab from './components/ImportToolsTab';
import NotificationsSettingsTab from './components/NotificationsSettingsTab';
import ProfileSettingsTab from './components/ProfileSettingsTab';
import SettingsNavigation from './components/SettingsNavigation';

const emptyPasswordForm = { clave_actual: '', clave_nueva: '', clave_confirmar: '' };

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isTenantImportOpen, setIsTenantImportOpen] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [profile, setProfile] = useState({ nombre_razonsocial: '', cargo_representante: '', telefono: '', correo: '' });
  const [notifications, setNotifications] = useState({ pagos: true, facturas: true, socios: false, reportes: true });
  const [tarifas, setTarifas] = useState({ monto_multa_base: 0, monto_instalacion_base: 0, cuenta_bancaria: '', cuenta_yape: '', titular_cuenta: '' });

  useEffect(() => {
    if (user) {
      setProfile({
        nombre_razonsocial: user.nombre_razonsocial || '',
        cargo_representante: user.cargo_representante || '',
        telefono: user.telefono || '',
        correo: user.correo || ''
      });
      api.get('/auth/me').then((response) => {
        const fullUser = response.data.usuario || response.data;
        setProfile((current) => ({
          nombre_razonsocial: fullUser.nombre_razonsocial || current.nombre_razonsocial,
          cargo_representante: fullUser.cargo_representante || current.cargo_representante,
          telefono: fullUser.telefono || current.telefono,
          correo: fullUser.correo || current.correo
        }));
      }).catch(() => {});
    }

    const savedPreferences = localStorage.getItem('luz_prefs');
    if (savedPreferences) {
      const parsedPreferences = JSON.parse(savedPreferences);
      if (parsedPreferences.notifications) setNotifications(parsedPreferences.notifications);
    }

    api.get('/config').then((response) => {
      setTarifas({
        monto_multa_base: response.data.monto_multa_base || 0,
        monto_instalacion_base: response.data.monto_instalacion_base || 0,
        cuenta_bancaria: response.data.cuenta_bancaria || '',
        cuenta_yape: response.data.cuenta_yape || '',
        titular_cuenta: response.data.titular_cuenta || ''
      });
    }).catch(() => {});
  }, [user]);

  const handleProfileChange = ({ target: { name, value } }) => setProfile((current) => ({ ...current, [name]: value }));
  const handleAccountChange = ({ target: { name, value } }) => setTarifas((current) => ({ ...current, [name]: value }));
  const handlePasswordInputChange = ({ target: { name, value } }) => setPasswordForm((current) => ({ ...current, [name]: value }));

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    if (!passwordForm.clave_actual || !passwordForm.clave_nueva || !passwordForm.clave_confirmar) return toast.error('Todos los campos son obligatorios.');
    if (passwordForm.clave_nueva !== passwordForm.clave_confirmar) return toast.error('La nueva contraseña y la confirmación no coinciden.');
    if (passwordForm.clave_nueva.length < 6) return toast.error('La nueva contraseña debe tener al menos 6 caracteres.');

    setIsChangingPassword(true);
    try {
      await api.put('/auth/change-password', { clave_actual: passwordForm.clave_actual, clave_nueva: passwordForm.clave_nueva });
      toast.success('Contraseña actualizada correctamente.');
      setPasswordForm(emptyPasswordForm);
      setShowPasswordForm(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Ocurrió un error al cambiar la contraseña');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveAccount = async () => {
    setIsSavingAccount(true);
    try {
      await api.put('/config', tarifas);
      toast.success('Cuenta bancaria actualizada correctamente');
      setIsEditingAccount(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar la cuenta bancaria');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeTab === 'profile') {
        if (!profile.nombre_razonsocial?.trim() || !profile.cargo_representante?.trim() || !profile.telefono?.trim() || !profile.correo?.trim()) return toast.error('Todos los campos del perfil son obligatorios.');
        if (!/^9\d{8}$/.test(profile.telefono)) return toast.error('El teléfono debe tener 9 dígitos y empezar con el número 9.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.correo)) return toast.error('Ingrese un correo electrónico válido.');
        if (!user?.id) throw new Error('No se pudo identificar al usuario actual.');
        await api.put(`/usuarios/${user.id}`, profile);
        await api.put('/config', { ...tarifas });
        toast.success('Perfil y configuración actualizados correctamente');
      } else if (activeTab === 'tarifas') {
        await api.put('/config', tarifas);
        toast.success('Tarifas globales guardadas exitosamente');
      } else {
        localStorage.setItem('luz_prefs', JSON.stringify({ notifications }));
        toast.custom((toastId) => (
          <div className="bg-surface border border-outline-variant rounded-xl shadow-lg p-3.5 flex items-center gap-3.5 w-full min-w-[300px]">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0"><span className="material-symbols-outlined" translate="no">task_alt</span></div>
            <div className="flex-1"><h4 className="text-sm font-bold text-on-surface leading-tight mb-0.5">Preferencias Guardadas</h4><p className="text-[11px] text-on-surface-variant leading-tight">Tu configuración local ha sido actualizada correctamente.</p></div>
            <button type="button" onClick={() => toast.dismiss(toastId)} className="w-6 h-6 rounded-md hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors shrink-0" aria-label="Cerrar mensaje"><span className="material-symbols-outlined text-[14px]" translate="no">close</span></button>
          </div>
        ));
      }
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || 'Ocurrió un error al guardar los cambios');
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
              <div><h2 className="text-2xl text-primary font-bold leading-tight">Configuración del Sistema</h2><p className="text-sm text-on-surface-variant">Gestiona tus preferencias, perfil y notificaciones.</p></div>
              <button type="button" onClick={handleSave} disabled={isSaving} className={`px-4 py-1.5 h-8 text-xs bg-primary text-on-primary font-bold rounded-md shadow-sm transition-all flex items-center gap-1.5 ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 active:scale-95'}`}>
                {isSaving && <span className="material-symbols-outlined animate-spin text-[16px]" translate="no">sync</span>}
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <SettingsNavigation activeTab={activeTab} onSelect={setActiveTab} />
              <div className="flex-grow bg-surface border border-outline-variant rounded-lg shadow-sm p-4 md:p-6 min-h-[500px]">
                {activeTab === 'profile' && (
                  <ProfileSettingsTab user={user} profile={profile} onProfileChange={handleProfileChange} account={tarifas} onAccountChange={handleAccountChange} isEditingAccount={isEditingAccount} setIsEditingAccount={setIsEditingAccount} isSavingAccount={isSavingAccount} onSaveAccount={handleSaveAccount} showPasswordForm={showPasswordForm} setShowPasswordForm={setShowPasswordForm} passwordForm={passwordForm} setPasswordForm={setPasswordForm} onPasswordChange={handlePasswordInputChange} onPasswordSave={handlePasswordSave} isChangingPassword={isChangingPassword} />
                )}
                {activeTab === 'notifications' && <NotificationsSettingsTab notifications={notifications} onToggle={(key) => setNotifications((current) => ({ ...current, [key]: !current[key] }))} />}
                {activeTab === 'tarifas' && <CargosSettingsTab />}
                {activeTab === 'periodos' && <PeriodosSettingsTab />}
                {activeTab === 'herramientas' && <ImportToolsTab onOpenTenantImport={() => setIsTenantImportOpen(true)} onOpenBillingImport={() => setIsBulkImportOpen(true)} />}
              </div>
            </div>
          </div>
        </div>
      </main>
      <BulkImportModal isOpen={isBulkImportOpen} onClose={() => setIsBulkImportOpen(false)} onImportSuccess={() => toast.success('Datos importados. Revisa las secciones de Lecturas, Facturación y Pagos.')} />
      {isTenantImportOpen && <TenantImportModal onClose={() => setIsTenantImportOpen(false)} onImportSuccess={() => {}} />}
    </>
  );
};

export default Settings;
