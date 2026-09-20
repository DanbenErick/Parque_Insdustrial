const inputClassName = 'w-full bg-surface-container-lowest border border-outline-variant/50 hover:border-primary/50 focus:border-primary rounded-lg px-3 py-1.5 text-xs h-8 outline-none transition-colors shadow-sm';
const emptyPasswordForm = { clave_actual: '', clave_nueva: '', clave_confirmar: '' };

const ProfileField = ({ label, ...inputProps }) => (
  <div className="space-y-0.5">
    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{label}</label>
    <input {...inputProps} className={inputClassName} />
  </div>
);

const AccountField = ({ label, name, placeholder, value, disabled, onChange, wide = false }) => (
  <div className={`space-y-0.5 ${wide ? 'mt-3 md:mt-0 md:col-span-2' : ''}`}>
    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{label}</label>
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full border rounded-lg px-3 py-1.5 text-xs h-8 outline-none transition-colors shadow-sm ${disabled ? 'bg-surface-container-highest border-transparent text-on-surface-variant cursor-not-allowed' : 'bg-surface-container-lowest border-outline-variant/50 hover:border-primary/50 focus:border-primary'}`}
    />
  </div>
);

const ProfileSettingsTab = ({
  user,
  profile,
  onProfileChange,
  account,
  onAccountChange,
  isEditingAccount,
  setIsEditingAccount,
  isSavingAccount,
  onSaveAccount,
  showPasswordForm,
  setShowPasswordForm,
  passwordForm,
  setPasswordForm,
  onPasswordChange,
  onPasswordSave,
  isChangingPassword
}) => {
  const closePasswordForm = () => {
    setShowPasswordForm(false);
    setPasswordForm(emptyPasswordForm);
  };

  return (
    <div className="animate-in fade-in space-y-6">
      <div className="flex items-center gap-4 border-b border-outline-variant pb-4">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-sm">
          <span className="material-symbols-outlined text-[32px]" translate="no">account_circle</span>
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
        <ProfileField label="Nombre / Razón Social" type="text" name="nombre_razonsocial" value={profile.nombre_razonsocial} onChange={onProfileChange} />
        <ProfileField label="Cargo Representante" type="text" name="cargo_representante" value={profile.cargo_representante} onChange={onProfileChange} />
        <ProfileField
          label="Teléfono de Contacto"
          type="tel"
          name="telefono"
          maxLength="9"
          value={profile.telefono}
          onChange={(event) => {
            const value = event.target.value.replace(/\D/g, '');
            if (value.length <= 9) onProfileChange({ target: { name: 'telefono', value } });
          }}
        />
        <ProfileField label="Correo Electrónico" type="email" name="correo" value={profile.correo} onChange={onProfileChange} />
      </div>

      <section className="pt-4 border-t border-outline-variant/30 mt-6">
        <h4 className="text-sm text-on-surface font-bold mb-2">Datos para Recibos y App Móvil</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <AccountField label="Cuenta Bancaria Principal (BCP)" name="cuenta_bancaria" placeholder="Ej. BCP: 191-12345678-0-12" value={account.cuenta_bancaria} onChange={onAccountChange} disabled={!isEditingAccount} />
          <AccountField label="Número de Yape / Plin" name="cuenta_yape" placeholder="Ej. 999 888 777" value={account.cuenta_yape} onChange={onAccountChange} disabled={!isEditingAccount} />
          <AccountField label="Nombre del Titular de las Cuentas" name="titular_cuenta" placeholder="Ej. Parque Industrial Jicamarca" value={account.titular_cuenta} onChange={onAccountChange} disabled={!isEditingAccount} wide />
        </div>

        <div className="mt-3 flex justify-start">
          {!isEditingAccount ? (
            <button type="button" onClick={() => setIsEditingAccount(true)} className="px-3 py-1.5 h-8 border border-outline-variant text-on-surface hover:text-primary hover:border-primary hover:bg-primary/5 rounded-md transition-colors text-xs font-bold active:scale-95 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]" translate="no">edit</span>
              Editar Cuentas
            </button>
          ) : (
            <div className="flex gap-1">
              <button type="button" onClick={() => setIsEditingAccount(false)} className="px-2 h-8 border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-md transition-colors flex items-center justify-center active:scale-95" title="Cancelar">
                <span className="material-symbols-outlined text-[16px]" translate="no">close</span>
              </button>
              <button type="button" onClick={onSaveAccount} disabled={isSavingAccount} className={`px-3 py-1.5 h-8 bg-primary text-on-primary rounded-md shadow-sm transition-all text-xs font-bold flex items-center gap-1 ${isSavingAccount ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 active:scale-95'}`}>
                <span className={`material-symbols-outlined text-[16px] ${isSavingAccount ? 'animate-spin' : ''}`} translate="no">{isSavingAccount ? 'sync' : 'save'}</span>
                Guardar Cuentas
              </button>
            </div>
          )}
        </div>
        <p className="text-[10px] text-on-surface-variant mt-2">Estas cuentas aparecerán en los recibos en PDF y en la App Móvil de los usuarios.</p>
      </section>

      <section className="pt-4 border-t border-outline-variant/30 mt-6">
        <h4 className="text-sm text-on-surface font-bold mb-2">Seguridad</h4>
        {!showPasswordForm ? (
          <div>
            <p className="text-xs text-on-surface-variant mb-3">Para proteger tu cuenta, te recomendamos usar una contraseña segura. El cambio afectará únicamente a tu sesión activa.</p>
            <button type="button" onClick={() => setShowPasswordForm(true)} className="px-3 py-1.5 h-8 border border-primary text-primary hover:bg-primary/5 rounded-md transition-colors text-xs font-bold active:scale-95 duration-150">Cambiar Contraseña</button>
          </div>
        ) : (
          <form onSubmit={onPasswordSave} className="space-y-3 max-w-md bg-surface-container-low p-4 border border-outline-variant rounded-lg mt-2 animate-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30 mb-2">
              <span className="text-xs font-bold text-on-surface flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-primary" translate="no">key</span>Actualizar Contraseña</span>
              <button type="button" onClick={closePasswordForm} className="p-1 hover:bg-surface-container-highest rounded text-on-surface-variant" aria-label="Cerrar formulario de contraseña"><span className="material-symbols-outlined text-[14px]" translate="no">close</span></button>
            </div>
            <div className="space-y-2">
              <ProfileField required label="Contraseña Actual" type="password" name="clave_actual" value={passwordForm.clave_actual} onChange={onPasswordChange} placeholder="••••••••" />
              <ProfileField required label="Nueva Contraseña" type="password" name="clave_nueva" minLength="6" value={passwordForm.clave_nueva} onChange={onPasswordChange} placeholder="Mínimo 6 caracteres" />
              <ProfileField required label="Confirmar Nueva Contraseña" type="password" name="clave_confirmar" value={passwordForm.clave_confirmar} onChange={onPasswordChange} placeholder="Repite la contraseña" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={closePasswordForm} className="px-3 py-1.5 border border-outline-variant text-on-surface-variant hover:text-on-surface h-8 text-xs font-bold rounded-lg hover:bg-surface-container-highest transition-colors">Cancelar</button>
              <button type="submit" disabled={isChangingPassword} className="px-3 py-1.5 bg-primary text-on-primary h-8 text-xs font-bold rounded-md shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1">{isChangingPassword ? 'Guardando...' : 'Guardar Clave'}</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default ProfileSettingsTab;
