import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { User, Key, Save, Shield } from 'lucide-react';
import { toast } from 'sonner';

export function Profile() {
    const { user, updateUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password && password !== confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }

        setIsSubmitting(true);

        try {
            const updates: any = { name };
            if (password) {
                updates.password = password;
            }

            if (user) {
                await updateUser(user.username, updates);
                toast.success('Profil mis à jour avec succès');
                setPassword('');
                setConfirmPassword('');
            }
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="w-6 h-6 text-blue-600" />
                    Mon Profil
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Gérez vos informations personnelles et votre mot de passe
                </p>
            </div>

            <Card className="border-0 shadow-lg dark:bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5 text-gray-400" />
                        Informations de compte
                    </CardTitle>
                    <CardDescription>
                        Identifiant : <span className="font-mono text-blue-600 dark:text-blue-400">@{user.username}</span> | Rôle : <span className="capitalize">{user.role}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom complet</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="password">Nouveau mot de passe</Label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Laisser vide pour ne pas changer"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Répétez le mot de passe"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6">
                                <Save className="w-4 h-4" />
                                {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
