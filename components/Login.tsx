import React, { useState } from 'react';
import { useStore } from '../store';
import { Lock, Mail } from 'lucide-react';

const Login: React.FC = () => {
  const { login, users } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email)) {
      setError('');
    } else {
      setError('Credenciales inválidas. Intente con los usuarios demo.');
    }
  };

  // Auto-fill helper for demo purposes
  const fillDemo = (email: string) => {
    setEmail(email);
    setPassword('123');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="bg-primary w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <span className="text-white font-bold text-2xl">4V</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Bienvenido</h1>
          <p className="text-slate-500">Ingrese a su cuenta para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
          >
            Ingresar
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center mb-3">Usuarios Demo (Click para rellenar)</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => fillDemo(u.email)}
                className="text-xs px-3 py-1 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
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