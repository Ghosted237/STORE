import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
} from './ui/dialog';
import { toast } from 'sonner';
import { SaleItem, Sale } from '../types/inventory';
import { InvoicePrint } from './InvoicePrint';

export function PointOfSale() {
  const { items, addSale } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'other'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [printSale, setPrintSale] = useState<Sale | null>(null);

  const TAX_RATE = 0.20; // 20% TVA

  const filteredItems = items.filter(item =>
    item.quantity > 0 && (
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const addToCart = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const existingCartItem = cart.find(ci => ci.itemId === itemId);
    const currentCartQuantity = existingCartItem ? existingCartItem.quantity : 0;

    if (currentCartQuantity >= item.quantity) {
      toast.error('Stock insuffisant');
      return;
    }

    if (existingCartItem) {
      setCart(cart.map(ci =>
        ci.itemId === itemId
          ? { ...ci, quantity: ci.quantity + 1, total: (ci.quantity + 1) * ci.price }
          : ci
      ));
    } else {
      setCart([...cart, {
        itemId: item.id,
        name: item.name,
        quantity: 1,
        price: item.price,
        total: item.price,
      }]);
    }
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const cartItem = cart.find(ci => ci.itemId === itemId);
    if (!cartItem) return;

    const newQuantity = cartItem.quantity + delta;

    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    if (newQuantity > item.quantity) {
      toast.error('Stock insuffisant');
      return;
    }

    setCart(cart.map(ci =>
      ci.itemId === itemId
        ? { ...ci, quantity: newQuantity, total: newQuantity * ci.price }
        : ci
    ));
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(ci => ci.itemId !== itemId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Le panier est vide');
      return;
    }

    setIsSubmitting(true);
    try {
      await addSale({
        items: cart,
        subtotal,
        tax,
        total,
        paymentMethod,
        customerName: customerName || undefined,
      });

      toast.success('Vente enregistrée avec succès');
      setCart([]);
      setCustomerName('');
      setSearchTerm('');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement de la vente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckoutAndPrint = async () => {
    if (cart.length === 0) {
      toast.error('Le panier est vide');
      return;
    }

    setIsSubmitting(true);
    try {
      const newSale = await addSale({
        items: cart,
        subtotal,
        tax,
        total,
        paymentMethod,
        customerName: customerName || undefined,
      });

      toast.success('Vente enregistrée avec succès');
      setCart([]);
      setCustomerName('');
      setSearchTerm('');
      setPrintSale(newSale);
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement de la vente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products Section */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Point de Vente</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Sélectionnez les articles à vendre</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher un article par nom ou SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredItems.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-500">
              Aucun article disponible
            </div>
          ) : (
            filteredItems.map(item => (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-800"
                onClick={() => addToCart(item.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base dark:text-gray-100">{item.name}</CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.sku}</p>
                    </div>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                        {item.price.toFixed(2)} XAF
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Stock: {item.quantity}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item.id);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="lg:col-span-1">
        <Card className="sticky top-6 dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
              <ShoppingCart className="w-5 h-5" />
              Panier ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cart Items */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {cart.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                  Panier vide
                </p>
              ) : (
                cart.map(item => (
                  <div key={item.itemId} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm dark:text-gray-100">{item.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {item.price.toFixed(2)} XAF × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0"
                        onClick={() => updateCartQuantity(item.itemId, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0"
                        onClick={() => updateCartQuantity(item.itemId, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                        onClick={() => removeFromCart(item.itemId)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="font-bold text-sm">
                      {item.total.toFixed(2)} XAF
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Customer Info */}
            {cart.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-slate-800 pt-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="dark:text-gray-300">Client (optionnel)</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nom du client"
                      className="dark:bg-slate-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Mode de paiement</Label>
                    <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                      <SelectTrigger id="paymentMethod">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">
                          <div className="flex items-center gap-2">
                            <Banknote className="w-4 h-4" />
                            Espèces
                          </div>
                        </SelectItem>
                        <SelectItem value="card">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Carte bancaire
                          </div>
                        </SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 dark:border-slate-800 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Sous-total</span>
                    <span className="font-medium dark:text-gray-200">{subtotal.toFixed(2)} XAF</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">TVA (20%)</span>
                    <span className="font-medium dark:text-gray-200">{tax.toFixed(2)} XAF</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-slate-800">
                    <span className="dark:text-white">Total</span>
                    <span className="text-blue-600 dark:text-blue-500">{total.toFixed(2)} XAF</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4">
                  <Button
                    onClick={handleCheckoutAndPrint}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Traitement...' : 'Encaisser et Imprimer'}
                  </Button>
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Traitement...' : 'Encaisser uniquement'}
                  </Button>
                  <Button
                    onClick={clearCart}
                    variant="outline"
                    className="w-full"
                  >
                    Vider le panier
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Print Invoice Dialog */}
      <Dialog open={!!printSale} onOpenChange={() => setPrintSale(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {printSale && (
            <InvoicePrint
              sale={printSale}
              invoiceNumber={printSale.id.slice(-8).toUpperCase()}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
