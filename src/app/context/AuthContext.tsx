import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    login: (username: string, password: string) => boolean;
    logout: () => void;
    isAuthenticated: boolean;
    hasRole: (roles: UserRole[]) => boolean;
    addUser: (user: User) => void;
    updateUser: (username: string, updates: Partial<User>) => void;
    deleteUser: (username: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_AUTH = 'store_auth_user';
const STORAGE_KEY_USERS = 'store_users';

const defaultUsers: User[] = [
    { username: 'admin', role: 'admin', name: 'Administrateur', password: 'admin123' }
];

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem(STORAGE_KEY_AUTH);
        return stored ? JSON.parse(stored) : null;
    });

    const [users, setUsers] = useState<User[]>(() => {
        const stored = localStorage.getItem(STORAGE_KEY_USERS);
        return stored ? JSON.parse(stored) : defaultUsers;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORAGE_KEY_AUTH);
        }
    }, [user]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    }, [users]);

    const login = (username: string, password: string): boolean => {
        const foundUser = users.find(u => u.username === username && u.password === password);
        if (foundUser) {
            // Ne pas stocker le password dans la session pour plus de sécurité (simulée)
            const sessionUser = { ...foundUser };
            delete sessionUser.password;
            setUser(foundUser);
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

    const addUser = (newUser: User) => {
        if (users.find(u => u.username === newUser.username)) return;
        setUsers([...users, newUser]);
    };

    const updateUser = (username: string, updates: Partial<User>) => {
        setUsers(users.map(u => u.username === username ? { ...u, ...updates } : u));
        // Si l'utilisateur mis à jour est celui connecté, mettre à jour la session
        if (user?.username === username) {
            setUser(prev => prev ? { ...prev, ...updates } : null);
        }
    };

    const deleteUser = (username: string) => {
        if (username === 'admin') return; // Sécurité : on ne supprime pas l'admin principal
        setUsers(users.filter(u => u.username !== username));
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
