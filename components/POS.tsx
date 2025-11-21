import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Product, Variant, ProductCategory } from '../types';
import { Search, ShoppingCart, Trash2, CreditCard, CheckCircle, Layers, X } from 'lucide-react';

interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  maxStock: number;
}

const POS: React.FC = () => {
  const { products, createSale } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Filter logic
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.active);

    if (selectedCategory !== 'TODOS') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lower) || 
        p.sku.toLowerCase().includes(lower) ||
        p.subCategory.toLowerCase().includes(lower)
      );
    }
    return result;
  }, [products, searchTerm, selectedCategory]);

  const addToCart = (product: Product, variant: Variant) => {
    if (variant.stock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.variantId === variant.id);
      if (existing) {
        if (existing.quantity >= variant.stock) return prev; 
        return prev.map(item => 
          item.variantId === variant.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        sku: product.sku,
        size: variant.size,
        color: variant.color,
        price: product.price,
        quantity: 1,
        maxStock: variant.stock
      }];
    });
  };

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(item => item.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.variantId === variantId) {
        const newQty = item.quantity + delta;
        if (newQty > 0 && newQty <= item.maxStock) {
          return { ...item, quantity: newQty };
        }
      }
      return item;
    }));
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckoutClick = () => {
    setIsConfirmOpen(true);
  };

  const confirmSale = () => {
    try {
      createSale(cart.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity
      })));
      setCart([]);
      setIsConfirmOpen(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (e: any) {
      alert(e.message);
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] lg:-m-8">
      <div className="flex flex-col lg:flex-row h-full">
        
        {/* Left Side: Product Browser */}
        <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950/50 border-r border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
          
          {/* Header & Filters */}
          <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Punto de Venta</h2>
              <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">En Línea</span>
            </div>
            
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-colors"
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button 
                onClick={() => setSelectedCategory('TODOS')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === 'TODOS' 
                  ? 'bg-slate-800 text-white dark:bg-slate-700' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Todos
              </button>
              {Object.values(ProductCategory).map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat 
                    ? 'bg-slate-800 text-white dark:bg-slate-700' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Layers size={48} className="mb-4 opacity-20" />
                <p>No se encontraron productos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-full transition-colors">
                    <div className="p-4 border-b border-slate-50 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-tight">{product.name}</h3>
                        <span className="font-bold text-primary bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg text-sm">
                          ${product.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{product.category} • {product.sku}</p>
                    </div>
                    
                    <div className="p-4 pt-2 flex-1 flex flex-col justify-end">
                      <span className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wider">Seleccionar variante:</span>
                      <div className="flex flex-wrap gap-2">
                        {product.variants.map(variant => (
                          <button
                            key={variant.id}
                            onClick={() => addToCart(product, variant)}
                            disabled={variant.stock === 0}
                            className={`
                              group relative flex flex-col items-center justify-center min-w-[3rem] px-2 py-1.5 rounded-lg text-xs border transition-all
                              ${variant.stock === 0 
                                ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-primary shadow-sm'}
                            `}
                          >
                            <span className="font-bold">{variant.size}</span>
                            <span className="text-[10px] truncate max-w-[60px]">{variant.color}</span>
                            {variant.stock > 0 && variant.stock < 4 && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Cart */}
        <div className="w-full lg:w-96 bg-white dark:bg-slate-900 flex flex-col h-[40vh] lg:h-full shadow-2xl z-20 transition-colors border-l border-slate-200 dark:border-slate-800">
          <div className="p-6 bg-slate-900 dark:bg-slate-950 text-white flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                 <ShoppingCart size={24} />
                 <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                   {cart.reduce((acc, i) => acc + i.quantity, 0)}
                 </span>
              </div>
              <h3 className="text-xl font-bold">Carrito</h3>
            </div>
            <button onClick={() => setCart([])} className="text-slate-400 hover:text-white text-sm">Vaciar</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900/50">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-60">
                <ShoppingCart size={48} strokeWidth={1.5} />
                <p className="font-medium">El carrito está vacío</p>
                <p className="text-xs text-center max-w-[200px]">Seleccione productos del panel izquierdo para comenzar una venta.</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.variantId} className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 transition-colors">
                  <div className="flex-1 min-w-0 mr-3">
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">{item.productName}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{item.size}</span>
                      <span className="truncate">{item.color}</span>
                    </div>
                    <p className="text-primary font-bold text-sm mt-1">${(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                     <button 
                        onClick={() => removeFromCart(item.variantId)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5">
                      <button 
                        onClick={() => updateQuantity(item.variantId, -1)}
                        className="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-800 rounded-md shadow-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium text-lg leading-none transition-colors"
                      >-</button>
                      <span className="w-8 text-center text-sm font-bold text-slate-800 dark:text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.variantId, 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-800 rounded-md shadow-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium text-lg leading-none transition-colors"
                      >+</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="space-y-2 mb-6">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-sm">
                 <span>Subtotal</span>
                 <span>${totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-900 dark:text-white">
                <span className="text-lg font-bold">Total a Pagar</span>
                <span className="text-3xl font-black">${totalAmount.toLocaleString()}</span>
              </div>
            </div>
            
            <button
              onClick={handleCheckoutClick}
              disabled={cart.length === 0}
              className={`
                w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98]
                ${cart.length === 0 
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed' 
                  : 'bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'}
              `}
            >
              {showSuccess ? (
                <>
                  <CheckCircle size={24} />
                  <span>¡Venta Registrada!</span>
                </>
              ) : (
                <>
                  <CreditCard size={24} />
                  <span>Confirmar Pago (Efectivo)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden scale-100 animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Confirmar Venta</h3>
              <button onClick={() => setIsConfirmOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 dark:text-slate-300">¿Está seguro de procesar esta venta por el siguiente monto?</p>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-3">
                <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>Cant. Productos</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{cart.reduce((acc, i) => acc + i.quantity, 0)} unidades</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-center">
                  <span className="font-bold text-slate-800 dark:text-white">Total Final</span>
                  <span className="text-2xl font-black text-primary">${totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-xs text-yellow-800 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-900/30 flex gap-2">
                 <CreditCard size={16} />
                 <span>Método de pago registrado: <strong>Efectivo</strong></span>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3 bg-slate-50 dark:bg-slate-900">
              <button 
                onClick={() => setIsConfirmOpen(false)} 
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmSale} 
                className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;