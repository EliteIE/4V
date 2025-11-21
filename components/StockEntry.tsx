
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { MovementType, Product } from '../types';
import { PlusCircle, Save, Check, Package, Search, X, AlertCircle, ArrowRight, Trash2, Plus } from 'lucide-react';

interface QueueItem {
  product: Product;
  quantities: { [variantId: string]: string }; // Stores input values
  totalQty: number;
}

const StockEntry: React.FC = () => {
  const { products, addStockMovement, currentUser } = useStore();
  
  // Queue State (List of products to enter)
  const [entryQueue, setEntryQueue] = useState<QueueItem[]>([]);

  // Current Edit State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [tempQuantities, setTempQuantities] = useState<{[variantId: string]: string}>({});
  
  // Global State
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter products, excluding ones already in queue
  const filteredProducts = products.filter(p => 
    p.active && 
    !entryQueue.find(q => q.product.id === p.id) && // Exclude already added
    (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSelectProduct = (product: Product) => {
    setSelectedProductId(product.id);
    setSearchTerm(product.name);
    setIsDropdownOpen(false);
    setTempQuantities({});
  };

  const clearSelection = () => {
    setSelectedProductId('');
    setSearchTerm('');
    setTempQuantities({});
    setIsDropdownOpen(true);
  };

  const handleQuantityChange = (variantId: string, val: string) => {
    if (val === '' || /^\d+$/.test(val)) {
      setTempQuantities(prev => ({ ...prev, [variantId]: val }));
    }
  };

  const getTempTotal = () => {
    return Object.values(tempQuantities).reduce((acc, val) => acc + (parseInt(val) || 0), 0);
  };

  const addToQueue = () => {
    if (!selectedProduct || getTempTotal() === 0) return;

    const newItem: QueueItem = {
      product: selectedProduct,
      quantities: { ...tempQuantities },
      totalQty: getTempTotal()
    };

    setEntryQueue([...entryQueue, newItem]);
    
    // Reset Selection
    setSelectedProductId('');
    setSearchTerm('');
    setTempQuantities({});
  };

  const removeFromQueue = (index: number) => {
    const newQueue = [...entryQueue];
    newQueue.splice(index, 1);
    setEntryQueue(newQueue);
  };

  const handlePreSubmit = () => {
    if (!currentUser || entryQueue.length === 0) return;
    setIsConfirmOpen(true);
  };

  const confirmBatchEntry = () => {
    if (!currentUser) return;

    // Process all items in queue
    entryQueue.forEach(item => {
      Object.entries(item.quantities).forEach(([variantId, qtyStr]) => {
        const qty = parseInt(qtyStr);
        if (qty > 0) {
          addStockMovement({
            type: MovementType.ENTRADA,
            productId: item.product.id,
            variantId: variantId,
            quantity: qty,
            userId: currentUser.id,
            origin: 'Entrada Masiva',
            notes: notes || 'Reposición de stock'
          });
        }
      });
    });

    setIsConfirmOpen(false);
    setSuccess(true);
    setEntryQueue([]);
    setNotes('');
    setTimeout(() => setSuccess(false), 3000);
  };

  // Computed totals for the summary
  const totalQueueItems = entryQueue.length;
  const totalQueueUnits = entryQueue.reduce((acc, item) => acc + item.totalQty, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <PlusCircle size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Entrada de Mercadería</h2>
            <p className="text-slate-500">Carga masiva de stock al depósito</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Input Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Selector Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              Agregar Producto a la Lista
            </h3>
             
            {/* Search */}
            <div className="mb-6" ref={dropdownRef}>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                   <Search size={20} />
                </div>
                
                <input
                  type="text"
                  className={`w-full pl-10 pr-10 py-3 border ${isDropdownOpen ? 'border-primary ring-2 ring-primary/20' : 'border-slate-300'} rounded-lg focus:outline-none bg-white text-slate-800 transition-all placeholder-slate-400`}
                  placeholder="Buscar producto para agregar..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if(selectedProductId) setSelectedProductId(''); 
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                />
                
                {searchTerm && (
                    <button 
                        onClick={clearSelection}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        <X size={18} />
                    </button>
                )}

                {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {filteredProducts.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 text-sm">
                                {entryQueue.length > 0 && products.some(p => p.name.includes(searchTerm)) 
                                  ? "El producto ya está en la lista."
                                  : "No se encontraron productos."}
                            </div>
                        ) : (
                            filteredProducts.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => handleSelectProduct(p)}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-0 transition-colors group"
                                >
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors">{p.name}</p>
                                        <p className="text-xs text-slate-500">{p.sku} • {p.category}</p>
                                    </div>
                                    <Plus size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                                </button>
                            ))
                        )}
                    </div>
                )}
              </div>
            </div>

            {/* Variants Input for Selected Product */}
            {selectedProduct ? (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-slate-800">{selectedProduct.name}</h3>
                        <p className="text-xs text-slate-500">{selectedProduct.sku}</p>
                    </div>
                    <button onClick={clearSelection} className="text-xs text-slate-400 hover:text-red-500 underline">Cancelar</button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {selectedProduct.variants.map(v => (
                    <div key={v.id} className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-xs text-slate-700">{v.size} <span className="text-slate-400">| {v.color}</span></span>
                        <span className="text-[10px] text-slate-400">Stock: {v.stock}</span>
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        className="w-full p-1.5 border border-slate-200 rounded text-center font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={tempQuantities[v.id] || ''}
                        onChange={(e) => handleQuantityChange(v.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={addToQueue}
                        disabled={getTempTotal() === 0}
                        className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
                            getTempTotal() > 0 
                            ? 'bg-slate-800 text-white hover:bg-slate-900' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        <Plus size={16} />
                        Agregar a la Lista ({getTempTotal()} u.)
                    </button>
                </div>
              </div>
            ) : (
                <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    Busque un producto para definir cantidades
                </div>
            )}
          </div>

          {/* 2. List of items to be added */}
          <div>
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
               <span className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
               Lista de Entrada ({entryQueue.length})
            </h3>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[200px]">
                {entryQueue.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                        <Package size={48} className="mb-2 opacity-20" />
                        <p>La lista está vacía.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {entryQueue.map((item, idx) => (
                            <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-2">
                                        <h4 className="font-bold text-slate-800">{item.product.name}</h4>
                                        <span className="text-xs text-slate-500">{item.product.sku}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {Object.entries(item.quantities).map(([vid, qty]) => {
                                            const v = item.product.variants.find(rv => rv.id === vid);
                                            if (!v || parseInt(qty) <= 0) return null;
                                            return (
                                                <span key={vid} className="text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">
                                                    {v.size}/{v.color}: <strong>+{qty}</strong>
                                                </span>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 pl-4">
                                    <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                                        +{item.totalQty} u.
                                    </span>
                                    <button 
                                        onClick={() => removeFromQueue(idx)}
                                        className="text-slate-300 hover:text-red-500 transition-colors p-2"
                                        title="Quitar de la lista"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Summary & Confirm */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6 flex flex-col h-fit">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Resumen General</h3>
            
            <div className="space-y-4 mb-6 flex-1">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500 text-sm">Productos Diferentes</span>
                    <span className="font-bold text-slate-800">{totalQueueItems}</span>
                 </div>
                 <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                    <span className="text-slate-800 font-bold">Total Unidades</span>
                    <span className="font-bold text-2xl text-indigo-600">+{totalQueueUnits}</span>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">3. Observaciones</label>
                <textarea
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none h-32 text-sm"
                    placeholder="Ej: Remito N° 1234 - Proveedor Oficial..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={handlePreSubmit}
              disabled={entryQueue.length === 0}
              className={`
                w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all shadow-lg
                ${success 
                  ? 'bg-green-500 text-white'
                  : (entryQueue.length === 0)
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'}
              `}
            >
              {success ? (
                <>
                  <Check size={20} />
                  <span>¡Ingreso Exitoso!</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Confirmar Entrada Masiva</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
              <h3 className="text-xl font-bold text-slate-800">Confirmar Entrada Masiva</h3>
              <button onClick={() => setIsConfirmOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="flex items-start gap-3 text-slate-600 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <AlertCircle className="text-indigo-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm">
                   Se ingresarán un total de <strong>{totalQueueUnits} unidades</strong> distribuidas en <strong>{totalQueueItems} productos</strong>.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detalle de la operación</p>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100">
                   {entryQueue.map((item, idx) => (
                       <div key={idx} className="p-3 text-sm flex justify-between items-center">
                           <div>
                               <span className="font-bold text-slate-700 block">{item.product.name}</span>
                               <span className="text-xs text-slate-500">
                                   {Object.values(item.quantities).reduce((a,b) => a + (parseInt(b)||0), 0)} un. en total
                               </span>
                           </div>
                           <div className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">
                               Registrar
                           </div>
                       </div>
                   ))}
                </div>
              </div>

              {notes && (
                 <div className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg">
                    Nota asociada: "{notes}"
                 </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50 flex-shrink-0">
              <button 
                onClick={() => setIsConfirmOpen(false)} 
                className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmBatchEntry} 
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
              >
                Confirmar Todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockEntry;
