import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { getAuthApi, loginApi, logoutApi, refreshTokenApi } from "../api/endpoints.js";

const AuthContext = createContext();

const ACCESS_TOKEN_LIFETIME_HOURS = 25;
const REFRESH_TOKEN_LIFETIME_DAYS = 30;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const getTokenTimestamp = (key) => {
        const timestamp = localStorage.getItem(key);
        return timestamp ? new Date(timestamp) : null;
    };

    const setTokenTimestamp = (key) => {
        localStorage.setItem(key, new Date().toISOString());
    };

    const clearTokenTimestamps = () => {
        localStorage.removeItem("access_token_timestamp");
        localStorage.removeItem("refresh_token_timestamp");
    };

    const isTokenExpired = (timestamp, lifetimeHours) => {
        if (!timestamp) return true;
        const now = new Date();
        const expiryTime = new Date(timestamp.getTime() + lifetimeHours * 60 * 60 * 1000);
        return now >= expiryTime;
    };

    const checkAuth = useCallback(async () => {
        const accessTokenTime = getTokenTimestamp("access_token_timestamp");
        const refreshTokenTime = getTokenTimestamp("refresh_token_timestamp");

        if (accessTokenTime && !isTokenExpired(accessTokenTime, ACCESS_TOKEN_LIFETIME_HOURS)) {
            try {
                const user = await getAuthApi();
                setUser(user);
                setLoading(false);
                return;
            } catch {}
        }

        if (refreshTokenTime && !isTokenExpired(refreshTokenTime, REFRESH_TOKEN_LIFETIME_DAYS * 24)) {
            try {
                await refreshTokenApi();
                setTokenTimestamp("access_token_timestamp");
                const user = await getAuthApi();
                setUser(user);
                setLoading(false);
                return;
            } catch {
                clearTokenTimestamps();
            }
        } else {
            clearTokenTimestamps();
        }

        setUser(null);
        setLoading(false);
    }, []);

    const authLogin = async (username, password) => {
        const resp = await loginApi(username, password);
        if (resp.success) {
            setTokenTimestamp("access_token_timestamp");
            setTokenTimestamp("refresh_token_timestamp");

            const user = await getAuthApi();
            setUser(user);
            navigate("/");
            return user;
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
            clearTokenTimestamps();
            setUser(null);
            navigate("/account/login");
        }
    };

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, authLogin, logout }}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
