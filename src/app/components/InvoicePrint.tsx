import { Sale } from '../types/inventory';

interface InvoicePrintProps {
  sale: Sale;
  invoiceNumber: string;
}

export function InvoicePrint({ sale, invoiceNumber }: InvoicePrintProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-invoice">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-invoice, .print-invoice * {
            visibility: visible;
          }
          .print-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto bg-white p-8">
        {/* Print Button */}
        <div className="flex justify-end mb-6 no-print">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Imprimer
          </button>
        </div>

        {/* Invoice Header */}
        <div className="border-b-2 border-gray-300 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FACTURE</h1>
              <p className="text-lg text-gray-600 mt-1">N° {invoiceNumber}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-900">STORE</h2>
              <p className="text-sm text-gray-600 mt-2">
                Douala Cameroun<br />
                Tél: (+237)688554774<br />
                Email: jeankamta222@gmail.com
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Facturé à:</h3>
            <div className="text-gray-700">
              {sale.customerName || 'Client'}
            </div>
          </div>
          <div className="text-right">
            <div className="mb-2">
              <span className="font-semibold">Date:</span>{' '}
              {new Date(sale.date).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </div>
            <div>
              <span className="font-semibold">Mode de paiement:</span>{' '}
              {sale.paymentMethod === 'cash' ? 'Espèces' :
                sale.paymentMethod === 'card' ? 'Carte bancaire' : 'Autre'}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 font-semibold">Article</th>
              <th className="text-center py-3 font-semibold">Quantité</th>
              <th className="text-right py-3 font-semibold">Prix unitaire</th>
              <th className="text-right py-3 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-3">{item.name}</td>
                <td className="text-center py-3">{item.quantity}</td>
                <td className="text-right py-3">{item.price.toFixed(2)} XAF</td>
                <td className="text-right py-3 font-medium">{item.total.toFixed(2)} XAF</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Sous-total:</span>
              <span>{sale.subtotal.toFixed(2)} XAF</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>TVA (20%):</span>
              <span>{sale.tax.toFixed(2)} XAF</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t-2 border-gray-300 pt-2 mt-2">
              <span>Total:</span>
              <span>{sale.total.toFixed(2)} XAF</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 pt-6 mt-12">
          <p className="text-sm text-gray-600 text-center">
            Merci pour votre achat !
          </p>
          <p className="text-xs text-gray-500 text-center mt-2">
            Facture générée par le système STORE
          </p>
        </div>
      </div>
    </div>
  );
}
