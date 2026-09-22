import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axiosConfig';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

const editableValues = (p) => ({ username: p?.username || '', documento_identidad: p?.documento_identidad || '', telefono: p?.telefono || '', correo: p?.correo || '' });

const Detail = ({ label, value }) => (
  <div className="min-w-0 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4">
    <dt className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">{label}</dt>
    <dd className="mt-1 break-words text-sm font-semibold text-on-surface">{value || 'No registrado'}</dd>
  </div>
);

const SocioProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(user);
  const [meters, setMeters] = useState([]);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: editableValues(user) });
  const passwordForm = useForm({ defaultValues: { clave_actual: '', clave_nueva: '', confirmar_clave: '' } });
  const newPassword = passwordForm.watch('clave_nueva');

  useEffect(() => {
    let active = true;
    api.get('/auth/me').then(({ data }) => {
      if (!active) return;
      setProfile(data);
      reset(editableValues(data));
      updateUser(data);
    }).catch(() => { if (active) toast.error('No se pudo actualizar la ficha del socio.'); });
    return () => { active = false; };
  }, [reset, updateUser]);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    api.get(`/medidores/usuario/${user.id}`).then(({ data }) => {
      if (active) setMeters(Array.isArray(data) ? data : []);
    }).catch(() => { if (active) toast.error('No se pudieron cargar los medidores.'); });
    return () => { active = false; };
  }, [user?.id]);

  const saveProfile = async (values) => {
    setSaving(true);
    try {
      const { data } = await api.put('/auth/me', Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()])));
      setProfile(data);
      reset(editableValues(data));
      updateUser(data);
      toast.success('Datos actualizados.');
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudieron guardar los datos.');
    } finally { setSaving(false); }
  };

  const changePassword = async (values) => {
    setChangingPassword(true);
    try {
      await api.put('/auth/change-password', { clave_actual: values.clave_actual, clave_nueva: values.clave_nueva });
      passwordForm.reset();
      toast.success('Contraseña actualizada.');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al cambiar la contraseña.');
    } finally { setChangingPassword(false); }
  };

  const fieldClass = 'mt-1.5 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';
  const labelClass = 'block text-xs font-bold text-on-surface-variant';
  const errorText = (error) => error && <span className="mt-1 block text-xs text-error">{error.message}</span>;

  return (
    <main className="mx-auto w-full max-w-[1040px] space-y-6 p-4 md:p-6 lg:p-8">
      <header><h1 className="text-2xl font-bold text-on-surface">Mi ficha de socio</h1><p className="mt-1 text-sm text-on-surface-variant">Consulta tu información y actualiza tus datos de acceso y contacto.</p></header>

      <section className="overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm">
        <div className="flex items-center gap-4 border-b border-outline-variant/60 bg-primary/5 p-5 md:p-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-on-primary">{profile?.nombre_razonsocial?.charAt(0) || 'S'}</div>
          <div className="min-w-0"><h2 className="break-words text-lg font-bold text-on-surface">{profile?.nombre_razonsocial || 'Socio'}</h2><p className="text-xs font-semibold text-primary">{profile?.es_activo ? 'Cuenta activa' : 'Cuenta inactiva'}</p></div>
        </div>
        <div className="p-5 md:p-6"><h3 className="mb-4 font-bold text-on-surface">Información registrada</h3>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Nombre o razón social" value={profile?.nombre_razonsocial} />
            <Detail label="Rol" value={profile?.nombre_rol} />
            <Detail label="Representante" value={profile?.cargo_representante} />
            <Detail label="Actividad o rubro" value={profile?.actividad_rubro} />
            <Detail label="Dirección" value={profile?.direccion} />
            <Detail label="Último acceso" value={profile?.ultimo_acceso ? new Date(profile.ultimo_acceso).toLocaleString('es-PE') : null} />
          </dl>
        </div>
      </section>

      <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm md:p-6">
        <h3 className="text-lg font-bold text-on-surface">Medidores registrados</h3>
        {meters.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{meters.map((meter) => (
          <dl key={meter.id} className="grid gap-3 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 sm:grid-cols-2">
            <div><dt className="text-[11px] font-bold uppercase text-on-surface-variant">Número de serie</dt><dd className="mt-1 text-sm font-semibold text-on-surface">{meter.num_serie}</dd></div>
            <div><dt className="text-[11px] font-bold uppercase text-on-surface-variant">Tipo</dt><dd className="mt-1 text-sm font-semibold text-on-surface">{meter.tipo || 'No registrado'}</dd></div>
            <div className="sm:col-span-2"><dt className="text-[11px] font-bold uppercase text-on-surface-variant">Dirección del suministro</dt><dd className="mt-1 text-sm font-semibold text-on-surface">{meter.direccion || 'No registrada'}</dd></div>
            <div><dt className="text-[11px] font-bold uppercase text-on-surface-variant">Estado</dt><dd className="mt-1 text-sm font-semibold text-on-surface">{meter.operativo ? 'Operativo' : 'Inactivo'}</dd></div>
          </dl>
        ))}</div> : <p className="mt-3 text-sm text-on-surface-variant">No hay medidores registrados a tu nombre.</p>}
      </section>

      <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm md:p-6">
        <h3 className="text-lg font-bold text-on-surface">Datos editables</h3>
        <p className="mt-1 text-sm text-on-surface-variant">Puedes cambiar tu usuario, DNI o RUC, teléfono y correo electrónico.</p>
        <form onSubmit={handleSubmit(saveProfile)} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>Usuario<input className={fieldClass} maxLength={50} autoComplete="username" {...register('username', { pattern: { value: /^[A-Za-z0-9._-]*$/, message: 'Solo letras, números, puntos, guiones y guiones bajos.' } })} />{errorText(errors.username)}</label>
          <label className={labelClass}>DNI o RUC<input className={fieldClass} inputMode="numeric" maxLength={11} {...register('documento_identidad', { required: 'El documento es obligatorio.', pattern: { value: /^(\d{8}|\d{11})$/, message: 'Ingresa 8 u 11 dígitos.' } })} />{errorText(errors.documento_identidad)}</label>
          <label className={labelClass}>Teléfono<input className={fieldClass} inputMode="tel" autoComplete="tel" maxLength={9} {...register('telefono', { pattern: { value: /^(|\d{9})$/, message: 'Ingresa 9 dígitos.' } })} />{errorText(errors.telefono)}</label>
          <label className={labelClass}>Correo electrónico<input className={fieldClass} type="email" autoComplete="email" maxLength={100} {...register('correo', { pattern: { value: /^(|[^\s@]+@[^\s@]+\.[^\s@]+)$/, message: 'Ingresa un correo válido.' } })} />{errorText(errors.correo)}</label>
          <div className="flex justify-end sm:col-span-2"><button type="submit" disabled={saving} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar cambios'}</button></div>
        </form>
      </section>

      <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm md:p-6">
        <h3 className="text-lg font-bold text-on-surface">Seguridad de la cuenta</h3>
        <form onSubmit={passwordForm.handleSubmit(changePassword)} className="mt-5 grid max-w-xl gap-4">
          <label className={labelClass}>Contraseña actual<input className={fieldClass} type="password" autoComplete="current-password" {...passwordForm.register('clave_actual', { required: 'La contraseña actual es obligatoria.' })} />{errorText(passwordForm.formState.errors.clave_actual)}</label>
          <label className={labelClass}>Nueva contraseña<input className={fieldClass} type="password" autoComplete="new-password" maxLength={128} {...passwordForm.register('clave_nueva', { required: 'La nueva contraseña es obligatoria.', minLength: { value: 8, message: 'Mínimo 8 caracteres.' } })} />{errorText(passwordForm.formState.errors.clave_nueva)}</label>
          <label className={labelClass}>Confirmar nueva contraseña<input className={fieldClass} type="password" autoComplete="new-password" maxLength={128} {...passwordForm.register('confirmar_clave', { required: 'Confirma la contraseña.', validate: value => value === newPassword || 'Las contraseñas no coinciden.' })} />{errorText(passwordForm.formState.errors.confirmar_clave)}</label>
          <div><button type="submit" disabled={changingPassword} className="rounded-xl border border-primary px-5 py-2.5 text-sm font-bold text-primary disabled:opacity-50">{changingPassword ? 'Actualizando...' : 'Actualizar contraseña'}</button></div>
        </form>
      </section>
    </main>
  );
};

export default SocioProfilePage;
