import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [selectedRole, setSelectedRole] = useState('Administrator');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username && password) {
      setIsLoading(true);
      try {
        await login(username, password);
        toast.success('¡Bienvenido!');
        navigate('/dashboard');
      } catch (error) {
        toast.error(error.message || 'Error al iniciar sesión');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getRoleClass = (role) => {
    return selectedRole === role
      ? 'active-role bg-primary-container text-on-primary-container border-primary-container'
      : 'bg-surface-container-low text-on-surface-variant border-outline-variant hover:bg-surface-container-high';
  };

  const getIconClass = (inputId) => {
    return focusedInput === inputId ? 'text-primary' : 'text-outline';
  };

  return (
    <main className="bg-surface-container-lowest text-on-background font-body-md h-screen w-full flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-1000">
        
      {/* Left Side: Visual 40% */}
      <section className="hidden md:block md:w-[40%] h-full relative bg-primary overflow-hidden">
        {/* Flat overlay */}
        <div className="absolute inset-0 bg-primary/40 mix-blend-multiply z-10"></div>
        <img 
          alt="Industrial Machinery" 
          className="w-full h-full object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIIGSmEnwmbAFAG2B-s4NEiE-HMZmnb0I7ubx-tybeKP5IIp7Bl0GiDyJCLnnk9MLf6M5dN95z4cI99C9NQcCcr506ip6sQcxPgW4JUMF_39Go0e6eWV6tMnccPHRGaS4mY3l-9iuAqIcDTNnyyennb1d_oUs3KQpTjJnjK12cYd2ZuZ9TsFBZMKddAT7Y46mZ-yX344rJG59g4e10BxV8JDNyh5yWSua27YUyX52AogyudGn90URQIXTagG8YNdK6OxD35HqO-MQ" 
        />
        {/* Decorative Quote on the left */}
        <div className="absolute bottom-12 left-12 right-12 z-20 text-white">
          <p className="font-headline-sm text-2xl font-light italic mb-4">"Potenciando el desarrollo industrial con tecnología de vanguardia."</p>
          <div className="h-1 w-12 bg-white rounded-full"></div>
        </div>
      </section>

      {/* Right Side: Login Form 60% */}
      <section className="w-full md:w-[60%] h-full overflow-y-auto flex flex-col items-center justify-center p-8 relative bg-surface-container-lowest">
        
        {/* Form Container */}
        <div className="w-full max-w-[420px] flex flex-col justify-center h-full py-12 relative z-10">
          
          <div className="mb-12 text-center md:text-left flex flex-col items-center md:items-start">
            {/* Flat logo presentation */}
            <div className="w-28 h-28 mb-8 bg-white rounded-full flex items-center justify-center border border-outline-variant overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-[85%] h-[85%] object-contain" />
            </div>
            
            {/* Flat Title */}
            <h2 className="font-headline-lg text-4xl md:text-5xl font-black mb-3 tracking-tighter text-primary">
              Bienvenido
            </h2>
            <p className="font-body-md text-on-surface-variant text-lg tracking-wide">Acceso al portal de control operativo.</p>
          </div>
          
          <form className="space-y-8 w-full" onSubmit={handleSubmit}>
            
            {/* Role Selector (Flat) */}
            <div className="bg-surface-container-low p-1.5 rounded-2xl inline-flex w-full border border-outline-variant/50">
              <button 
                type="button" 
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${selectedRole === 'Administrator' ? 'bg-white text-primary border border-outline-variant/30' : 'text-on-surface-variant hover:bg-white/50'}`}
                onClick={() => setSelectedRole('Administrator')}
              >
                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                Admin
              </button>
              <button 
                type="button" 
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${selectedRole === 'Moderator' ? 'bg-white text-primary border border-outline-variant/30' : 'text-on-surface-variant hover:bg-white/50'}`}
                onClick={() => setSelectedRole('Moderator')}
              >
                <span className="material-symbols-outlined text-[18px]">shield_person</span>
                Operario
              </button>
              <button 
                type="button" 
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${selectedRole === 'Member' ? 'bg-white text-primary border border-outline-variant/30' : 'text-on-surface-variant hover:bg-white/50'}`}
                onClick={() => setSelectedRole('Member')}
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                Miembro
              </button>
            </div>

            {/* Input Fields (Flat) */}
            <div className="space-y-6">
              <div className="group">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block transition-colors group-focus-within:text-primary" htmlFor="username">
                  {selectedRole === 'Administrator' ? 'Usuario o Correo' : 'DNI / RUC'}
                </label>
                <div className="relative flex items-center">
                  <span className={`material-symbols-outlined absolute left-4 text-[22px] transition-colors ${getIconClass('username')}`}>
                    {selectedRole === 'Administrator' ? 'mail' : 'badge'}
                  </span>
                  <input 
                    id="username" 
                    type="text" 
                    className="w-full pl-[48px] pr-4 py-4 bg-surface-container-low hover:bg-surface-container focus:bg-white border-2 border-transparent focus:border-primary rounded-xl outline-none transition-colors font-body-md text-on-surface" 
                    placeholder={selectedRole === 'Administrator' ? 'usuario@empresa.com' : 'Ej. 76543210'}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedInput('username')}
                    onBlur={() => setFocusedInput(null)}
                    required
                  />
                </div>
              </div>

              <div className="group">
                <div className="mb-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block transition-colors group-focus-within:text-primary" htmlFor="password">
                    {selectedRole === 'Administrator' ? 'Contraseña' : 'PIN de Acceso (6 dígitos)'}
                  </label>
                </div>
                <div className="relative flex items-center">
                  <span className={`material-symbols-outlined absolute left-4 text-[22px] transition-colors ${getIconClass('password')}`}>
                    {selectedRole === 'Administrator' ? 'lock' : 'dialpad'}
                  </span>
                  <input 
                    id="password" 
                    type={selectedRole === 'Administrator' ? 'password' : 'password'}
                    maxLength={selectedRole === 'Administrator' ? undefined : 6}
                    inputMode={selectedRole === 'Administrator' ? 'text' : 'numeric'}
                    pattern={selectedRole === 'Administrator' ? undefined : '\\d{6}'}
                    className="w-full pl-[48px] pr-4 py-4 bg-surface-container-low hover:bg-surface-container focus:bg-white border-2 border-transparent focus:border-primary rounded-xl outline-none transition-colors font-body-md text-on-surface tracking-wider" 
                    placeholder={selectedRole === 'Administrator' ? '••••••••' : '••••••'}
                    value={password}
                    onChange={(e) => {
                      if (selectedRole !== 'Administrator') {
                        const val = e.target.value.replace(/\D/g, '');
                        setPassword(val);
                      } else {
                        setPassword(e.target.value);
                      }
                    }}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button (Flat) */}
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full bg-primary text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-3 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-fixed-variant'}`}
            >
              <span className="text-lg tracking-wide">{isLoading ? 'Autenticando...' : 'Iniciar Sesión'}</span>
              {!isLoading && <span className="material-symbols-outlined text-[20px]">login</span>}
            </button>
            
          </form>
          
          <div className="w-full max-w-[420px] mx-auto mt-auto pt-12 text-[10px] font-bold text-outline-variant uppercase tracking-widest flex justify-center">
             <span>Parque Industrial Jicamarca © 2026</span>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
