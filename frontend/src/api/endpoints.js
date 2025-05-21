import axios from "axios";
import { API_URL } from "../constants/constants.js";
import { getCsrfToken } from "./csrf.js";

const BASE_URL = API_URL;

const api = axios.create({ baseURL: BASE_URL, withCredentials: true });

api.interceptors.request.use(
    (config) => {
        if (config.method !== "get") {
            config.headers["X-CSRFToken"] = getCsrfToken();
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getUserApi = async (username) => {
    try {
        const response = await api.get(`/user/${username}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};

export const loginApi = async (username, password) => {
    if (!username || !password) {
        return { success: false };
    }
    try {
        const response = await api.post("/token/", { username, password });
        return response.data;
    } catch (error) {
        console.log("Error during login:", error);
        return { success: false };
    }
};

export const registerApi = async (username, name, email, password) => {
    if (!username || !email || !password) {
        return { success: false };
    }
    try {
        const response = await api.post("/register/", { username, email, first_name: name, last_name: "", password });
        return response.data;
    } catch (error) {
        console.log("Error during registration:", error);
        return { success: false };
    }
};

export const getAuth = async () => {
    try {
        const response = await api.get("/authenticated/");
        console.log("Auth response:", response);
        return response.data;
    } catch (error) {
        console.error("Error fetching auth data:", error);
        throw error;
    }
};

export const followApi = async (username) => {
    try {
        const response = await api.post("/follow/", { username: username });
        return response.data;
    } catch (error) {
        console.error("Error following user:", error);
        throw error;
    }
};

export const getPostsApi = async (username) => {
    try {
        const response = await api.get(`/posts/${username}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching posts:", error);
        throw error;
    }
};

export const likeApi = async (postId) => {
    try {
        const response = await api.post("/like/", { id: postId });
        return response.data;
    } catch (error) {
        console.error("Error liking post:", error);
        throw error;
    }
};

export const feedApi = async (page = 1) => {
    try {
        const response = await api.get(`/feed/?page=${page}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching feed:", error);
        throw error;
    }
};
