
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Product, Brand, Sale, StockMovement, CashClose, Role, ProductCategory, MovementType, Variant } from './types';

// --- Initial Mock Data ---

const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@cuatrovientos.com', role: Role.ADMIN, password: '123' },
  { id: 'u2', name: 'Encargado Depósito', email: 'stock@cuatrovientos.com', role: Role.STOCK, password: '123' },
  { id: 'u3', name: 'Cajero Principal', email: 'caja@cuatrovientos.com', role: Role.CASHIER, password: '123' },
];

const INITIAL_BRANDS: Brand[] = [
  { id: 'b1', name: 'Nike', type: 'Mixto' },
  { id: 'b2', name: 'Adidas', type: 'Mixto' },
  { id: 'b3', name: 'Cuatro Vientos', type: 'Indumentaria' },
  { id: 'b4', name: 'Puma', type: 'Calzado' },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    sku: 'NK-AIR-001',
    name: 'Air Force 1',
    brandId: 'b1',
    category: ProductCategory.CALZADO,
    subCategory: 'Zapatillas',
    description: 'Clásicas zapatillas blancas.',
    price: 120000,
    cost: 80000,
    active: true,
    variants: [
      { id: 'v1', productId: 'p1', size: '40', color: 'Blanco', stock: 10 },
      { id: 'v2', productId: 'p1', size: '41', color: 'Blanco', stock: 5 },
      { id: 'v3', productId: 'p1', size: '42', color: 'Blanco', stock: 2 },
    ]
  },
  {
    id: 'p2',
    sku: 'CV-REM-001',
    name: 'Remera Básica Logo',
    brandId: 'b3',
    category: ProductCategory.INDUMENTARIA,
    subCategory: 'Remeras',
    description: 'Algodón 100% peinado.',
    price: 15000,
    cost: 7000,
    active: true,
    variants: [
      { id: 'v4', productId: 'p2', size: 'S', color: 'Negro', stock: 20 },
      { id: 'v5', productId: 'p2', size: 'M', color: 'Negro', stock: 15 },
      { id: 'v6', productId: 'p2', size: 'L', color: 'Negro', stock: 8 },
      { id: 'v7', productId: 'p2', size: 'M', color: 'Blanco', stock: 12 },
    ]
  }
];

// --- Context Definition ---

interface AppState {
  currentUser: User | null;
  users: User[];
  products: Product[];
  brands: Brand[];
  sales: Sale[];
  movements: StockMovement[];
  cashCloses: CashClose[];
  login: (email: string) => boolean;
  logout: () => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'date'>) => void;
  createSale: (saleItems: { variantId: string; quantity: number; productId: string }[]) => void;
  closeCash: (reportedAmount: number, notes: string) => void;
  getDailyCashTotal: () => number;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or defaults
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('cv_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [users] = useState<User[]>(INITIAL_USERS);
  const [brands] = useState<Brand[]>(INITIAL_BRANDS);

  const [products, setProducts] = useState<Product[]>(() => {
    const stored = localStorage.getItem('cv_products');
    return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const stored = localStorage.getItem('cv_sales');
    return stored ? JSON.parse(stored) : [];
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    const stored = localStorage.getItem('cv_movements');
    return stored ? JSON.parse(stored) : [];
  });

  const [cashCloses, setCashCloses] = useState<CashClose[]>(() => {
    const stored = localStorage.getItem('cv_cash_closes');
    return stored ? JSON.parse(stored) : [];
  });

  // Persistence Effects
  useEffect(() => { localStorage.setItem('cv_user', JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem('cv_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('cv_sales', JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem('cv_movements', JSON.stringify(movements)); }, [movements]);
  useEffect(() => { localStorage.setItem('cv_cash_closes', JSON.stringify(cashCloses)); }, [cashCloses]);

  // Actions
  const login = (email: string) => {
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newId = Math.random().toString(36).substr(2, 9);
    
    // Ensure variants have IDs
    const variantsWithIds = productData.variants.map(v => ({
      ...v,
      id: v.id || Math.random().toString(36).substr(2, 9),
      productId: newId
    }));

    const newProduct: Product = {
      ...productData,
      id: newId,
      variants: variantsWithIds
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const addStockMovement = (data: Omit<StockMovement, 'id' | 'date'>) => {
    const newMovement: StockMovement = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString()
    };

    // Update actual stock count in product variant
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        if (p.id === data.productId) {
          const updatedVariants = p.variants.map(v => {
            if (v.id === data.variantId) {
              let qty = v.stock;
              if (data.type === MovementType.ENTRADA) {
                 qty += data.quantity;
              } else if (data.type === MovementType.SALIDA) {
                 qty -= data.quantity;
              } else if (data.type === MovementType.AJUSTE) {
                 // For this demo, AJUSTE implies adding/removing a difference.
                 // Or we could treat it as 'Set to X'. 
                 // Let's treat it as a delta for simplicity unless specified.
                 // But usually adjustment is + or -. 
                 // For safety here, we assume input quantity is the delta.
                 // If negative delta, subtract.
                 qty += data.quantity; 
              }
              return { ...v, stock: qty };
            }
            return v;
          });
          return { ...p, variants: updatedVariants };
        }
        return p;
      });
    });

    setMovements(prev => [newMovement, ...prev]);
  };

  const createSale = (itemsRequest: { variantId: string; quantity: number; productId: string }[]) => {
    if (!currentUser) return;

    const saleItems: any[] = [];
    let total = 0;

    // We use a functional update inside a wrapper to ensure consistency, 
    // but React state updates are batched. 
    // We need to read current products to check stock first.
    
    // NOTE: In a real backend, this would be a transaction.
    
    // 1. Validate and Build Items
    const currentProducts = [...products];
    const itemsToDeduct: {productId: string, variantId: string, quantity: number}[] = [];

    itemsRequest.forEach(req => {
      const product = currentProducts.find(p => p.id === req.productId);
      if (!product) throw new Error("Producto no encontrado");
      
      const variant = product.variants.find(v => v.id === req.variantId);
      if (!variant) throw new Error("Variante no encontrada");

      if (variant.stock < req.quantity) {
        throw new Error(`Stock insuficiente para ${product.name} (${variant.size}/${variant.color})`);
      }

      const subtotal = product.price * req.quantity;
      total += subtotal;
      
      saleItems.push({
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        size: variant.size,
        color: variant.color,
        quantity: req.quantity,
        unitPrice: product.price,
        subtotal: subtotal
      });

      itemsToDeduct.push(req);
    });

    // 2. Execute Deductions & Record Movements
    itemsToDeduct.forEach(req => {
      addStockMovement({
        type: MovementType.SALIDA,
        productId: req.productId,
        variantId: req.variantId,
        quantity: req.quantity,
        userId: currentUser.id,
        origin: 'Venta Caja',
        notes: 'Venta Efectivo Local'
      });
    });

    // 3. Create Sale Record
    const newSale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      userId: currentUser.id,
      items: saleItems,
      total: total,
      paymentMethod: 'EFECTIVO'
    };

    setSales(prev => [newSale, ...prev]);
  };

  const getDailyCashTotal = () => {
    const today = new Date().toISOString().split('T')[0];
    return sales
      .filter(s => s.date.startsWith(today) && s.paymentMethod === 'EFECTIVO')
      .reduce((acc, curr) => acc + curr.total, 0);
  };

  const closeCash = (reportedAmount: number, notes: string) => {
    if (!currentUser) return;
    const systemAmount = getDailyCashTotal();
    const diff = reportedAmount - systemAmount;

    const close: CashClose = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      fullTimestamp: new Date().toISOString(),
      userId: currentUser.id,
      reportedAmount,
      systemAmount,
      difference: diff,
      notes
    };

    setCashCloses(prev => [close, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, products, brands, sales, movements, cashCloses,
      login, logout, addProduct, updateProduct, addStockMovement, createSale, closeCash, getDailyCashTotal
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useStore must be used within an AppProvider');
  }
  return context;
};
