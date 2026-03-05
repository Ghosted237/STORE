import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
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
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function ItemForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addItem, updateItem, getItemById, categories } = useInventory();

  const isEditing = !!id;
  const existingItem = isEditing ? getItemById(id) : null;

  const [formData, setFormData] = useState({
    name: existingItem?.name || '',
    description: existingItem?.description || '',
    category: existingItem?.category || '',
    quantity: existingItem?.quantity.toString() || '0',
    minQuantity: existingItem?.minQuantity.toString() || '0',
    price: existingItem?.price.toString() || '0',
    sku: existingItem?.sku || '',
    supplier: existingItem?.supplier || '',
  });

  useEffect(() => {
    if (isEditing && !existingItem) {
      toast.error('Article non trouvé');
      navigate('/inventory');
    }
  }, [isEditing, existingItem, navigate]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.sku) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const itemData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      quantity: parseFloat(formData.quantity) || 0,
      minQuantity: parseFloat(formData.minQuantity) || 0,
      price: parseFloat(formData.price) || 0,
      sku: formData.sku,
      supplier: formData.supplier,
    };

    if (isEditing) {
      updateItem(id, itemData);
      toast.success('Article mis à jour avec succès');
    } else {
      addItem(itemData);
      toast.success('Article ajouté avec succès');
    }

    navigate('/inventory');
  };

  return (
    <div className="max-w-3xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/inventory')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour à l'inventaire
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Modifier l\'article' : 'Ajouter un article'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Nom de l'article"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  placeholder="Code SKU"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Description de l'article"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Fournisseur</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => handleChange('supplier', e.target.value)}
                  placeholder="Nom du fournisseur"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantité</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minQuantity">Stock minimum</Label>
                <Input
                  id="minQuantity"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.minQuantity}
                  onChange={(e) => handleChange('minQuantity', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Prix (XAF)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {isEditing ? 'Mettre à jour' : 'Ajouter'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/inventory')}
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
