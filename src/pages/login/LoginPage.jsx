import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

const LoginBackground = React.memo(() => (
  <div className="absolute inset-0 z-0">
    <div className="w-full h-full bg-slate-900">
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
    </div>
    <div className="absolute inset-0 bg-primary/40 mix-blend-multiply"></div>
  </div>
));


const ROLES = [
  { id: 'Administrator', label: 'Admin', icon: 'admin_panel_settings' },
  { id: 'Member', label: 'Socio', icon: 'person' }
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [selectedRole, setSelectedRole] = useState('Administrator');
  const [focusedInput, setFocusedInput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const { register, handleSubmit, formState: { errors }, resetField } = useForm({
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setLoginError(null);
    setIsLoading(true);
    try {
      await login(data.username.trim(), data.password.trim());
      toast.success('¡Bienvenido!');
      navigate('/dashboard');
    } catch (error) {
      const errorMsg = error.message || 'Error al iniciar sesión';
      setLoginError(errorMsg);
      toast.error(errorMsg);
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
      <section className="relative z-10 w-full max-w-[380px] px-4 animate-in zoom-in-95 fade-in duration-700">
        
        <div className="bg-white/95 backdrop-blur-2xl border border-white/50 p-5 sm:p-6 rounded-2xl shadow-2xl">
          
          <div className="mb-6 text-center flex flex-col items-center">
            {/* Elegant Logo Container */}
            <div className="w-14 h-14 mb-3 bg-white rounded-xl flex items-center justify-center border border-outline-variant shadow-sm overflow-hidden p-1.5">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            
            <h2 className="font-headline-sm text-2xl font-bold mb-0.5 tracking-tight text-on-surface">
              Bienvenido
            </h2>
            <p className="text-xs text-on-surface-variant font-medium">Acceso al portal de control</p>
          </div>
          
          <form className="space-y-5 w-full" onSubmit={handleSubmit(onSubmit)} noValidate>
            
            {/* Mensaje de Error de Login */}
            {loginError && (
              <div className="bg-error/10 border-l-[3px] border-error px-3 py-2 rounded-r flex items-start gap-2 mb-4 animate-in fade-in slide-in-from-top-2">
                <span className="material-symbols-outlined text-error text-[16px] mt-0.5">error</span>
                <p className="text-[11px] text-error font-medium leading-tight">
                  {loginError}
                </p>
              </div>
            )}

            {/* Mac-Style Segmented Control */}
            {ROLES.length > 1 && (
              <div 
                className="bg-surface-container-low/80 p-1 rounded-lg flex w-full border border-outline-variant/50 mb-5 relative"
                role="tablist"
                aria-label="Seleccionar rol de usuario"
              >
                {ROLES.map((role) => (
                  <button 
                    key={role.id}
                    type="button" 
                    role="tab"
                    aria-selected={selectedRole === role.id}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-bold text-[9px] uppercase tracking-wide transition-all duration-300 z-10 ${selectedRole === role.id ? 'text-primary shadow-sm bg-white border border-outline-variant/30' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/30'}`}
                    onClick={() => handleRoleChange(role.id)}
                  >
                    <span className="material-symbols-outlined text-[14px]">{role.icon}</span>
                    {role.label}
                  </button>
                ))}
              </div>
            )}

            {/* Inputs Container */}
            <div className="space-y-3.5">
              <div className="group">
                <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 block ml-1 transition-colors group-focus-within:text-primary" htmlFor="username">
                  {selectedRole === 'Administrator' ? 'Usuario o Correo' : 'DNI / RUC'}
                </label>
                <div className="relative flex items-center">
                  <span className={`material-symbols-outlined absolute left-3 text-[18px] transition-colors ${getIconClass('username')}`}>
                    {selectedRole === 'Administrator' ? 'mail' : 'badge'}
                  </span>
                  <input 
                    id="username" 
                    type="text" 
                    {...register("username", { 
                      required: "Este campo es requerido",
                      setValueAs: v => v?.trim(),
                      validate: (value) => {
                        if (selectedRole !== 'Administrator') {
                          return /^[0-9]+$/.test(value) || "Solo se permiten números";
                        }
                        return true;
                      }
                    })}
                    className={`w-full h-10 pl-9 pr-3 bg-surface-container-lowest hover:bg-white focus:bg-white border ${errors.username ? 'border-error focus:border-error focus:ring-error' : 'border-outline-variant/80 focus:border-primary focus:ring-primary'} focus:ring-1 rounded-lg outline-none transition-all text-sm font-medium text-on-surface placeholder:text-on-surface-variant/50 shadow-sm`}
                    placeholder={selectedRole === 'Administrator' ? 'usuario@empresa.com' : 'Ej. 76543210'}
                    onFocus={() => setFocusedInput('username')}
                    onBlur={(e) => {
                      register('username').onBlur(e);
                      setFocusedInput(null);
                    }}
                    autoFocus
                  />
                </div>
                {errors.username && <p className="text-error text-[10px] mt-1 ml-1 font-medium">{errors.username.message}</p>}
              </div>

              <div className="group">
                <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 block ml-1 transition-colors group-focus-within:text-primary" htmlFor="password">
                  {selectedRole === 'Administrator' ? 'Contraseña' : 'PIN de Acceso (6 dígitos)'}
                </label>
                <div className="relative flex items-center">
                  <span className={`material-symbols-outlined absolute left-3 text-[18px] transition-colors ${getIconClass('password')}`}>
                    {selectedRole === 'Administrator' ? 'lock' : 'dialpad'}
                  </span>
                  <input 
                    id="password" 
                    type={showPassword ? 'text' : 'password'}
                    maxLength={selectedRole === 'Administrator' ? undefined : 6}
                    inputMode={selectedRole === 'Administrator' ? 'text' : 'numeric'}
                    {...register("password", { 
                      required: "La contraseña es requerida",
                      setValueAs: v => v?.trim(),
                      validate: (value) => {
                        if (selectedRole !== 'Administrator') {
                          return /^\d{6}$/.test(value) || "El PIN debe tener exactamente 6 dígitos";
                        }
                        return true;
                      }
                    })}
                    className={`w-full h-10 pl-9 pr-10 bg-surface-container-lowest hover:bg-white focus:bg-white border ${errors.password ? 'border-error focus:border-error focus:ring-error' : 'border-outline-variant/80 focus:border-primary focus:ring-primary'} focus:ring-1 rounded-lg outline-none transition-all text-sm font-medium text-on-surface placeholder:text-on-surface-variant/50 shadow-sm tracking-wider`}
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
                    className="absolute right-2.5 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none flex items-center justify-center p-1"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.password && <p className="text-error text-[10px] mt-1 ml-1 font-medium">{errors.password.message}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full h-10 bg-primary hover:bg-primary-fixed-variant text-white font-bold rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 mt-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
            >
              <span className="text-xs tracking-wide">{isLoading ? 'Autenticando...' : 'Iniciar Sesión'}</span>
              {!isLoading && <span className="material-symbols-outlined text-[16px]">arrow_forward</span>}
            </button>
            
          </form>
          
        </div>
        
        {/* Footer removed per user request */}
      </section>
    </main>
  );
};

export default Login;
