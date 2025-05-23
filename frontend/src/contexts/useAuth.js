import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getAuth, loginApi } from "../api/endpoints.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const checkAuth = async () => {
        try {
            const response = await getAuth();
            setAuth(response);
        } catch (error) {
            console.error("Error checking authentication:", error);
            setAuth(false);
        } finally {
            setLoading(false);
        }
    };

    const authLogin = async (username, password) => {
        const response = await loginApi(username, password);
        if (response.success) {
            setAuth(true);
            navigate("/");
        } else {
            setAuth(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return <AuthContext.Provider value={{ auth, loading, authLogin }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
