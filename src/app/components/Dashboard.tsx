import { useInventory } from '../context/InventoryContext';
import { Package, DollarSign, AlertTriangle, FolderOpen, TrendingUp, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';

export function Dashboard() {
  const { items, getStats, sales, getSalesStats } = useInventory();
  const { hasRole } = useAuth();
  const stats = getStats();
  const salesStats = getSalesStats();

  const lowStockItems = items.filter(item => item.quantity <= item.minQuantity);
  const recentSales = [...sales].slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Tableau de bord</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Vue d'ensemble de votre activité</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {hasRole(['admin', 'manager']) && (
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Articles Total
              </CardTitle>
              <Package className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalItems}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {items.length} produits différents
              </p>
            </CardContent>
          </Card>
        )}

        {hasRole(['admin', 'manager']) && (
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Valeur Stock
              </CardTitle>
              <DollarSign className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalValue.toFixed(2)} XAF
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Valeur de l'inventaire</p>
            </CardContent>
          </Card>
        )}

        {hasRole(['admin']) && (
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Ventes Totales
              </CardTitle>
              <ShoppingCart className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {salesStats.totalSales}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Transactions</p>
            </CardContent>
          </Card>
        )}

        {hasRole(['admin']) && (
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Revenu Total
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                {salesStats.totalRevenue.toFixed(2)} XAF
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Aujourd'hui: {salesStats.todayRevenue.toFixed(2)} XAF
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Alertes Stock Faible
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune alerte de stock faible</p>
            ) : (
              <div className="space-y-3">
                {lowStockItems.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive" className="bg-orange-500">
                        {item.quantity} / {item.minQuantity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Ventes récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune vente enregistrée</p>
            ) : (
              <div className="space-y-3">
                {recentSales.map(sale => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {sale.customerName || `Vente #${sale.id.slice(-6)}`}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(sale.date).toLocaleDateString('fr-FR')} - {sale.items.length} article(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 dark:text-green-500">{sale.total.toFixed(2)} XAF</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="dark:bg-slate-900 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {hasRole(['admin', 'cashier']) && (
              <Link
                to="/pos"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Ouvrir la caisse
              </Link>
            )}
            {hasRole(['admin', 'manager']) && (
              <Link
                to="/inventory/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Ajouter un article
              </Link>
            )}
            {hasRole(['admin', 'cashier']) && (
              <Link
                to="/sales"
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                Voir les ventes
              </Link>
            )}
            {hasRole(['admin', 'manager']) && (
              <Link
                to="/inventory"
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                Gérer l'inventaire
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}