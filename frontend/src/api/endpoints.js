import axios from "axios";
import { API_URL } from "../constants/constants.js";

const BASE_URL = API_URL;

const api = axios.create({ baseURL: BASE_URL, withCredentials: true });

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
        return response.data;
    } catch (error) {
        console.error("Error fetching auth data:", error);
        throw error;
    }
};

export const meApi = async () => {
    try {
        const response = await api.get("/me/");
        return response.data;
    } catch (error) {
        console.error("Error fetching user data:", error);
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

export const getPostApi = async (id) => {
    try {
        const response = await api.get(`/post/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching post:", error);
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
    const response = await api.get(`/feed/?page=${page}`);
    return response.data;
};

export const checkUsernameApi = async (username) => {
    try {
        const res = await api.get(`/username-exists/`, { params: { username } });
        return res.data.exists;
    } catch {
        return true;
    }
};

export const checkEmailApi = async (email) => {
    try {
        const res = await api.get(`/email-exists/`, { params: { email } });
        return res.data.exists;
    } catch {
        return true;
    }
};

export const createPostApi = async (imageFile, text) => {
    const formData = new FormData();
    formData.append("text", text);
    if (imageFile) formData.append("image", imageFile);

    const res = await api.post("/create-post/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const editPostApi = async (id, text) => {
    const formData = new FormData();
    formData.append("text", text);

    const res = await api.post(`/edit-post/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};
