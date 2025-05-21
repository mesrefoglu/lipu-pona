import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { getAuth, loginApi } from "../api/endpoints.js";
import { API_URL } from "../constants/constants.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [csrfReady, setCsrfReady] = useState(false);
    const navigate = useNavigate();

    const fetchCsrfToken = async () => {
        try {
            await axios.get(API_URL + "/csrf/", { withCredentials: true });
            console.log("CSRF token set");
            setCsrfReady(true);
            return true;
        } catch (error) {
            console.error("Error setting CSRF token:", error);
            return false;
        }
    };

    const checkAuth = async () => {
        try {
            if (!csrfReady) {
                const success = await fetchCsrfToken();
                if (!success) {
                    setAuth(false);
                    setLoading(false);
                    return;
                }
            }

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
        if (!csrfReady) {
            await fetchCsrfToken();
        }

        const response = await loginApi(username, password);
        if (response.success) {
            setAuth(true);
            navigate("/");
        } else {
            setAuth(false);
        }
    };

    useEffect(() => {
        const initialize = async () => {
            await fetchCsrfToken();
            await checkAuth();
        };

        initialize();
    }, []);

    return <AuthContext.Provider value={{ auth, loading, authLogin, fetchCsrfToken }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
