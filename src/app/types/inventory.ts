export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  minQuantity: number;
  price: number;
  sku: string;
  supplier: string;
  supplierId?: string;
  lastUpdated: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  categories: number;
}

export interface SaleItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'other';
  customerName?: string;
  date: string;
}

export interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  todayRevenue: number;
  averageTransaction: number;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  notes?: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'received' | 'cancelled';
  orderDate: string;
  receivedDate?: string;
  notes?: string;
}