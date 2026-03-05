import { RouterProvider } from 'react-router';
import { router } from './routes';
import { InventoryProvider } from './context/InventoryContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './components/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="store-theme" attribute="class">
      <AuthProvider>
        <InventoryProvider>
          <RouterProvider router={router} />
          <Toaster />
        </InventoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
