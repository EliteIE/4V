import React, { useState } from 'react';
import { useStore } from '../store';
import { Search, Edit2, Plus, X, Trash2 } from 'lucide-react';
import { ProductCategory, Product, Variant } from '../types';

const Inventory: React.FC = () => {
  const { products, updateProduct, addProduct, brands } = useStore();
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // -- Form State for New Product --
  const initialFormState: Omit<Product, 'id'> = {
    sku: '',
    name: '',
    brandId: '',
    category: ProductCategory.INDUMENTARIA,
    subCategory: '',
    description: '',
    price: 0,
    cost: 0,
    active: true,
    variants: []
  };

  const [formData, setFormData] = useState(initialFormState);
  
  // Temporary variant inputs
  const [tempVariant, setTempVariant] = useState({ size: '', color: '', stock: 0 });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    p.sku.toLowerCase().includes(filter.toLowerCase())
  );

  const toggleActive = (product: Product) => {
    updateProduct({ ...product, active: !product.active });
  };

  const getTotalStock = (p: Product) => p.variants.reduce((sum, v) => sum + v.stock, 0);

  const handleAddVariant = () => {
    if (!tempVariant.size || !tempVariant.color) return;
    
    const newVariant: Variant = {
      id: Math.random().toString(36).substr(2, 9), // Temporary ID
      productId: '',
      size: tempVariant.size.toUpperCase(),
      color: tempVariant.color,
      stock: tempVariant.stock
    };

    setFormData({ ...formData, variants: [...formData.variants, newVariant] });
    setTempVariant({ size: '', color: '', stock: 0 });
  };

  const removeVariant = (index: number) => {
    const newVariants = [...formData.variants];
    newVariants.splice(index, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.variants.length === 0) {
      alert('Debe agregar al menos una variante (Talle/Color).');
      return;
    }
    addProduct(formData);
    setIsModalOpen(false);
    setFormData(initialFormState);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Inventario</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Gestión de productos base y variantes</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400"
              placeholder="Buscar producto..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Producto</th>
                <th className="px-6 py-4 font-medium">Categoría</th>
                <th className="px-6 py-4 font-medium">Variantes / Stock</th>
                <th className="px-6 py-4 font-medium">Precios</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map(product => {
                const brandName = brands.find(b => b.id === product.brandId)?.name || '---';
                const stock = getTotalStock(product);
                return (
                  <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-base">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{product.sku}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{brandName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                        {product.category}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{product.subCategory}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className={`text-lg font-bold ${stock < 5 ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>
                          {stock}
                        </span>
                        <span className="text-xs text-slate-400">unidades totales</span>
                      </div>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {product.variants.map(v => (
                          <span key={v.id} title={`${v.color} - ${v.size}`} className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm">
                            {v.size}: <span className="font-semibold">{v.stock}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700 dark:text-slate-200">${product.price.toLocaleString()}</span>
                        {product.cost > 0 && (
                          <span className="text-xs text-slate-400">Costo: ${product.cost.toLocaleString()}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                         onClick={() => toggleActive(product)}
                         className={`text-xs font-bold px-2 py-1 rounded-full flex items-center w-fit ${
                           product.active 
                             ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                             : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                         }`}
                      >
                        {product.active ? 'ACTIVO' : 'INACTIVO'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary rounded-lg transition-colors">
                          <Edit2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500">
            No se encontraron productos.
          </div>
        )}
      </div>

      {/* ADD PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Nuevo Producto</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Complete la información base y genere variantes.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              
              {/* Section 1: Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                   <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Información General</h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre del Producto</label>
                  <input 
                    required
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-slate-900 dark:text-white"
                    placeholder="Ej: Remera Nike Logo"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Código Interno / SKU</label>
                  <input 
                    required
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-slate-900 dark:text-white"
                    placeholder="Ej: NK-REM-001"
                    value={formData.sku}
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Marca</label>
                  <select 
                    required
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                    value={formData.brandId}
                    onChange={e => setFormData({...formData, brandId: e.target.value})}
                  >
                    <option value="">Seleccione Marca...</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoría</label>
                    <select 
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value as ProductCategory})}
                    >
                      {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sub-Categoría</label>
                    <input 
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                      placeholder="Ej: Remeras"
                      value={formData.subCategory}
                      onChange={e => setFormData({...formData, subCategory: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Precio Venta ($)</label>
                  <input 
                    type="number"
                    min="0"
                    required
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                    value={formData.price || ''}
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                  />
                </div>

                 <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Costo Unitario ($) <span className="text-slate-400 font-normal">(Opcional)</span></label>
                  <input 
                    type="number"
                    min="0"
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                    value={formData.cost || ''}
                    onChange={e => setFormData({...formData, cost: parseFloat(e.target.value)})}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
                  <textarea 
                    rows={2}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none text-slate-900 dark:text-white"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              {/* Section 2: Variants */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Variantes (Stock Inicial)</h4>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-4">
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="w-24">
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Talle</label>
                      <input 
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md text-sm text-slate-900 dark:text-white outline-none focus:border-primary"
                        placeholder="S, 40..."
                        value={tempVariant.size}
                        onChange={e => setTempVariant({...tempVariant, size: e.target.value})}
                      />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Color</label>
                      <input 
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md text-sm text-slate-900 dark:text-white outline-none focus:border-primary"
                        placeholder="Rojo, Azul..."
                        value={tempVariant.color}
                        onChange={e => setTempVariant({...tempVariant, color: e.target.value})}
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Stock Inicial</label>
                      <input 
                        type="number"
                        min="0"
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md text-sm text-slate-900 dark:text-white outline-none focus:border-primary"
                        value={tempVariant.stock}
                        onChange={e => setTempVariant({...tempVariant, stock: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={handleAddVariant}
                      className="bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors mb-[1px]"
                    >
                      Agregar
                    </button>
                  </div>
                </div>

                {formData.variants.length > 0 ? (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="px-4 py-2">Talle</th>
                          <th className="px-4 py-2">Color</th>
                          <th className="px-4 py-2">Stock Inicial</th>
                          <th className="px-4 py-2 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {formData.variants.map((v, idx) => (
                          <tr key={idx} className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                            <td className="px-4 py-2 font-medium">{v.size}</td>
                            <td className="px-4 py-2">{v.color}</td>
                            <td className="px-4 py-2">{v.stock}</td>
                            <td className="px-4 py-2 text-right">
                              <button type="button" onClick={() => removeVariant(idx)} className="text-red-400 hover:text-red-600">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic text-center py-4">Agregue al menos una variante arriba.</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;