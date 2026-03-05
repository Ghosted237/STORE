import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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

export function Categories() {
  const { categories, addCategory, deleteCategory, items } = useInventory();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Le nom de la catégorie est obligatoire');
      return;
    }

    // Vérifier si la catégorie existe déjà
    if (categories.some(cat => cat.name.toLowerCase() === formData.name.toLowerCase())) {
      toast.error('Cette catégorie existe déjà');
      return;
    }

    setIsSubmitting(true);
    try {
      await addCategory(formData);
      toast.success('Catégorie ajoutée avec succès');
      setFormData({ name: '', description: '' });
      setShowForm(false);
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      setIsDeleting(true);
      try {
        await deleteCategory(deleteId);
        setDeleteId(null);
        toast.success('Catégorie supprimée avec succès');
      } catch (error: any) {
        toast.error(error.message || 'Erreur lors de la suppression');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getCategoryItemCount = (categoryName: string) => {
    return items.filter(item => item.category === categoryName).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Catégories</h2>
          <p className="text-gray-600 mt-1">{categories.length} catégorie(s) au total</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une catégorie
        </Button>
      </div>

      {/* Add Category Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Nom *</Label>
                <Input
                  id="categoryName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom de la catégorie"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryDescription">Description</Label>
                <Textarea
                  id="categoryDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de la catégorie"
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                  {isSubmitting ? 'Ajout...' : 'Ajouter'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: '', description: '' });
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => {
          const itemCount = getCategoryItemCount(category.name);

          return (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {itemCount} article(s)
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(category.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              {category.description && (
                <CardContent>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {categories.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">Aucune catégorie créée</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer votre première catégorie
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette catégorie ? Vous ne pouvez pas supprimer une catégorie qui contient des articles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
