import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InventoryItem, Category, InventoryStats, Sale, SaleItem, SalesStats, Supplier, PurchaseOrder } from '../types/inventory';

interface InventoryContextType {
  items: InventoryItem[];
  categories: Category[];
  sales: Sale[];
  addItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  updateItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  getStats: () => InventoryStats;
  getItemById: (id: string) => InventoryItem | undefined;
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => Sale;
  clearSales: () => void;
  getSalesStats: () => SalesStats;
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  getSupplierById: (id: string) => Supplier | undefined;
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (purchaseOrder: Omit<PurchaseOrder, 'id' | 'date'>) => void;
  updatePurchaseOrder: (id: string, purchaseOrder: Partial<PurchaseOrder>) => void;
  receivePurchaseOrder: (id: string) => void;
  deletePurchaseOrder: (id: string) => void;
  getSaleById: (id: string) => Sale | undefined;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEY_ITEMS = 'inventory_items';
const STORAGE_KEY_CATEGORIES = 'inventory_categories';
const STORAGE_KEY_SALES = 'inventory_sales';
const STORAGE_KEY_SUPPLIERS = 'inventory_suppliers';
const STORAGE_KEY_PURCHASE_ORDERS = 'inventory_purchase_orders';

// Données initiales
const initialCategories: Category[] = [
  { id: '1', name: 'Électronique', description: 'Appareils et composants électroniques' },
  { id: '2', name: 'Mobilier', description: 'Meubles de bureau' },
  { id: '3', name: 'Fournitures', description: 'Fournitures de bureau' },
  { id: '4', name: 'Outillage', description: 'Outils et équipements' },
];

const initialItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Ordinateur portable Dell XPS 15',
    description: 'Intel i7, 16GB RAM, 512GB SSD',
    category: 'Électronique',
    quantity: 12,
    minQuantity: 5,
    price: 1299.99,
    sku: 'DELL-XPS15-001',
    supplier: 'Dell Inc.',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Chaise de bureau ergonomique',
    description: 'Chaise ergonomique avec support lombaire',
    category: 'Mobilier',
    quantity: 3,
    minQuantity: 10,
    price: 249.99,
    sku: 'CHAIR-ERG-001',
    supplier: 'Office Furniture Co.',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Ramette papier A4',
    description: 'Papier blanc 80g/m², 500 feuilles',
    category: 'Fournitures',
    quantity: 45,
    minQuantity: 20,
    price: 4.99,
    sku: 'PAPER-A4-500',
    supplier: 'Paper World',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Souris sans fil Logitech',
    description: 'Souris ergonomique 2.4GHz',
    category: 'Électronique',
    quantity: 8,
    minQuantity: 15,
    price: 29.99,
    sku: 'MOUSE-LOG-001',
    supplier: 'Logitech',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Perceuse sans fil',
    description: 'Perceuse 18V avec batterie lithium',
    category: 'Outillage',
    quantity: 6,
    minQuantity: 3,
    price: 159.99,
    sku: 'DRILL-18V-001',
    supplier: 'Tools Pro',
    lastUpdated: new Date().toISOString(),
  },
];

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_ITEMS);
    return stored ? JSON.parse(stored) : initialItems;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    return stored ? JSON.parse(stored) : initialCategories;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_SALES);
    return stored ? JSON.parse(stored) : [];
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_SUPPLIERS);
    return stored ? JSON.parse(stored) : [];
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_PURCHASE_ORDERS);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SUPPLIERS, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PURCHASE_ORDERS, JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  const addItem = (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString(),
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    setItems(items.map(item =>
      item.id === id
        ? { ...item, ...updates, lastUpdated: new Date().toISOString() }
        : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };
    setCategories([...categories, newCategory]);
  };

  const deleteCategory = (id: string) => {
    const categoryToDelete = categories.find(cat => cat.id === id);
    if (categoryToDelete) {
      // Vérifier si des items utilisent cette catégorie
      const itemsInCategory = items.filter(item => item.category === categoryToDelete.name);
      if (itemsInCategory.length > 0) {
        alert(`Impossible de supprimer la catégorie "${categoryToDelete.name}" car elle contient ${itemsInCategory.length} article(s).`);
        return;
      }
    }
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const getStats = (): InventoryStats => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const lowStockItems = items.filter(item => item.quantity <= item.minQuantity).length;

    return {
      totalItems,
      totalValue,
      lowStockItems,
      categories: categories.length,
    };
  };

  const getItemById = (id: string): InventoryItem | undefined => {
    return items.find(item => item.id === id);
  };

  const addSale = (sale: Omit<Sale, 'id' | 'date'>) => {
    const newSale: Sale = {
      ...sale,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };

    // Mettre à jour les quantités en stock
    const updatedItems = [...items];
    sale.items.forEach(saleItem => {
      const itemIndex = updatedItems.findIndex(item => item.id === saleItem.itemId);
      if (itemIndex !== -1) {
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          quantity: updatedItems[itemIndex].quantity - saleItem.quantity,
          lastUpdated: new Date().toISOString(),
        };
      }
    });

    setItems(updatedItems);
    setSales([newSale, ...sales]);
    return newSale;
  };

  const clearSales = () => {
    setSales([]);
  };

  const getSalesStats = (): SalesStats => {
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = sales
      .filter(sale => new Date(sale.date) >= today)
      .reduce((sum, sale) => sum + sale.total, 0);

    const averageTransaction = totalSales > 0 ? totalRevenue / totalSales : 0;

    return {
      totalSales,
      totalRevenue,
      todayRevenue,
      averageTransaction,
    };
  };

  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: Date.now().toString(),
    };
    setSuppliers([...suppliers, newSupplier]);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(suppliers.map(supplier =>
      supplier.id === id
        ? { ...supplier, ...updates }
        : supplier
    ));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(supplier => supplier.id !== id));
  };

  const getSupplierById = (id: string): Supplier | undefined => {
    return suppliers.find(supplier => supplier.id === id);
  };

  const addPurchaseOrder = (purchaseOrder: Omit<PurchaseOrder, 'id' | 'date'>) => {
    const newPurchaseOrder: PurchaseOrder = {
      ...purchaseOrder,
      id: Date.now().toString(),
      orderDate: new Date().toISOString(),
    };

    // Mettre à jour les quantités en stock
    const updatedItems = [...items];
    purchaseOrder.items.forEach(purchaseItem => {
      const itemIndex = updatedItems.findIndex(item => item.id === purchaseItem.itemId);
      if (itemIndex !== -1) {
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          quantity: updatedItems[itemIndex].quantity + purchaseItem.quantity,
          lastUpdated: new Date().toISOString(),
        };
      }
    });

    setItems(updatedItems);
    setPurchaseOrders([newPurchaseOrder, ...purchaseOrders]);
  };

  const updatePurchaseOrder = (id: string, updates: Partial<PurchaseOrder>) => {
    setPurchaseOrders(purchaseOrders.map(purchaseOrder =>
      purchaseOrder.id === id
        ? { ...purchaseOrder, ...updates }
        : purchaseOrder
    ));
  };

  const receivePurchaseOrder = (id: string) => {
    const purchaseOrder = purchaseOrders.find(po => po.id === id);
    if (purchaseOrder) {
      // Mettre à jour les quantités en stock
      const updatedItems = [...items];
      purchaseOrder.items.forEach(purchaseItem => {
        const itemIndex = updatedItems.findIndex(item => item.id === purchaseItem.itemId);
        if (itemIndex !== -1) {
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            quantity: updatedItems[itemIndex].quantity + purchaseItem.quantity,
            lastUpdated: new Date().toISOString(),
          };
        }
      });

      setItems(updatedItems);
      setPurchaseOrders(purchaseOrders.filter(po => po.id !== id));
    }
  };

  const deletePurchaseOrder = (id: string) => {
    setPurchaseOrders(purchaseOrders.filter(purchaseOrder => purchaseOrder.id !== id));
  };

  const getSaleById = (id: string): Sale | undefined => {
    return sales.find(sale => sale.id === id);
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        categories,
        sales,
        suppliers,
        purchaseOrders,
        addItem,
        updateItem,
        deleteItem,
        addCategory,
        deleteCategory,
        getStats,
        getItemById,
        addSale,
        clearSales,
        getSalesStats,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        getSupplierById,
        addPurchaseOrder,
        updatePurchaseOrder,
        receivePurchaseOrder,
        deletePurchaseOrder,
        getSaleById,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}