
import React, { useState } from 'react';
import { useStore } from '../store';
import { Role } from '../types';
import { useTheme } from './ThemeContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  LogOut, 
  Menu, 
  Archive,
  DollarSign,
  ClipboardList,
  X,
  Sun,
  Moon
} from 'lucide-react';

type ViewState = 'DASHBOARD' | 'INVENTORY' | 'POS' | 'STOCK_ENTRY' | 'CASH_CLOSE' | 'REPORTS';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const { currentUser, logout } = useStore();
  const { theme, setTheme } = useTheme();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  if (!currentUser) return null;

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case Role.ADMIN: return 'Administrador';
      case Role.STOCK: return 'Depósito';
      case Role.CASHIER: return 'Cajero';
      default: return role;
    }
  };

  const getPageTitle = (view: ViewState) => {
    switch (view) {
      case 'DASHBOARD': return 'Inicio';
      case 'INVENTORY': return 'Inventario';
      case 'POS': return 'Punto de Venta';
      case 'STOCK_ENTRY': return 'Entrada de Mercadería';
      case 'CASH_CLOSE': return 'Cierre de Caja';
      case 'REPORTS': return 'Reportes';
      default: return 'Cuatro Vientos';
    }
  };

  const NavItem = ({ view, label, icon: Icon, allowedRoles }: { view: ViewState, label: string, icon: any, allowedRoles?: Role[] }) => {
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) return null;
    
    const active = currentView === view;
    return (
      <button
        onClick={() => {
          onNavigate(view);
          setSidebarOpen(false);
        }}
        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 group ${
          active 
            ? 'bg-primary text-white shadow-md' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Icon size={18} className={active ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
        <span className="font-medium text-sm">{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-950 text-white transform transition-transform duration-300 ease-out
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col border-r border-slate-800">
          {/* Logo Area */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 mr-3">
              <span className="font-bold text-white">4V</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">Cuatro Vientos</h1>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5 tracking-wider">STOCK SYSTEM</p>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            <NavItem view="DASHBOARD" label="Panel Principal" icon={LayoutDashboard} />
            
            <div className="pt-6 pb-2">
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Operaciones</p>
            </div>
            
            <NavItem 
              view="POS" 
              label="Punto de Venta" 
              icon={ShoppingCart} 
              allowedRoles={[Role.ADMIN, Role.CASHIER]} 
            />
            <NavItem 
              view="CASH_CLOSE" 
              label="Cierre de Caja" 
              icon={DollarSign} 
              allowedRoles={[Role.ADMIN, Role.CASHIER]} 
            />
             <NavItem 
              view="STOCK_ENTRY" 
              label="Entrada Mercadería" 
              icon={Archive} 
              allowedRoles={[Role.ADMIN, Role.STOCK]} 
            />

            <div className="pt-6 pb-2">
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gestión</p>
            </div>

            <NavItem 
              view="INVENTORY" 
              label="Inventario" 
              icon={Package} 
              allowedRoles={[Role.ADMIN, Role.STOCK]} 
            />
            
            <NavItem 
              view="REPORTS" 
              label="Reportes y Análisis" 
              icon={ClipboardList} 
              allowedRoles={[Role.ADMIN]} 
            />
          </nav>

          {/* User Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/50">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-700">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-white truncate">{currentUser.name}</span>
                <span className="text-xs text-slate-500 truncate">{getRoleLabel(currentUser.role)}</span>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 p-2 rounded-md bg-slate-900 hover:bg-red-500/10 hover:text-red-500 text-slate-400 transition-all text-sm font-medium border border-slate-800 hover:border-red-500/20"
            >
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 z-10 transition-colors">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{getPageTitle(currentView)}</h2>
          </div>
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title="Cambiar Tema"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span className="text-xs font-medium hidden md:inline-block">{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
            </button>

            <div className="hidden md:flex text-xs text-slate-500 dark:text-slate-400 items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-100 dark:border-slate-700">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Sistema Operativo
            </div>
          </div>
        </header>

        {/* View Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
