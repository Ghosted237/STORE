import { useState } from 'react';
import { useAuth, UserRole, User } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Badge } from './ui/badge';
import { Users, UserPlus, Pencil, Trash2, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export function UserManagement() {
    const { users, addUser, updateUser, deleteUser, user: currentUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        role: 'cashier' as UserRole,
        password: '',
    });

    const handleOpenAdd = () => {
        setEditingUser(null);
        setFormData({ username: '', name: '', role: 'cashier', password: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            name: user.name,
            role: user.role,
            password: '', // On ne remplit pas le password existant pour la sécurité
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUser) {
            // Pour une modification, on ne change le password que s'il est renseigné
            const updates: Partial<User> = {
                name: formData.name,
                role: formData.role,
            };
            if (formData.password) {
                updates.password = formData.password;
            }
            updateUser(editingUser.username, updates);
            toast.success('Utilisateur mis à jour');
        } else {
            // Pour un ajout
            if (!formData.password) {
                toast.error('Le mot de passe est obligatoire pour un nouvel utilisateur');
                return;
            }
            addUser({
                username: formData.username,
                name: formData.name,
                role: formData.role,
                password: formData.password,
            });
            toast.success('Utilisateur ajouté');
        }
        setIsModalOpen(false);
    };

    const handleDelete = (username: string) => {
        if (username === currentUser?.username) {
            toast.error('Vous ne pouvez pas supprimer votre propre compte');
            return;
        }
        if (confirm(`Êtes-vous sûr de vouloir supprimer ${username} ?`)) {
            deleteUser(username);
            toast.success('Utilisateur supprimé');
        }
    };

    const getRoleBadge = (role: UserRole) => {
        switch (role) {
            case 'admin':
                return <Badge className="bg-purple-600 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Admin</Badge>;
            case 'manager':
                return <Badge className="bg-blue-600 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Gestionnaire</Badge>;
            default:
                return <Badge variant="outline" className="flex items-center gap-1"><Shield className="w-3 h-3" /> Caissier</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        Gestion des Utilisateurs
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Gérez les comptes et les accès de vos collaborateurs
                    </p>
                </div>
                <Button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Ajouter un utilisateur
                </Button>
            </div>

            <Card className="border-0 shadow-lg dark:bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-lg">Comptes enregistrés</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nom Complet</TableHead>
                                    <TableHead>Nom d'Utilisateur</TableHead>
                                    <TableHead>Rôle</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((u) => (
                                    <TableRow key={u.username}>
                                        <TableCell className="font-medium">{u.name}</TableCell>
                                        <TableCell className="font-mono text-sm text-gray-500">@{u.username}</TableCell>
                                        <TableCell>{getRoleBadge(u.role)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(u)}>
                                                    <Pencil className="w-4 h-4 text-blue-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(u.username)}
                                                    disabled={u.username === 'admin' || u.username === currentUser?.username}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="username">Nom d'utilisateur</Label>
                                <Input
                                    id="username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    disabled={!!editingUser}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nom Complet</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="role">Rôle</Label>
                                <select
                                    id="role"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800"
                                >
                                    <option value="cashier">Caissier</option>
                                    <option value="manager">Gestionnaire</option>
                                    <option value="admin">Administrateur</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Mot de passe {editingUser && '(Laissez vide pour conserver)'}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!editingUser}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                                {editingUser ? 'Sauvegarder' : 'Créer l\'utilisateur'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
