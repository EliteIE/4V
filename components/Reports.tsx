
import React, { useMemo } from 'react';
import { useStore } from '../store';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { TrendingUp, Award, PieChart as PieIcon, Layers } from 'lucide-react';

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#cbd5e1'];
const PIE_COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

const Reports: React.FC = () => {
  const { sales, products, brands } = useStore();

  // --- Data Processing ---

  // 1. Top Selling Products & Stock Rotation Data
  const productPerformance = useMemo(() => {
    const performanceMap = new Map<string, { 
      id: string; 
      name: string; 
      sold: number; 
      revenue: number; 
      currentStock: number;
      category: string;
    }>();

    // Initialize with products to ensure we list items even with 0 sales
    products.forEach(p => {
      const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
      performanceMap.set(p.id, {
        id: p.id,
        name: p.name,
        sold: 0,
        revenue: 0,
        currentStock: totalStock,
        category: p.category
      });
    });

    // Aggregate Sales
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const entry = performanceMap.get(item.productId);
        if (entry) {
          entry.sold += item.quantity;
          entry.revenue += item.subtotal;
        }
      });
    });

    return Array.from(performanceMap.values());
  }, [sales, products]);

  const topSellingProducts = [...productPerformance]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  // 2. Sales by Category
  const categoryData = useMemo(() => {
    const grouped: Record<string, number> = {};
    productPerformance.forEach(p => {
      if (p.sold > 0) {
        grouped[p.category] = (grouped[p.category] || 0) + p.revenue;
      }
    });
    return Object.keys(grouped).map(key => ({ name: key, value: grouped[key] }));
  }, [productPerformance]);

  // 3. Sales by Brand
  const brandData = useMemo(() => {
    const grouped: Record<string, number> = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const brand = brands.find(b => b.id === product.brandId);
          const brandName = brand ? brand.name : 'Desconocido';
          grouped[brandName] = (grouped[brandName] || 0) + item.quantity;
        }
      });
    });

    return Object.keys(grouped)
      .map(key => ({ name: key, value: grouped[key] }))
      .sort((a, b) => b.value - a.value);
  }, [sales, products, brands]);


  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
          <TrendingUp size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reportes y Estadísticas</h2>
          <p className="text-slate-500">Análisis de rendimiento comercial y rotación de inventario</p>
        </div>
      </div>

      {/* Row 1: Top Products & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Selling Products Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Award className="text-yellow-500" size={20} />
            Productos Más Vendidos (Unidades)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSellingProducts} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120} 
                  tick={{fontSize: 11, fill: '#64748b'}} 
                />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sold" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={24} name="Unidades Vendidas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PieIcon className="text-green-500" size={20} />
            Ingresos por Categoría
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Brand Analysis & Stock Rotation Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales by Brand */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Layers className="text-indigo-500" size={20} />
            Ventas por Marca (Unidades)
          </h3>
          <div className="space-y-4">
            {brandData.map((item, idx) => (
              <div key={idx} className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div className="font-semibold text-sm text-slate-700">
                    {item.name}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-slate-600">
                      {item.value}
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-100">
                  <div 
                    style={{ width: `${(item.value / Math.max(...brandData.map(b => b.value))) * 100}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Rotation Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Rotación de Inventario</h3>
            <p className="text-sm text-slate-500">Comparativa: Ventas acumuladas vs Stock Actual</p>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Producto</th>
                  <th className="px-6 py-3 font-medium text-center">Ventas Históricas</th>
                  <th className="px-6 py-3 font-medium text-center">Stock Actual</th>
                  <th className="px-6 py-3 font-medium text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productPerformance
                  .sort((a, b) => b.sold - a.sold) // Sort by most sold
                  .slice(0, 8) // Show top 8 movers
                  .map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {item.name}
                      <span className="block text-xs text-slate-400 font-normal">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-bold">
                        {item.sold} un.
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600 font-medium">
                      {item.currentStock} un.
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.sold > item.currentStock && item.currentStock < 5 ? (
                        <span className="text-xs font-bold text-red-500 flex items-center justify-center gap-1">
                          Alta Rotación / Reponer
                        </span>
                      ) : item.sold === 0 ? (
                        <span className="text-xs font-bold text-slate-400">
                          Sin Movimiento
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-blue-500">
                          Estable
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
             <span className="text-xs text-slate-400">Mostrando los 8 productos con mayor movimiento</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
