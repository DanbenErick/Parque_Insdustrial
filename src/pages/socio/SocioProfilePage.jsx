import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axiosConfig';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SocioProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      clave_actual: '',
      clave_nueva: '',
      confirmar_clave: ''
    }
  });

  const claveNueva = watch('clave_nueva');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.put('/auth/change-password', {
        clave_actual: data.clave_actual,
        clave_nueva: data.clave_nueva
      });
      toast.success('Contraseña actualizada exitosamente');
      reset();
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[800px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-surface-container-low hover:bg-surface-container rounded-xl text-on-surface-variant transition-colors">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Mi Perfil</h1>
          <p className="text-sm text-on-surface-variant">Gestione la seguridad de su cuenta</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        
        {/* Profile Header */}
        <div className="bg-emerald-50 p-6 md:p-8 border-b border-emerald-100 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <div className="w-24 h-24 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-4xl shadow-md border-4 border-white">
            {user?.nombre_razonsocial ? user.nombre_razonsocial.substring(0, 1) : 'S'}
          </div>
          <div className="flex-1 mt-2">
            <h2 className="text-xl font-bold text-emerald-950 mb-1">{user?.nombre_razonsocial}</h2>
            <div className="flex flex-col gap-1 text-sm text-emerald-800">
              <p className="flex items-center justify-center md:justify-start gap-2">
                <span className="material-symbols-outlined text-[16px]">badge</span>
                <span className="font-bold">RUC/DNI:</span> {user?.documento_identidad}
              </p>
              {user?.correo && (
                <p className="flex items-center justify-center md:justify-start gap-2">
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  {user.correo}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="p-6 md:p-8">
          <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">lock</span>
            Cambiar Contraseña
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Contraseña Actual</label>
              <input 
                type="password" 
                {...register('clave_actual', { required: 'La contraseña actual es requerida' })}
                className={`w-full px-4 py-3 rounded-xl border ${errors.clave_actual ? 'border-error bg-error/5' : 'border-outline-variant bg-surface-container-lowest'} focus:outline-none focus:border-emerald-500 transition-colors`}
                placeholder="••••••••"
              />
              {errors.clave_actual && <p className="text-error text-xs mt-1.5">{errors.clave_actual.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Nueva Contraseña (PIN)</label>
              <input 
                type="password" 
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                {...register('clave_nueva', { 
                  required: 'La nueva contraseña es requerida',
                  pattern: { value: /^\d{6}$/, message: 'Debe ser un PIN exacto de 6 dígitos' }
                })}
                className={`w-full px-4 py-3 rounded-xl border ${errors.clave_nueva ? 'border-error bg-error/5' : 'border-outline-variant bg-surface-container-lowest'} focus:outline-none focus:border-emerald-500 transition-colors tracking-widest font-data-mono`}
                placeholder="123456"
              />
              {errors.clave_nueva && <p className="text-error text-xs mt-1.5">{errors.clave_nueva.message}</p>}
              <p className="text-[11px] text-on-surface-variant mt-2">Su nueva contraseña debe ser un PIN numérico de exactamente 6 dígitos.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Confirmar Nueva Contraseña</label>
              <input 
                type="password" 
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                {...register('confirmar_clave', { 
                  required: 'Debes confirmar la contraseña',
                  validate: value => value === claveNueva || 'Las contraseñas no coinciden'
                })}
                className={`w-full px-4 py-3 rounded-xl border ${errors.confirmar_clave ? 'border-error bg-error/5' : 'border-outline-variant bg-surface-container-lowest'} focus:outline-none focus:border-emerald-500 transition-colors tracking-widest font-data-mono`}
                placeholder="123456"
              />
              {errors.confirmar_clave && <p className="text-error text-xs mt-1.5">{errors.confirmar_clave.message}</p>}
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full md:w-auto px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">save</span>
                )}
                Actualizar Contraseña
              </button>
            </div>
          </form>
        </div>

      </div>
    </main>
  );
};

export default SocioProfilePage;
