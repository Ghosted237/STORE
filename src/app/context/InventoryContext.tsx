import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InventoryItem, Category, InventoryStats, Sale, SaleItem, SalesStats, Supplier, PurchaseOrder } from '../types/inventory';
import { db } from '../firebase';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  addDoc,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';

interface InventoryContextType {
  items: InventoryItem[];
  categories: Category[];
  sales: Sale[];
  addItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => Promise<void>;
  updateItem: (id: string, item: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getStats: () => InventoryStats;
  getItemById: (id: string) => InventoryItem | undefined;
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => Promise<Sale>;
  clearSales: () => Promise<void>;
  getSalesStats: () => SalesStats;
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  getSupplierById: (id: string) => Supplier | undefined;
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (purchaseOrder: Omit<PurchaseOrder, 'id' | 'date'>) => Promise<void>;
  updatePurchaseOrder: (id: string, purchaseOrder: Partial<PurchaseOrder>) => Promise<void>;
  receivePurchaseOrder: (id: string) => Promise<void>;
  deletePurchaseOrder: (id: string) => Promise<void>;
  getSaleById: (id: string) => Sale | undefined;
  isLoading: boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialisation en temps réel de toutes les collections
  useEffect(() => {
    const unsubscribes = [
      onSnapshot(collection(db, 'items'), (snapshot) => {
        setItems(snapshot.docs.map(doc => ({ ...doc.data() as InventoryItem, id: doc.id })));
      }),
      onSnapshot(collection(db, 'categories'), (snapshot) => {
        setCategories(snapshot.docs.map(doc => ({ ...doc.data() as Category, id: doc.id })));
      }),
      onSnapshot(query(collection(db, 'sales'), orderBy('date', 'desc')), (snapshot) => {
        setSales(snapshot.docs.map(doc => ({ ...doc.data() as Sale, id: doc.id })));
      }),
      onSnapshot(collection(db, 'suppliers'), (snapshot) => {
        setSuppliers(snapshot.docs.map(doc => ({ ...doc.data() as Supplier, id: doc.id })));
      }),
      onSnapshot(query(collection(db, 'purchaseOrders'), orderBy('orderDate', 'desc')), (snapshot) => {
        setPurchaseOrders(snapshot.docs.map(doc => ({ ...doc.data() as PurchaseOrder, id: doc.id })));
      }),
    ];

    setIsLoading(false);
    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  const addItem = async (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    const id = Date.now().toString();
    const newItem = {
      ...item,
      id,
      lastUpdated: new Date().toISOString(),
    };
    await setDoc(doc(db, 'items', id), newItem);
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    await updateDoc(doc(db, 'items', id), {
      ...updates,
      lastUpdated: new Date().toISOString(),
    });
  };

  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, 'items', id));
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    const id = Date.now().toString();
    await setDoc(doc(db, 'categories', id), { ...category, id });
  };

  const deleteCategory = async (id: string) => {
    const categoryToDelete = categories.find(cat => cat.id === id);
    if (categoryToDelete) {
      const itemsInCategory = items.filter(item => item.category === categoryToDelete.name);
      if (itemsInCategory.length > 0) {
        throw new Error(`Impossible de supprimer la catégorie "${categoryToDelete.name}" car elle contient ${itemsInCategory.length} article(s).`);
      }
    }
    await deleteDoc(doc(db, 'categories', id));
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

  const addSale = async (sale: Omit<Sale, 'id' | 'date'>) => {
    const id = Date.now().toString();
    const date = new Date().toISOString();
    const newSale: Sale = { ...sale, id, date };

    const batch = writeBatch(db);

    // Enregistrer la vente
    batch.set(doc(db, 'sales', id), newSale);

    // Mettre à jour les stocks
    sale.items.forEach(saleItem => {
      const itemRef = doc(db, 'items', saleItem.itemId);
      const currentItem = items.find(i => i.id === saleItem.itemId);
      if (currentItem) {
        batch.update(itemRef, {
          quantity: currentItem.quantity - saleItem.quantity,
          lastUpdated: date
        });
      }
    });

    await batch.commit();
    return newSale;
  };

  const clearSales = async () => {
    const batch = writeBatch(db);
    sales.forEach(sale => {
      batch.delete(doc(db, 'sales', sale.id));
    });
    await batch.commit();
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

  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    const id = Date.now().toString();
    await setDoc(doc(db, 'suppliers', id), { ...supplier, id });
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    await updateDoc(doc(db, 'suppliers', id), updates);
  };

  const deleteSupplier = async (id: string) => {
    await deleteDoc(doc(db, 'suppliers', id));
  };

  const getSupplierById = (id: string): Supplier | undefined => {
    return suppliers.find(supplier => supplier.id === id);
  };

  const addPurchaseOrder = async (purchaseOrder: Omit<PurchaseOrder, 'id' | 'date'>) => {
    const id = Date.now().toString();
    const orderDate = new Date().toISOString();
    const newPO = { ...purchaseOrder, id, orderDate };

    const batch = writeBatch(db);
    batch.set(doc(db, 'purchaseOrders', id), newPO);

    await batch.commit();
  };

  const updatePurchaseOrder = async (id: string, updates: Partial<PurchaseOrder>) => {
    await updateDoc(doc(db, 'purchaseOrders', id), updates);
  };

  const receivePurchaseOrder = async (id: string) => {
    const purchaseOrder = purchaseOrders.find(po => po.id === id);
    if (purchaseOrder) {
      const batch = writeBatch(db);
      const now = new Date().toISOString();

      purchaseOrder.items.forEach(purchaseItem => {
        const itemRef = doc(db, 'items', purchaseItem.itemId);
        const currentItem = items.find(i => i.id === purchaseItem.itemId);
        if (currentItem) {
          batch.update(itemRef, {
            quantity: currentItem.quantity + purchaseItem.quantity,
            lastUpdated: now
          });
        }
      });

      batch.delete(doc(db, 'purchaseOrders', id));
      await batch.commit();
    }
  };

  const deletePurchaseOrder = async (id: string) => {
    await deleteDoc(doc(db, 'purchaseOrders', id));
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
        isLoading,
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