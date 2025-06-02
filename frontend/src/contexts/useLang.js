import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../constants/i18n.js";

const LangContext = createContext();

export const LangProvider = ({ children }) => {
    const [lang, setLang] = useState(() => localStorage.getItem("lang") || "tp");

    const toggle = () => {
        setLang((l) => {
            const next = l === "tp" ? "en" : "tp";
            localStorage.setItem("lang", next);
            return next;
        });
    };

    const t = (key) => translations[lang][key] || key;

    useEffect(() => {
        document.documentElement.lang = lang === "tp" ? "tok" : "en";
    }, [lang]);

    return <LangContext.Provider value={{ lang, t, toggle }}>{children}</LangContext.Provider>;
};

export const useLang = () => useContext(LangContext);
