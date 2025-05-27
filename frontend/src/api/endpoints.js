import axios from "axios";

import { API_URL } from "../constants/constants.js";

const api = axios.create({ baseURL: API_URL, withCredentials: true });

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
        console.error("Error during login:", error);
        return { success: false };
    }
};

export const registerApi = async (username, name, email, password) => {
    if (!username || !email || !password) {
        return { success: false };
    }
    try {
        const response = await api.post("/register/", { username, first_name: name, email, password });
        return response.data;
    } catch (error) {
        console.warn("Error during registration:", error);
        return { success: false };
    }
};

export const editUserApi = async (username, name, bio, imageFile, newPassword) => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("first_name", name);
    formData.append("bio", bio);
    formData.append("password", newPassword ? newPassword : "");
    if (imageFile) formData.append("profile_picture", imageFile);
    try {
        const response = await api.patch("/edit-user/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error) {
        console.error("Error during user edit:", error);
        return { success: false };
    }
};

export const logoutApi = async () => {
    await api.post("/logout/");
    return { success: true };
};

export const getAuthApi = async () => {
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
        const result = await api.get(`/username-exists/`, { params: { username } });
        return result.data.exists;
    } catch {
        return true;
    }
};

export const checkEmailApi = async (email) => {
    try {
        const result = await api.get(`/email-exists/`, { params: { email } });
        return result.data.exists;
    } catch {
        return true;
    }
};

export const createPostApi = async (imageFile, text) => {
    const formData = new FormData();
    formData.append("text", text);
    if (imageFile) formData.append("image", imageFile);

    const result = await api.post("/create-post/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return result.data;
};

export const editPostApi = async (id, text) => {
    try {
        const result = await api.post(`/edit-post/${id}/`, { text: text.trim() });
        return result.data;
    } catch (error) {
        console.error("Error editing post:", error);
        throw error;
    }
};

export const deletePostApi = async (id) => {
    try {
        await api.delete(`/delete-post/${id}/`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting post:", error);
        throw error;
    }
};
