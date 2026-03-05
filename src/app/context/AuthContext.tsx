import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../firebase';
import {
    collection,
    onSnapshot,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    where
} from 'firebase/firestore';

export type UserRole = 'admin' | 'cashier' | 'manager';

export interface User {
    username: string;
    role: UserRole;
    name: string;
    password?: string;
}

interface AuthContextType {
    user: User | null;
    users: User[];
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
    hasRole: (roles: UserRole[]) => boolean;
    addUser: (user: User) => Promise<void>;
    updateUser: (username: string, updates: Partial<User>) => Promise<void>;
    deleteUser: (username: string) => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_AUTH = 'store_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem(STORAGE_KEY_AUTH);
        return stored ? JSON.parse(stored) : null;
    });

    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Écouter les utilisateurs en temps réel
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
            const usersList: User[] = [];
            snapshot.forEach((doc) => {
                usersList.push(doc.data() as User);
            });

            // Si la base est vide (premier lancement), on crée l'admin par défaut
            if (usersList.length === 0) {
                const defaultAdmin: User = {
                    username: 'admin',
                    role: 'admin',
                    name: 'Administrateur',
                    password: 'admin123'
                };
                setDoc(doc(db, 'users', 'admin'), defaultAdmin);
            }

            setUsers(usersList);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Persister la session locale (pour éviter de se reconnecter à chaque refresh)
    useEffect(() => {
        if (user) {
            localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORAGE_KEY_AUTH);
        }
    }, [user]);

    const login = async (username: string, password: string): Promise<boolean> => {
        const foundUser = users.find(u => u.username === username && u.password === password);
        if (foundUser) {
            const sessionUser = { ...foundUser };
            delete sessionUser.password;
            setUser(sessionUser);
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
    };

    const hasRole = (allowedRoles: UserRole[]) => {
        if (!user) return false;
        if (user.role === 'admin') return true;
        return allowedRoles.includes(user.role);
    };

    const addUser = async (newUser: User) => {
        // On utilise l'username comme ID de document
        await setDoc(doc(db, 'users', newUser.username), newUser);
    };

    const updateUser = async (username: string, updates: Partial<User>) => {
        await updateDoc(doc(db, 'users', username), updates);

        // Si l'utilisateur mis à jour est celui connecté, mettre à jour la session (sauf password)
        if (user?.username === username) {
            const { password, ...sessionUpdates } = updates as any;
            setUser(prev => prev ? { ...prev, ...sessionUpdates } : null);
        }
    };

    const deleteUser = async (username: string) => {
        if (username === 'admin') return;
        await deleteDoc(doc(db, 'users', username));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                users,
                login,
                logout,
                isAuthenticated: !!user,
                hasRole,
                addUser,
                updateUser,
                deleteUser,
                isLoading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
