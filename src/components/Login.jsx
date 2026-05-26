import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState('Administrator');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      onLogin(selectedRole);
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
    <div className="bg-background text-on-background font-body-md min-h-screen flex items-center justify-center p-md" style={{ backgroundImage: 'radial-gradient(#bdc8ce 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
      {/* Login Container */}
      <main className="w-full max-w-[1000px] bg-surface-container-lowest grid grid-cols-1 md:grid-cols-2 rounded-lg border border-outline-variant shadow-lg overflow-hidden animate-in fade-in duration-700">
        
        {/* Left Side: Visual/Branding */}
        <section className="hidden md:flex flex-col justify-between p-xl bg-on-secondary-fixed text-on-primary-container relative overflow-hidden">
          {/* Decorative Background Element */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <img 
              alt="Industrial Machinery" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIIGSmEnwmbAFAG2B-s4NEiE-HMZmnb0I7ubx-tybeKP5IIp7Bl0GiDyJCLnnk9MLf6M5dN95z4cI99C9NQcCcr506ip6sQcxPgW4JUMF_39Go0e6eWV6tMnccPHRGaS4mY3l-9iuAqIcDTNnyyennb1d_oUs3KQpTjJnjK12cYd2ZuZ9TsFBZMKddAT7Y46mZ-yX344rJG59g4e10BxV8JDNyh5yWSua27YUyX52AogyudGn90URQIXTagG8YNdK6OxD35HqO-MQ" 
            />
          </div>
          <div className="relative z-10">
            <h1 className="font-headline-lg text-headline-lg text-primary-fixed-dim mb-xs">Parque Industrial Jicamarca</h1>
            <p className="font-body-md text-body-md text-secondary-fixed-dim">Gestión y Operaciones Industriales</p>
          </div>
          <div className="relative z-10">
            <blockquote className="border-l-4 border-primary-fixed-dim pl-lg">
              <p className="font-headline-sm text-headline-sm italic text-white mb-sm">"Eficiencia energética y control total en un solo lugar."</p>
              <cite className="font-label-caps text-label-caps text-secondary-fixed">ADMINISTRACIÓN CENTRAL</cite>
            </blockquote>
          </div>
          <div className="relative z-10 flex gap-md">
            <div className="flex flex-col">
              <span className="font-data-mono text-data-mono text-primary-fixed-dim">STATUS</span>
              <span className="font-body-sm text-body-sm text-white">Sistemas Operativos</span>
            </div>
            <div className="flex flex-col">
              <span className="font-data-mono text-data-mono text-primary-fixed-dim">UPTIME</span>
              <span className="font-body-sm text-body-sm text-white">99.98%</span>
            </div>
          </div>
        </section>

        {/* Right Side: Login Form */}
        <section className="p-lg md:p-xl flex flex-col justify-center bg-surface-container-lowest z-10">
          <div className="mb-xl">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">Acceso al Portal</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Ingrese sus credenciales para continuar al panel de control de Parque Industrial Jicamarca.</p>
          </div>
          
          <form className="space-y-lg" onSubmit={handleSubmit}>
            {/* Role Selector */}
            <div className="space-y-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant">ROL DE ACCESO</label>
              <div className="grid grid-cols-3 gap-sm">
                <button 
                  type="button" 
                  className={`role-btn flex flex-col items-center justify-center p-sm border rounded-lg transition-all duration-200 ${getRoleClass('Administrator')}`}
                  onClick={() => setSelectedRole('Administrator')}
                >
                  <span className="material-symbols-outlined mb-xs">admin_panel_settings</span>
                  <span className="font-label-caps text-[10px]">Admin</span>
                </button>
                <button 
                  type="button" 
                  className={`role-btn flex flex-col items-center justify-center p-sm border rounded-lg transition-all duration-200 ${getRoleClass('Moderator')}`}
                  onClick={() => setSelectedRole('Moderator')}
                >
                  <span className="material-symbols-outlined mb-xs">shield_person</span>
                  <span className="font-label-caps text-[10px]">Moderador</span>
                </button>
                <button 
                  type="button" 
                  className={`role-btn flex flex-col items-center justify-center p-sm border rounded-lg transition-all duration-200 ${getRoleClass('Member')}`}
                  onClick={() => setSelectedRole('Member')}
                >
                  <span className="material-symbols-outlined mb-xs">person</span>
                  <span className="font-label-caps text-[10px]">Miembro</span>
                </button>
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-md">
              <div className="space-y-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="username">
                  {selectedRole === 'Administrator' ? 'USUARIO' : 'DNI / USUARIO'}
                </label>
                <div className="relative">
                  <span className={`material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-[20px] transition-colors ${getIconClass('username')}`}>
                    {selectedRole === 'Administrator' ? 'account_circle' : 'badge'}
                  </span>
                  <input 
                    id="username" 
                    type="text" 
                    className="w-full pl-[48px] pr-md py-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-on-surface" 
                    placeholder={selectedRole === 'Administrator' ? 'nombre.apellido' : 'Ej. 76543210'}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedInput('username')}
                    onBlur={() => setFocusedInput(null)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-xs">
                <div className="flex justify-between items-center">
                  <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="password">
                    {selectedRole === 'Administrator' ? 'CONTRASEÑA' : 'PIN DE 6 DÍGITOS'}
                  </label>
                  <a className="text-[12px] text-primary hover:underline font-medium" href="#">¿Olvidó su acceso?</a>
                </div>
                <div className="relative">
                  <span className={`material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-[20px] transition-colors ${getIconClass('password')}`}>
                    {selectedRole === 'Administrator' ? 'lock' : 'dialpad'}
                  </span>
                  <input 
                    id="password" 
                    type={selectedRole === 'Administrator' ? 'password' : 'password'}
                    maxLength={selectedRole === 'Administrator' ? undefined : 6}
                    inputMode={selectedRole === 'Administrator' ? 'text' : 'numeric'}
                    pattern={selectedRole === 'Administrator' ? undefined : '\\d{6}'}
                    className="w-full pl-[48px] pr-md py-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-on-surface tracking-widest" 
                    placeholder={selectedRole === 'Administrator' ? '••••••••' : '••••••'}
                    value={password}
                    onChange={(e) => {
                      if (selectedRole !== 'Administrator') {
                        // Solo permitir números para PIN
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
                {selectedRole !== 'Administrator' && (
                  <p className="text-[11px] text-on-surface-variant mt-1 text-right">Ingrese exactamente 6 números</p>
                )}
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-sm">
              <input id="remember" type="checkbox" className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
              <label htmlFor="remember" className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer">Mantener sesión iniciada</label>
            </div>

            {/* Submit Button */}
            <button type="submit" className="w-full bg-primary-container text-on-primary-container font-headline-sm py-md rounded-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-sm shadow-md">
              <span>Ingresar</span>
              <span className="material-symbols-outlined">login</span>
            </button>

            {/* Footer Links */}
            <div className="pt-lg border-t border-outline-variant flex flex-col gap-sm">
              <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
                ¿No tiene una cuenta? <a className="text-primary font-bold hover:underline" href="#">Contactar Soporte</a>
              </p>
              <div className="flex justify-center gap-lg text-[11px] font-label-caps text-outline uppercase tracking-widest">
                <a className="hover:text-primary" href="#">Privacidad</a>
                <a className="hover:text-primary" href="#">Términos</a>
                <a className="hover:text-primary" href="#">Ayuda</a>
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Login;
