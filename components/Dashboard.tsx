
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Role, MovementType } from '../types';
import { Card, CardHeader, CardTitle, CardContent, Badge } from './UI'; 
import { useTheme } from './ThemeContext';
import { 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  Archive, 
  Clock,
  Calendar
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hola, {currentUser.name.split(' ')[0]}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Aquí tienes un resumen de lo que sucede hoy.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-md shadow-sm">
           <Calendar size={16} className="text-slate-500 dark:text-slate-400" />
           <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
             {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
           </span>
        </div>
      </div>

      {/* Render specific dashboard based on Role */}
      {currentUser.role === Role.ADMIN && <AdminDashboard />}
      {currentUser.role === Role.STOCK && <StockDashboard />}
      {currentUser.role === Role.CASHIER && <CashierDashboard />}
    </div>
  );
};

// --- 1. ADMIN DASHBOARD ---
const AdminDashboard: React.FC = () => {
  const { sales } = useStore();
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');

  // Filter Logic (Simplified for brevity)
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
      return true;
    });
  }, [sales, timeRange]);

  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalTx = filteredSales.length;
  const itemsSold = filteredSales.reduce((acc, s) => acc + s.items.reduce((iAcc, i) => iAcc + i.quantity, 0), 0);

  const chartData = useMemo(() => {
    const grouped: {[key: string]: number} = {};
    filteredSales.forEach(s => {
      const d = new Date(s.date);
      const key = timeRange === 'day' 
        ? d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        : d.toLocaleDateString('es-AR', {day: 'numeric', month: 'short'});
      grouped[key] = (grouped[key] || 0) + s.total;
    });
    return Object.keys(grouped).map(k => ({ name: k, total: grouped[k] }));
  }, [filteredSales, timeRange]);

  const chartGridColor = theme === 'dark' ? '#334155' : '#f1f5f9';
  const chartTextColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const tooltipBg = theme === 'dark' ? '#1e293b' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#334155' : '#e2e8f0';

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Ingresos Totales" 
          value={`$${totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          trend="+12%"
        />
        <StatCard 
          title="Ventas Realizadas" 
          value={totalTx} 
          icon={ShoppingBag} 
          trend="+5%"
        />
        <StatCard 
          title="Artículos Vendidos" 
          value={itemsSold} 
          icon={Package} 
          trend="+8%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Evolución de Ventas</CardTitle>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {(['day', 'week', 'month'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    timeRange === range 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {range === 'day' ? 'Hoy' : range === 'week' ? 'Semana' : 'Mes'}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontSize: 12}} tickFormatter={(val) => `$${val}`} />
                    <Tooltip 
                      cursor={{fill: theme === 'dark' ? '#334155' : '#f8fafc'}}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: `1px solid ${tooltipBorder}`, 
                        backgroundColor: tooltipBg,
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        color: theme === 'dark' ? '#fff' : '#000'
                      }}
                    />
                    <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </CardContent>
        </Card>

        {/* Recent Transactions List */}
        <Card className="col-span-1">
           <CardHeader>
             <CardTitle>Últimas Ventas</CardTitle>
           </CardHeader>
           <CardContent className="px-0">
              <div className="overflow-y-auto max-h-[300px]">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredSales.slice().reverse().slice(0, 6).map(sale => (
                      <tr key={sale.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-3">
                          <p className="font-medium text-slate-900 dark:text-white text-xs">
                            {new Date(sale.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                          </p>
                        </td>
                        <td className="px-6 py-3">
                           <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[100px]">
                             {sale.items.length} items
                           </p>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className="font-semibold text-slate-900 dark:text-white text-xs">
                            ${sale.total.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredSales.length === 0 && (
                       <tr><td colSpan={3} className="text-center py-8 text-slate-400 text-xs">Sin datos</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- 2. STOCK DASHBOARD ---
const StockDashboard: React.FC = () => {
  const { products, movements } = useStore();

  const totalProducts = products.length;
  const lowStockVariants = products.flatMap(p => 
    p.variants.filter(v => v.stock < 5).map(v => ({
      productName: p.name,
      sku: p.sku,
      variant: `${v.color} - ${v.size}`,
      stock: v.stock
    }))
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Productos Activos" 
          value={totalProducts} 
          icon={Package} 
        />
        <StatCard 
          title="Alertas Stock" 
          value={lowStockVariants.length} 
          icon={AlertTriangle} 
          variant={lowStockVariants.length > 0 ? "destructive" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-orange-500" size={18} />
              Alertas de Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
               {lowStockVariants.length === 0 ? (
                 <div className="text-slate-400 text-center py-8 text-sm">Todo en orden.</div>
               ) : (
                 lowStockVariants.map((item, i) => (
                   <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <div>
                        <p className="font-medium text-sm text-slate-900 dark:text-slate-200">{item.productName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.sku} • {item.variant}</p>
                      </div>
                      <Badge variant={item.stock === 0 ? "destructive" : "secondary"}>
                         {item.stock === 0 ? 'AGOTADO' : `${item.stock} un.`}
                      </Badge>
                   </div>
                 ))
               )}
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Clock className="text-blue-500" size={18} />
               Últimos Movimientos
             </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {movements.slice(0, 6).map(m => {
                   const isEntry = m.type === MovementType.ENTRADA;
                   return (
                    <div key={m.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full ${isEntry ? 'bg-green-500' : 'bg-slate-300'}`} />
                           <div>
                             <p className="font-medium text-slate-700 dark:text-slate-200">{new Date(m.date).toLocaleDateString()}</p>
                             <p className="text-xs text-slate-400 capitalize">{m.type.toLowerCase()}</p>
                           </div>
                        </div>
                        <span className={`font-mono font-bold ${isEntry ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          {isEntry ? '+' : '-'}{m.quantity}
                        </span>
                    </div>
                   )
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- 3. CASHIER DASHBOARD ---
const CashierDashboard: React.FC = () => {
  const { sales, getDailyCashTotal } = useStore();
  const today = new Date().toISOString().split('T')[0];
  const todaysSales = sales.filter(s => s.date.startsWith(today));
  const totalToday = getDailyCashTotal();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-slate-900 dark:bg-blue-950 text-white shadow-lg">
           <div className="flex items-center gap-2 mb-4 opacity-80">
              <DollarSign size={20} />
              <span className="font-medium">Caja Actual (Efectivo)</span>
           </div>
           <div className="text-4xl font-bold tracking-tight mb-2">
             ${totalToday.toLocaleString()}
           </div>
           <div className="text-sm text-slate-400 dark:text-blue-200">
             Acumulado del día {new Date().toLocaleDateString()}
           </div>
        </div>
        
        <StatCard 
          title="Tickets Emitidos Hoy" 
          value={todaysSales.length} 
          icon={ShoppingBag} 
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transacciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="pb-3 font-medium">Hora</th>
                <th className="pb-3 font-medium">Detalle</th>
                <th className="pb-3 font-medium text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {todaysSales.slice().reverse().map(sale => (
                <tr key={sale.id}>
                  <td className="py-4 text-slate-500 dark:text-slate-400">
                    {new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td className="py-4 text-slate-700 dark:text-slate-200">
                    {sale.items.length} productos
                  </td>
                  <td className="py-4 text-right font-bold text-slate-900 dark:text-white">
                    ${sale.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Shared Internal Components ---

const StatCard = ({ title, value, icon: Icon, trend, variant = 'default' }: any) => (
  <Card className={variant === 'destructive' ? 'border-red-100 bg-red-50 dark:bg-red-950/20 dark:border-red-900' : ''}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <Icon className={`h-4 w-4 ${variant === 'destructive' ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`} />
      </div>
      <div className="flex items-baseline gap-2">
        <div className={`text-2xl font-bold ${variant === 'destructive' ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{value}</div>
        {trend && <span className="text-xs text-green-600 dark:text-green-400 font-medium">{trend}</span>}
      </div>
    </CardContent>
  </Card>
);

export default Dashboard;
