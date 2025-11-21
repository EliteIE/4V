
import React, { useState } from 'react';
import { useStore } from '../store';
import { useTheme } from './ThemeContext';
import { Lock, Mail, Sun, Moon, ArrowRight } from 'lucide-react';
import { Input, Button } from './UI';

const Login: React.FC = () => {
  const { login, users } = useStore();
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email)) {
      setError('');
    } else {
      setError('Credenciales inválidas.');
    }
  };

  const fillDemo = (email: string) => {
    setEmail(email);
    setPassword('123');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden">
      
      {/* Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Theme Toggle Absolute */}
      <div className="absolute top-6 right-6">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 mb-6 transform hover:scale-105 transition-transform duration-500">
            <span className="text-white font-bold text-2xl tracking-tighter">4V</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Cuatro Vientos</h1>
          <p className="text-slate-500 dark:text-slate-400">Sistema de Gestión de Stock</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-200 dark:border-slate-800 p-8 transition-all duration-300">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Iniciar Sesión</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Acceda a su cuenta para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Correo Electrónico</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <Input
                  type="email"
                  required
                  className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400" 
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <Input
                  type="password"
                  required
                  className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/50 animate-in fade-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-6 text-base font-semibold shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
            >
              Ingresar al Sistema
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </form>
        </div>

        {/* Demo Users */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Cuentas de Demostración</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => fillDemo(u.email)}
                className="text-xs px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full hover:border-primary dark:hover:border-primary text-slate-600 dark:text-slate-300 transition-all"
              >
                {u.role === 'ADMIN' ? 'Admin' : u.role === 'STOCK' ? 'Depósito' : 'Cajero'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
