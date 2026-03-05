import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { InventoryList } from './components/InventoryList';
import { ItemForm } from './components/ItemForm';
import { Categories } from './components/Categories';
import { PointOfSale } from './components/PointOfSale';
import { SalesHistory } from './components/SalesHistory';
import { Suppliers } from './components/Suppliers';
import { PurchaseOrders } from './components/PurchaseOrders';
import { PurchaseOrderForm } from './components/PurchaseOrderForm';
import { Login } from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserManagement } from './components/UserManagement';
import { Profile } from './components/Profile';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/',
    Component: Layout,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, Component: Dashboard },
          { path: 'profile', Component: Profile },
          {
            element: <ProtectedRoute allowedRoles={['admin', 'cashier']} />,
            children: [
              { path: 'pos', Component: PointOfSale },
              { path: 'sales', Component: SalesHistory },
            ]
          },
          {
            element: <ProtectedRoute allowedRoles={['admin', 'manager']} />,
            children: [
              { path: 'inventory', Component: InventoryList },
              { path: 'inventory/new', Component: ItemForm },
              { path: 'inventory/edit/:id', Component: ItemForm },
              { path: 'categories', Component: Categories },
              { path: 'suppliers', Component: Suppliers },
              { path: 'purchase-orders', Component: PurchaseOrders },
              { path: 'purchase-orders/new', Component: PurchaseOrderForm },
            ]
          },
          {
            element: <ProtectedRoute allowedRoles={['admin']} />,
            children: [
              { path: 'users', Component: UserManagement },
            ]
          },
        ],
      },
    ],
  },
]);