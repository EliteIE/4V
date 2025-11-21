
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Role, MovementType } from '../types';
import { 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  Archive, 
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

const Dashboard: React.FC = () => {
  const { currentUser } = useStore();

  if (!currentUser) return null;

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case Role.ADMIN: return 'Administrador';
      case Role.STOCK: return 'Depósito';
      case Role.CASHIER: return 'Cajero';
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {currentUser.role === Role.STOCK ? 'Panel de Depósito' : 
             currentUser.role === Role.CASHIER ? 'Panel de Caja' : 'Panel Administrativo'}
          </h2>
          <p className="text-sm text-slate-500">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="px-3 py-1 bg-slate-200 rounded-full text-xs font-bold text-slate-700 uppercase">
          Rol: {getRoleLabel(currentUser.role)}
        </div>
      </div>

      {/* Render specific dashboard based on Role */}
      {currentUser.role === Role.ADMIN && <AdminDashboard />}
      {currentUser.role === Role.STOCK && <StockDashboard />}
      {currentUser.role === Role.CASHIER && <CashierDashboard />}
    </div>
  );
};

// --- 1. ADMIN DASHBOARD (Full Access) ---
const AdminDashboard: React.FC = () => {
  const { sales } = useStore();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('day');

  // Filter Logic
  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    return sales.filter(s => {
      const saleDate = new Date(s.date);
      const saleDateStr = s.date.split('T')[0];

      if (timeRange === 'day') return saleDateStr === todayStr;
      if (timeRange === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return saleDate >= oneWeekAgo;
      }
      if (timeRange === 'month') {
        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      }
      if (timeRange === 'year') {
        return saleDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [sales, timeRange]);

  // Stats
  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalTx = filteredSales.length;
  const itemsSold = filteredSales.reduce((acc, s) => acc + s.items.reduce((iAcc, i) => iAcc + i.quantity, 0), 0);

  // Chart Data Preparation
  const chartData = useMemo(() => {
    // Group by date/hour depending on range
    const grouped: {[key: string]: number} = {};
    
    filteredSales.forEach(s => {
      let key = '';
      const d = new Date(s.date);
      
      if (timeRange === 'day') key = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      else if (timeRange === 'week' || timeRange === 'month') key = d.toLocaleDateString('es-AR', {day: 'numeric', month: 'short'});
      else key = d.toLocaleDateString('es-AR', {month: 'long'});

      grouped[key] = (grouped[key] || 0) + s.total;
    });

    return Object.keys(grouped).map(k => ({ name: k, total: grouped[k] }));
  }, [filteredSales, timeRange]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Time Filter Tabs */}
      <div className="bg-white p-1 rounded-lg inline-flex border border-slate-200 shadow-sm">
        {(['day', 'week', 'month', 'year'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeRange === range 
                ? 'bg-slate-800 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {range === 'day' && 'Hoy'}
            {range === 'week' && 'Semana'}
            {range === 'month' && 'Mes'}
            {range === 'year' && 'Año'}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Ingresos Totales" 
          value={`$${totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-green-500" 
          subtext={`En este periodo (${timeRange === 'day' ? 'hoy' : timeRange === 'week' ? 'últ. 7 días' : timeRange})`}
        />
        <StatCard 
          title="Ventas Realizadas" 
          value={totalTx} 
          icon={ShoppingBag} 
          color="bg-blue-500" 
          subtext="Tickets generados"
        />
        <StatCard 
          title="Artículos Vendidos" 
          value={itemsSold} 
          icon={Package} 
          color="bg-purple-500" 
          subtext="Unidades retiradas"
        />
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Evolución de Ventas</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']}
                labelStyle={{ color: '#1e293b' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Detailed list (Latest transactions in this period) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Detalle de Ventas (Periodo Seleccionado)</h3>
        </div>
        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 text-slate-500 sticky top-0">
                <tr>
                  <th className="px-6 py-3">Hora / Fecha</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {filteredSales.slice().reverse().map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3">
                      {new Date(sale.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {sale.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-slate-800">
                      ${sale.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {filteredSales.length === 0 && (
                   <tr>
                     <td colSpan={3} className="p-6 text-center text-slate-400">No hay datos para este periodo</td>
                   </tr>
                )}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- 2. STOCK DASHBOARD (Inventory Only) ---
const StockDashboard: React.FC = () => {
  const { products, movements } = useStore();

  // Inventory Metrics
  const totalProducts = products.length;
  const totalVariants = products.reduce((acc, p) => acc + p.variants.length, 0);
  const totalItemsInStock = products.reduce((acc, p) => acc + p.variants.reduce((vAcc, v) => vAcc + v.stock, 0), 0);
  
  // Filter for stock less than 5
  const lowStockVariants = products.flatMap(p => 
    p.variants.filter(v => v.stock < 5).map(v => ({
      productName: p.name,
      sku: p.sku,
      variant: `${v.color} - ${v.size}`,
      stock: v.stock
    }))
  );

  // Recent Entries (Not Sales)
  const recentEntries = movements
    .filter(m => m.type === MovementType.ENTRADA || m.type === MovementType.AJUSTE)
    .slice(0, 10);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Variantes" 
          value={totalVariants} 
          icon={Package} 
          color="bg-indigo-500" 
          subtext={`En ${totalProducts} productos base`}
        />
        <StatCard 
          title="Unidades en Stock" 
          value={totalItemsInStock} 
          icon={Archive} 
          color="bg-blue-500" 
          subtext="Volumen físico total"
        />
        <StatCard 
          title="Alertas Stock Bajo" 
          value={lowStockVariants.length} 
          icon={AlertTriangle} 
          color="bg-orange-500" 
          subtext="Menos de 5 unidades"
        />
        <StatCard 
          title="Movimientos Entrada" 
          value={movements.filter(m => m.type === MovementType.ENTRADA).length} 
          icon={TrendingUp} 
          color="bg-green-500" 
          subtext="Histórico total"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-500" />
            Alertas de Stock Bajo ({'<'} 5 un.)
          </h3>
          <div className="overflow-y-auto max-h-80 space-y-3">
             {lowStockVariants.length === 0 ? (
               <div className="text-slate-400 text-center py-4">Todo en orden. Inventario saludable.</div>
             ) : (
               lowStockVariants.map((item, i) => (
                 <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-medium text-slate-800">{item.productName}</p>
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-mono bg-slate-200 px-1 rounded text-slate-600">{item.sku}</span>
                         <p className="text-xs text-slate-500">{item.variant}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 ${
                        item.stock === 0 
                        ? 'bg-red-100 text-red-700 border border-red-200' 
                        : 'bg-orange-100 text-orange-700 border border-orange-200'
                    }`}>
                        {item.stock === 0 ? 'AGOTADO' : `${item.stock} un.`}
                    </div>
                 </div>
               ))
             )}
          </div>
        </div>

        {/* Recent Incoming Movements */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-blue-500" />
            Últimos Movimientos (Entradas)
          </h3>
          <div className="overflow-y-auto max-h-80">
            <table className="w-full text-sm text-left">
              <thead className="text-slate-400 font-medium">
                <tr>
                  <th className="pb-3">Fecha</th>
                  <th className="pb-3">Producto</th>
                  <th className="pb-3 text-right">Cant.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentEntries.map(m => {
                  const p = products.find(prod => prod.id === m.productId);
                  return (
                    <tr key={m.id}>
                      <td className="py-3 text-slate-500">{new Date(m.date).toLocaleDateString()}</td>
                      <td className="py-3">
                        <p className="text-slate-800 font-medium">{p?.name || 'Desconocido'}</p>
                        <p className="text-xs text-slate-400">{m.origin}</p>
                      </td>
                      <td className="py-3 text-right">
                         <span className="text-green-600 font-bold">+{m.quantity}</span>
                      </td>
                    </tr>
                  );
                })}
                {recentEntries.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-slate-400 py-4">No hay movimientos recientes.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 3. CASHIER DASHBOARD (Today's Sales Only) ---
const CashierDashboard: React.FC = () => {
  const { sales, getDailyCashTotal } = useStore();
  
  const today = new Date().toISOString().split('T')[0];
  const todaysSales = sales.filter(s => s.date.startsWith(today));
  const totalToday = getDailyCashTotal();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Summary Cards for Today */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-500/20">
           <div className="flex items-center gap-3 mb-2 opacity-80">
              <DollarSign size={20} />
              <span className="font-medium">Total Caja (Efectivo)</span>
           </div>
           <div className="text-4xl font-bold mb-4">
             ${totalToday.toLocaleString()}
           </div>
           <div className="text-sm opacity-60 bg-white/10 inline-block px-2 py-1 rounded">
             Acumulado Hoy
           </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
           <div className="flex items-center gap-3 mb-2 text-slate-500">
              <ShoppingBag size={20} />
              <span className="font-medium">Transacciones Hoy</span>
           </div>
           <div className="text-4xl font-bold text-slate-800 mb-4">
             {todaysSales.length}
           </div>
           <div className="text-sm text-green-600 bg-green-50 inline-block px-2 py-1 rounded">
             Registros activos
           </div>
        </div>
      </div>

      {/* List of Today's Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Historial de Ventas (Hoy: {today})</h3>
          <span className="text-xs text-slate-400 italic">Solo visible ventas del turno/día actual</span>
        </div>
        
        {todaysSales.length === 0 ? (
           <div className="p-12 text-center text-slate-400">
             <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
             <p>Aún no hay ventas registradas el día de hoy.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3">Hora</th>
                  <th className="px-6 py-3">Detalle</th>
                  <th className="px-6 py-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todaysSales.slice().reverse().map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        {sale.items.map((item, idx) => (
                           <span key={idx} className="text-slate-700">
                             {item.quantity}x {item.productName} <span className="text-slate-400 text-xs">({item.size}/{item.color})</span>
                           </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      ${sale.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Shared Components ---

const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
      <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
        <Icon className={color.replace('bg-', 'text-')} size={20} />
      </div>
    </div>
    <div className="flex items-baseline space-x-2">
      <h2 className="text-2xl font-bold text-slate-800">{value}</h2>
    </div>
    {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
  </div>
);

export default Dashboard;
