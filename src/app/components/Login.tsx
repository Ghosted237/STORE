import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { LogIn, Key, User } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { toast } from 'sonner';

export function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const success = await login(username, password);
            if (success) {
                toast.success(`Bienvenue, ${username} !`);
                navigate('/');
            } else {
                toast.error('Identifiants incorrects');
                setIsLoading(false);
            }
        } catch (error) {
            toast.error('Erreur lors de la connexion');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight italic text-blue-600 dark:text-blue-500">STORE</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Connectez-vous selon votre fonction
                    </p>
                </div>

                <Card className="border-0 shadow-2xl dark:bg-slate-900/50 backdrop-blur-xl border border-white/10 dark:border-slate-800/50">
                    <CardHeader>
                        <CardTitle className="text-center text-xl">Connexion</CardTitle>
                        <CardDescription className="text-center">
                            Entrez vos identifiants pour accéder au tableau de bord
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <User className="w-4 h-4 text-gray-500" />
                                    Nom d'utilisateur
                                </Label>
                                <Input
                                    id="username"
                                    placeholder="Ex: admin"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="h-11 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <Key className="w-4 h-4 text-gray-500" />
                                    Mot de passe
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-11 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-600/20 transition-all duration-200 active:scale-[0.98] mt-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Connexion en cours...
                                    </div>
                                ) : (
                                    'Se connecter'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-gray-500 dark:text-gray-500">
                    &copy; {new Date().getFullYear()} STORE - Solution Point de Vente
                </p>
            </div>
        </div>
    );
}
