import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { Package, LayoutDashboard, List, FolderOpen, CreditCard, Receipt, Truck, ShoppingBag, Menu, X, LogOut, User, Users } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasRole } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                )}
              </Button>
              <Package className="w-8 h-8 text-blue-600 dark:text-blue-500" />
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 uppercase tracking-wider">STORE</h1>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <Link to="/profile" className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <div className="text-xs text-left">
                    <p className="font-semibold text-gray-900 dark:text-white leading-none">{user.name}</p>
                    <p className="text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                  </div>
                </Link>
              )}
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto relative">
        {/* Overlay for mobile menu */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-gray-900/50 z-20 lg:hidden"
            onClick={closeMobileMenu}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 p-4 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:min-h-[calc(100vh-4rem)] ${isMobileMenuOpen ? 'translate-x-0 mt-16 lg:mt-0' : '-translate-x-full'
            }`}
        >
          {user && (
            <div className="sm:hidden mb-6 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="space-y-1">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/')
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-sm'
                : 'text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Tableau de bord</span>
            </Link>

            {hasRole(['admin', 'cashier']) && (
              <>
                <Link
                  to="/pos"
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/pos')
                    ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 shadow-sm'
                    : 'text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Point de Vente</span>
                </Link>
                <Link
                  to="/sales"
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/sales')
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-sm'
                    : 'text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <Receipt className="w-5 h-5" />
                  <span>Historique Ventes</span>
                </Link>
              </>
            )}

            {hasRole(['admin', 'manager']) && (
              <>
                <Link
                  to="/inventory"
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/inventory')
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-sm'
                    : 'text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <List className="w-5 h-5" />
                  <span>Inventaire</span>
                </Link>
                <Link
                  to="/categories"
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/categories')
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-sm'
                    : 'text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <FolderOpen className="w-5 h-5" />
                  <span>Catégories</span>
                </Link>

                <div className="border-t border-gray-200 dark:border-slate-800 my-2" />

                <Link
                  to="/suppliers"
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/suppliers')
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-sm'
                    : 'text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <Truck className="w-5 h-5" />
                  <span>Fournisseurs</span>
                </Link>
                <Link
                  to="/purchase-orders"
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/purchase-orders')
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-sm'
                    : 'text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Approvisionnements</span>
                </Link>
              </>
            )}

            {hasRole(['admin']) && (
              <>
                <div className="border-t border-gray-200 dark:border-slate-800 my-2" />
                <Link
                  to="/users"
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/users')
                    ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 shadow-sm'
                    : 'text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <Users className="w-5 h-5" />
                  <span>Utilisateurs</span>
                </Link>
              </>
            )}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}