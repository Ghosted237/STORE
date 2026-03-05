import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useInventory } from '../context/InventoryContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PurchaseOrderItem } from '../types/inventory';

export function PurchaseOrderForm() {
  const navigate = useNavigate();
  const { suppliers, items, addPurchaseOrder } = useInventory();
  const [supplierId, setSupplierId] = useState('');
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);
  const [notes, setNotes] = useState('');

  const TAX_RATE = 0.20;

  const addItem = () => {
    setOrderItems([...orderItems, {
      itemId: '',
      itemName: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }]);
  };

  const updateItem = (index: number, field: keyof PurchaseOrderItem, value: string) => {
    const updated = [...orderItems];

    if (field === 'itemId') {
      const item = items.find(i => i.id === value);
      if (item) {
        updated[index] = {
          ...updated[index],
          itemId: value,
          itemName: item.name,
          unitPrice: item.price,
          total: updated[index].quantity * item.price,
        };
      }
    } else if (field === 'quantity' || field === 'unitPrice') {
      const numValue = parseFloat(value) || 0;
      (updated[index] as any)[field] = numValue;
      updated[index].total = updated[index].quantity * updated[index].unitPrice;
    } else {
      (updated[index] as any)[field] = value;
    }

    setOrderItems(updated);
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      toast.error('Veuillez sélectionner un fournisseur');
      return;
    }

    if (orderItems.length === 0) {
      toast.error('Veuillez ajouter au moins un article');
      return;
    }

    const invalidItems = orderItems.filter(item => !item.itemId || item.quantity <= 0);
    if (invalidItems.length > 0) {
      toast.error('Veuillez compléter tous les articles');
      return;
    }

    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) {
      toast.error('Fournisseur invalide');
      return;
    }

    addPurchaseOrder({
      supplierId,
      supplierName: supplier.name,
      items: orderItems,
      subtotal,
      tax,
      total,
      status: 'pending',
      notes: notes || undefined,
      orderDate: new Date().toISOString(),
    });

    toast.success('Commande créée avec succès');
    navigate('/purchase-orders');
  };

  return (
    <div className="max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/purchase-orders')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour aux commandes
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Nouvelle commande d'approvisionnement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Supplier Selection */}
            <div className="space-y-2">
              <Label htmlFor="supplier">Fournisseur *</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Sélectionner un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">
                      Aucun fournisseur disponible
                    </div>
                  ) : (
                    suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Articles *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un article
                </Button>
              </div>

              {orderItems.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <p className="text-gray-500 mb-4">Aucun article ajouté</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un article
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex gap-3 items-end p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2 space-y-2">
                          <Label className="text-xs">Article</Label>
                          <Select
                            value={item.itemId}
                            onValueChange={(value) => updateItem(index, 'itemId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              {items.map(inventoryItem => (
                                <SelectItem key={inventoryItem.id} value={inventoryItem.id}>
                                  {inventoryItem.name} ({inventoryItem.sku})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Quantité</Label>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Prix unitaire (XAF)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Total</Label>
                        <div className="h-10 flex items-center font-bold">
                          {item.total.toFixed(2)} XAF
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes supplémentaires..."
                rows={3}
              />
            </div>

            {/* Totals */}
            {orderItems.length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{subtotal.toFixed(2)} XAF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA (20%)</span>
                  <span className="font-medium">{tax.toFixed(2)} XAF</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-blue-600">{total.toFixed(2)} XAF</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Créer la commande
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/purchase-orders')}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
