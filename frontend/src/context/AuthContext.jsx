import { createContext, useContext, useState } from 'react';
import { loginUser, registerUser } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [username, setUsername] = useState(localStorage.getItem('username'));

    const login = async (usernameInput, password) => {
        const { data } = await loginUser(usernameInput, password);
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        localStorage.setItem('username', usernameInput);
        setUsername(usernameInput);
    };

    const register = async (usernameInput, email, password) => {
        await registerUser(usernameInput, email, password);
        await login(usernameInput, password);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        setUsername(null);
    };

    return (
        <AuthContext.Provider value={{ username, login, register, logout, isAuthenticated: !!username }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}