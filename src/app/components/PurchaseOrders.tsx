import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useNavigate } from 'react-router';
import { Plus, Search, Eye, CheckCircle, XCircle, Package } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner';
import { PurchaseOrder } from '../types/inventory';

export function PurchaseOrders() {
  const { purchaseOrders, receivePurchaseOrder, updatePurchaseOrder, suppliers } = useInventory();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [receiveId, setReceiveId] = useState<string | null>(null);

  const filteredOrders = purchaseOrders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReceive = () => {
    if (receiveId) {
      receivePurchaseOrder(receiveId);
      toast.success('Commande réceptionnée avec succès');
      setReceiveId(null);
    }
  };

  const handleCancel = (orderId: string) => {
    updatePurchaseOrder(orderId, { status: 'cancelled' });
    toast.success('Commande annulée');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">En attente</Badge>;
      case 'received':
        return <Badge className="bg-green-500">Réceptionnée</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annulée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Approvisionnements</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{purchaseOrders.length} commande(s) enregistrée(s)</p>
        </div>
        <Button
          onClick={() => navigate('/purchase-orders/new')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle commande
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Rechercher par numéro ou fournisseur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>N° Commande</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Aucune commande trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    #{order.id.slice(-6)}
                  </TableCell>
                  <TableCell className="font-medium">{order.supplierName}</TableCell>
                  <TableCell>
                    {new Date(order.orderDate).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {order.items.length} article(s)
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right font-bold">
                    {order.total.toFixed(2)} XAF
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {order.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReceiveId(order.id)}
                            className="text-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(order.id)}
                            className="text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {purchaseOrders.length === 0 && (
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Aucune commande d'approvisionnement</p>
            <Button
              onClick={() => navigate('/purchase-orders/new')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer votre première commande
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la commande #{selectedOrder?.id.slice(-6)}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Fournisseur</p>
                  <p className="font-medium dark:text-gray-200">{selectedOrder.supplierName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Statut</p>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date de commande</p>
                  <p className="font-medium dark:text-gray-200">
                    {new Date(selectedOrder.orderDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                {selectedOrder.receivedDate && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Date de réception</p>
                    <p className="font-medium dark:text-gray-200">
                      {new Date(selectedOrder.receivedDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-3 dark:text-gray-100">Articles commandés</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium dark:text-gray-200">{item.itemName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.unitPrice.toFixed(2)} XAF × {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold dark:text-gray-100">{item.total.toFixed(2)} XAF</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h4 className="font-semibold mb-2 dark:text-gray-100">Notes</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-gray-200 dark:border-slate-800 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Sous-total</span>
                  <span className="font-medium dark:text-gray-200">{selectedOrder.subtotal.toFixed(2)} XAF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">TVA (20%)</span>
                  <span className="font-medium dark:text-gray-200">{selectedOrder.tax.toFixed(2)} XAF</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-slate-800">
                  <span className="dark:text-white">Total</span>
                  <span className="text-blue-600 dark:text-blue-500">{selectedOrder.total.toFixed(2)} XAF</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receive Confirmation Dialog */}
      <AlertDialog open={!!receiveId} onOpenChange={() => setReceiveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réceptionner la commande</AlertDialogTitle>
            <AlertDialogDescription>
              Confirmez-vous la réception de cette commande ? Les quantités en stock seront automatiquement mises à jour.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleReceive} className="bg-green-600 hover:bg-green-700">
              Réceptionner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
