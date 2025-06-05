import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getAuthApi, loginApi, logoutApi } from "../api/endpoints.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const checkAuth = async () => {
        try {
            const user = await getAuthApi();
            setUser(user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const authLogin = async (username, password) => {
        const resp = await loginApi(username, password);
        if (resp.success) {
            const me = await getAuthApi();
            setUser(me);
            navigate("/");
            return me;
        } else {
            setUser(null);
            throw new Error("Login failed");
        }
    };

    const logout = async () => {
        try {
            await logoutApi();
        } catch {
            console.warn("Server-side logout failed, clearing client state anyway");
        } finally {
            setUser(null);
            navigate("/account/login");
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, authLogin, logout }}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
