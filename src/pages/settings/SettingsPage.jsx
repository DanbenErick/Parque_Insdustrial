import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import CargosSettingsTab from './CargosSettingsTab';
import PeriodosSettingsTab from './PeriodosSettingsTab';
import ProfileSettingsTab from './components/ProfileSettingsTab';
import SettingsNavigation from './components/SettingsNavigation';


const emptyPasswordForm = { clave_actual: '', clave_nueva: '', clave_confirmar: '' };

const Settings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [profile, setProfile] = useState({ nombre_razonsocial: '', cargo_representante: '', telefono: '', correo: '' });
  const [tarifas, setTarifas] = useState({ monto_multa_base: 0, monto_instalacion_base: 0, cuenta_bancaria: '', cuenta_cci: '', cuenta_yape: '', titular_cuenta: '', auto_email_ticket_pago: true });

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

    api.get('/config').then((response) => {
      setTarifas({
        monto_multa_base: response.data.monto_multa_base || 0,
        monto_instalacion_base: response.data.monto_instalacion_base || 0,
        cuenta_bancaria: response.data.cuenta_bancaria || '',
        cuenta_cci: response.data.cuenta_cci || '',
        cuenta_yape: response.data.cuenta_yape || '',
        titular_cuenta: response.data.titular_cuenta || '',
        auto_email_ticket_pago: response.data.auto_email_ticket_pago === undefined ? true : Boolean(response.data.auto_email_ticket_pago)
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
      await queryClient.invalidateQueries({ queryKey: ['payment-config'] });
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
        await queryClient.invalidateQueries({ queryKey: ['payment-config'] });
        toast.success('Perfil y configuración actualizados correctamente');
      } else if (activeTab === 'tarifas') {
        await api.put('/config', tarifas);
        toast.success('Tarifas globales guardadas exitosamente');
      } else if (activeTab === 'notificaciones') {
        await api.put('/config', tarifas);
        toast.success(tarifas.auto_email_ticket_pago ? 'Envío automático de tickets activado.' : 'Envío automático de tickets desactivado.');
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
              <div><h2 className="text-2xl text-primary font-bold leading-tight">Configuración del Sistema</h2><p className="text-sm text-on-surface-variant">Gestiona tu perfil, facturación, tarifas y notificaciones.</p></div>
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
                {activeTab === 'tarifas' && <CargosSettingsTab />}
                {activeTab === 'periodos' && <PeriodosSettingsTab />}
                {activeTab === 'notificaciones' && (
                  <section className="max-w-3xl space-y-5">
                    <div>
                      <h3 className="text-lg font-bold text-on-surface">Envíos automáticos por correo</h3>
                      <p className="text-sm text-on-surface-variant mt-1">Controla los comprobantes que se envían al correo registrado del socio.</p>
                    </div>
                    <label className="flex items-start gap-3 p-4 rounded-lg border border-outline-variant bg-surface-container-lowest cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(tarifas.auto_email_ticket_pago)}
                        onChange={(event) => setTarifas((current) => ({ ...current, auto_email_ticket_pago: event.target.checked }))}
                        className="mt-1 h-4 w-4 accent-primary"
                      />
                      <span>
                        <span className="block text-sm font-bold text-on-surface">Enviar automáticamente el ticket al registrar un pago</span>
                        <span className="block text-xs text-on-surface-variant mt-1">Al guardar un pago, se enviará al socio un aviso de confirmación con el ticket PDF adjunto. Si no tiene correo registrado o falla el envío, el pago quedará registrado y se mostrará un aviso.</span>
                      </span>
                    </label>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Settings;
