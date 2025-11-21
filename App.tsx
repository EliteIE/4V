
import React, { useState } from 'react';
import { useStore } from './store';
import { Role } from './types';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  LogOut, 
  Menu, 
  Archive,
  DollarSign,
  ClipboardList,
  TrendingUp
} from 'lucide-react';

// Component Imports
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import POS from './components/POS';
import CashCloseView from './components/CashCloseView';
import StockEntry from './components/StockEntry';
import Reports from './components/Reports';

type ViewState = 'DASHBOARD' | 'INVENTORY' | 'POS' | 'STOCK_ENTRY' | 'CASH_CLOSE' | 'REPORTS';

const App: React.FC = () => {
  const { currentUser, logout } = useStore();
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  if (!currentUser) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD': return <Dashboard />;
      case 'INVENTORY': return <Inventory />;
      case 'POS': return <POS />;
      case 'STOCK_ENTRY': return <StockEntry />;
      case 'CASH_CLOSE': return <CashCloseView />;
      case 'REPORTS': return <Reports />;
      default: return <Dashboard />;
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case Role.ADMIN: return 'Administrador';
      case Role.STOCK: return 'Depósito / Stock';
      case Role.CASHIER: return 'Cajero';
      default: return role;
    }
  };

  const NavItem = ({ view, label, icon: Icon, allowedRoles }: { view: ViewState, label: string, icon: any, allowedRoles?: Role[] }) => {
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) return null;
    
    const active = currentView === view;
    return (
      <button
        onClick={() => {
          setCurrentView(view);
          setSidebarOpen(false);
        }}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
          active 
            ? 'bg-primary text-white' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="font-bold text-white">4V</span>
              </div>
              <h1 className="text-xl font-bold">Cuatro Vientos</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">Sistema de Stock v1.0</p>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <NavItem view="DASHBOARD" label="Inicio" icon={LayoutDashboard} />
            
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Operaciones</p>
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

            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Gestión</p>
            </div>

            <NavItem 
              view="INVENTORY" 
              label="Inventario" 
              icon={Package} 
              allowedRoles={[Role.ADMIN, Role.STOCK]} 
            />
            
            <NavItem 
              view="REPORTS" 
              label="Reportes" 
              icon={ClipboardList} 
              allowedRoles={[Role.ADMIN]} 
            />
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">{currentUser.name}</span>
                <span className="text-xs text-slate-500">{getRoleLabel(currentUser.role)}</span>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 lg:hidden p-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
            <Menu size={24} />
          </button>
          <span className="font-bold text-slate-800">Cuatro Vientos</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        {/* View Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
