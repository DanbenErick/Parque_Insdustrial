import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

const LoginBackground = React.memo(() => (
  <div className="absolute inset-0 z-0">
    {/* CSS-only industrial background — no external dependencies */}
    <div className="w-full h-full bg-slate-900">
      {/* Circuit-board / grid pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.07]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8" />
          </pattern>
          <pattern id="dots" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="1.5" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
      {/* Radial glow accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.35),transparent)]" />
      {/* Bottom vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
    </div>
    {/* Primary color overlay */}
    <div className="absolute inset-0 bg-primary/60 mix-blend-multiply"></div>
  </div>
));


const ROLES = [
  { id: 'Administrator', label: 'Admin', icon: 'admin_panel_settings' },
  { id: 'Moderator', label: 'Operario', icon: 'shield_person' },
  { id: 'Member', label: 'Socio', icon: 'person' }
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [selectedRole, setSelectedRole] = useState('Administrator');
  const [focusedInput, setFocusedInput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, resetField } = useForm({
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data.username, data.password);
      toast.success('¡Bienvenido!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const getIconClass = (inputId) => {
    return focusedInput === inputId ? 'text-primary' : 'text-on-surface-variant';
  };

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    resetField('username');
    resetField('password');
  };

  return (
    <main className="min-h-[100dvh] w-full relative flex items-center justify-center overflow-hidden font-body-md bg-surface">
      
      {/* Premium Full-Screen Background - Memoized */}
      <LoginBackground />

      {/* Floating Glassmorphism Card */}
      <section className="relative z-10 w-full max-w-[420px] px-4 sm:px-6 animate-in zoom-in-95 fade-in duration-700">
        
        <div className="bg-white/95 backdrop-blur-2xl border border-white/50 p-6 sm:p-8 rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)]">
          
          <div className="mb-8 text-center flex flex-col items-center">
            {/* Elegant Logo Container */}
            <div className="w-20 h-20 mb-5 bg-white rounded-2xl flex items-center justify-center border border-outline-variant shadow-sm overflow-hidden p-2">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            
            <h2 className="font-headline-sm text-3xl font-bold mb-1 tracking-tight text-on-surface">
              Bienvenido
            </h2>
            <p className="text-sm text-on-surface-variant font-medium">Acceso al portal de control operativo</p>
          </div>
          
          <form className="space-y-6 w-full" onSubmit={handleSubmit(onSubmit)} noValidate>
            
            {/* Mac-Style Segmented Control */}
            <div 
              className="bg-surface-container-low/50 p-1 rounded-xl flex w-full border border-outline-variant/30 mb-6 relative"
              role="tablist"
              aria-label="Seleccionar rol de usuario"
            >
              {ROLES.map((role) => (
                <button 
                  key={role.id}
                  type="button" 
                  role="tab"
                  aria-selected={selectedRole === role.id}
                  className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2 rounded-lg font-bold text-[9px] sm:text-[11px] uppercase tracking-wide transition-all duration-300 z-10 ${selectedRole === role.id ? 'text-primary shadow-sm bg-white' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/30'}`}
                  onClick={() => handleRoleChange(role.id)}
                >
                  <span className="material-symbols-outlined text-[14px] sm:text-[16px]">{role.icon}</span>
                  {role.label}
                </button>
              ))}
            </div>

            {/* Inputs Container */}
            <div className="space-y-4">
              <div className="group">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block ml-1 transition-colors group-focus-within:text-primary" htmlFor="username">
                  {selectedRole === 'Administrator' ? 'Usuario o Correo' : 'DNI / RUC'}
                </label>
                <div className="relative flex items-center">
                  <span className={`material-symbols-outlined absolute left-3.5 text-[20px] transition-colors ${getIconClass('username')}`}>
                    {selectedRole === 'Administrator' ? 'mail' : 'badge'}
                  </span>
                  <input 
                    id="username" 
                    type="text" 
                    {...register("username", { 
                      required: "Este campo es requerido",
                      ...(selectedRole !== 'Administrator' && {
                        pattern: {
                          value: /^[0-9]+$/,
                          message: "Solo se permiten números"
                        }
                      })
                    })}
                    className={`w-full h-12 pl-[42px] pr-4 bg-surface-container-lowest/80 hover:bg-white focus:bg-white border ${errors.username ? 'border-error focus:border-error focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-primary'} focus:ring-1 rounded-xl outline-none transition-all text-sm font-medium text-on-surface placeholder:text-on-surface-variant/50 shadow-sm`}
                    placeholder={selectedRole === 'Administrator' ? 'usuario@empresa.com' : 'Ej. 76543210'}
                    onFocus={() => setFocusedInput('username')}
                    onBlur={(e) => {
                      register('username').onBlur(e);
                      setFocusedInput(null);
                    }}
                    autoFocus
                  />
                </div>
                {errors.username && <p className="text-error text-xs mt-1 ml-1 font-medium">{errors.username.message}</p>}
              </div>

              <div className="group">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block ml-1 transition-colors group-focus-within:text-primary" htmlFor="password">
                  {selectedRole === 'Administrator' ? 'Contraseña' : 'PIN de Acceso (6 dígitos)'}
                </label>
                <div className="relative flex items-center">
                  <span className={`material-symbols-outlined absolute left-3.5 text-[20px] transition-colors ${getIconClass('password')}`}>
                    {selectedRole === 'Administrator' ? 'lock' : 'dialpad'}
                  </span>
                  <input 
                    id="password" 
                    type={showPassword ? 'text' : 'password'}
                    maxLength={selectedRole === 'Administrator' ? undefined : 6}
                    inputMode={selectedRole === 'Administrator' ? 'text' : 'numeric'}
                    {...register("password", { 
                      required: "La contraseña es requerida",
                      ...(selectedRole !== 'Administrator' && {
                        pattern: {
                          value: /^\d{6}$/,
                          message: "El PIN debe tener exactamente 6 dígitos"
                        }
                      })
                    })}
                    className={`w-full h-12 pl-[42px] pr-12 bg-surface-container-lowest/80 hover:bg-white focus:bg-white border ${errors.password ? 'border-error focus:border-error focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-primary'} focus:ring-1 rounded-xl outline-none transition-all text-sm font-medium text-on-surface placeholder:text-on-surface-variant/50 shadow-sm tracking-wider`}
                    placeholder={selectedRole === 'Administrator' ? '••••••••' : '••••••'}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={(e) => {
                      register('password').onBlur(e);
                      setFocusedInput(null);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none flex items-center justify-center p-1"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.password && <p className="text-error text-xs mt-1 ml-1 font-medium">{errors.password.message}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full h-12 bg-primary hover:bg-primary-fixed-variant text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
            >
              <span className="text-sm tracking-wide">{isLoading ? 'Autenticando...' : 'Iniciar Sesión'}</span>
              {!isLoading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
            
          </form>
          
        </div>
        
        {/* Footer */}
        <div className="w-full text-center mt-6 text-[10px] font-bold text-white/70 uppercase tracking-widest drop-shadow-md">
           Parque Industrial Jicamarca © 2026
        </div>
      </section>
    </main>
  );
};

export default Login;
