import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useInventory } from '../context/InventoryContext';
import { Receipt, Search, CreditCard, Banknote, Eye, Printer, Download, Trash2, AlertTriangle, Key } from 'lucide-react';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
import { Button } from './ui/button';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Sale } from '../types/inventory';
import { InvoicePrint } from './InvoicePrint';

export function SalesHistory() {
  const { sales, clearSales, isLoading } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [printSale, setPrintSale] = useState<Sale | null>(null);
  const [isClearHistoryDialogOpen, setIsClearHistoryDialogOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  const filteredSales = sales.filter(sale =>
    sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="w-4 h-4" />;
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Espèces';
      case 'card':
        return 'Carte';
      default:
        return 'Autre';
    }
  };

  const handleExportExcel = () => {
    const dataToExport = filteredSales.map(sale => ({
      'N° Vente': sale.id.slice(-6),
      'Date': new Date(sale.date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      'Client': sale.customerName || '-',
      'Nombre d\'articles': sale.items.length,
      'Mode de paiement': getPaymentMethodLabel(sale.paymentMethod),
      'Sous-total (XAF)': sale.subtotal,
      'TVA (XAF)': sale.tax,
      'Total (XAF)': sale.total,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wscols = [
      { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 15 },
      { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historique_Ventes");

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `ventes_store_${dateStr}.xlsx`);
  };

  const handleClearHistory = async () => {
    if (adminPassword !== 'admin123') {
      toast.error('Mot de passe administrateur incorrect');
      return;
    }

    setIsClearing(true);
    try {
      await clearSales();
      setIsClearHistoryDialogOpen(false);
      setAdminPassword('');
      toast.success('Historique des ventes réinitialisé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la réinitialisation');
    } finally {
      setIsClearing(false);
    }
  };

  const closeClearDialog = () => {
    setIsClearHistoryDialogOpen(false);
    setAdminPassword('');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 dark:text-gray-400">Chargement de l'historique...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Historique des Ventes</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{sales.length} vente(s) enregistrée(s)</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsClearHistoryDialogOpen(true)}
            variant="outline"
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-900/20"
            disabled={sales.length === 0}
          >
            <Trash2 className="w-4 h-4" />
            Réinitialiser l'historique
          </Button>
          <Button
            onClick={handleExportExcel}
            variant="outline"
            className="flex items-center gap-2"
            disabled={filteredSales.length === 0}
          >
            <Download className="w-4 h-4" />
            Exporter Excel
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Rechercher par numéro, client ou article..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sales Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>N° Vente</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead>Paiement</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Aucune vente trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map(sale => (
                <TableRow key={sale.id}>
                  <TableCell className="font-mono text-sm">
                    #{sale.id.slice(-6)}
                  </TableCell>
                  <TableCell>
                    {new Date(sale.date).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    {sale.customerName || <span className="text-gray-400 dark:text-gray-500">-</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {sale.items.length} article(s)
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(sale.paymentMethod)}
                      <span className="text-sm">
                        {getPaymentMethodLabel(sale.paymentMethod)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {sale.total.toFixed(2)} XAF
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSale(sale)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPrintSale(sale)}
                        className="text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/50"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {sales.length === 0 && (
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Aucune vente enregistrée</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Les ventes effectuées via le point de vente apparaîtront ici
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sale Details Dialog */}
      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la vente #{selectedSale?.id.slice(-6)}</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-6">
              {/* Sale Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                  <p className="font-medium dark:text-gray-200">
                    {new Date(selectedSale.date).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mode de paiement</p>
                  <p className="font-medium flex items-center gap-2 dark:text-gray-200">
                    {getPaymentMethodIcon(selectedSale.paymentMethod)}
                    {getPaymentMethodLabel(selectedSale.paymentMethod)}
                  </p>
                </div>
                {selectedSale.customerName && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Client</p>
                    <p className="font-medium dark:text-gray-200">{selectedSale.customerName}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-3 dark:text-gray-100">Articles vendus</h4>
                <div className="space-y-2">
                  {selectedSale.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium dark:text-gray-200">{item.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.price.toFixed(2)} XAF × {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold dark:text-gray-100">{item.total.toFixed(2)} XAF</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 dark:border-slate-800 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Sous-total</span>
                  <span className="font-medium dark:text-gray-200">{selectedSale.subtotal.toFixed(2)} XAF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">TVA (20%)</span>
                  <span className="font-medium dark:text-gray-200">{selectedSale.tax.toFixed(2)} XAF</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-slate-800">
                  <span className="dark:text-white">Total</span>
                  <span className="text-blue-600 dark:text-blue-500">{selectedSale.total.toFixed(2)} XAF</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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

      {/* Clear History Confirmation Dialog */}
      <Dialog open={isClearHistoryDialogOpen} onOpenChange={closeClearDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Réinitialiser l'historique
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              Êtes-vous sûr de vouloir réinitialiser tout l'historique des ventes ?
            </p>
            <p className="text-sm border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-r-lg mb-4">
              <strong>Attention :</strong> Cette action est irréversible. Nous vous recommandons d'exporter l'historique au format Excel avant de continuer.
            </p>

            <div className="space-y-2 mt-4">
              <Label htmlFor="adminPassword" className="text-sm font-medium flex items-center gap-2 dark:text-gray-300">
                <Key className="w-4 h-4" />
                Mot de passe administrateur
              </Label>
              <Input
                id="adminPassword"
                type="password"
                placeholder="Ex: admin123"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="dark:bg-slate-800"
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={closeClearDialog}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearHistory}
              disabled={!adminPassword || isClearing}
            >
              {isClearing ? 'Réinitialisation...' : 'Oui, réinitialiser'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}