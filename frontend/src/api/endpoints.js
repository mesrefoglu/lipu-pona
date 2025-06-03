import axios from "axios";

import { API_URL } from "../constants/constants.js";

const api = axios.create({ baseURL: API_URL, withCredentials: true });

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== "/token/refresh/") {
            originalRequest._retry = true;

            try {
                await api.post("/token/refresh/");
                return api(originalRequest);
            } catch (refreshErr) {
                console.error("Token refresh failed:", refreshErr);
            }
        }
        return Promise.reject(error);
    }
);

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

export const getAuthApi = async () => {
    try {
        const response = await api.get("/authenticated/");
        return response.data;
    } catch (error) {
        console.error("Error fetching auth data:", error);
        throw error;
    }
};

export const requestPasswordResetApi = async (email) => {
    await api.post("/password-reset/request/", { email });
    return { success: true };
};

export const confirmPasswordResetApi = async (uid, token, newPassword) => {
    const response = await api.post("/password-reset/confirm/", { uid, token, new_password: newPassword });
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

export const confirmEmailApi = async (uid, token) => {
    const response = await api.post("/activate/", { uid, token });
    return response.data;
};

export const logoutApi = async () => {
    await api.post("/logout/");
    return { success: true };
};

export const searchUsersApi = async (query) => {
    try {
        const res = await api.get("/search-users/", { params: { q: query } });
        return res.data;
    } catch {
        return [];
    }
};

export const getUserApi = async (username) => {
    try {
        const response = await api.get(`/user/${username}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};

export const getFollowersApi = async (username) => {
    const res = await api.get(`/followers/${username}/`);
    return res.data;
};

export const getFollowingApi = async (username) => {
    const res = await api.get(`/following/${username}/`);
    return res.data;
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

export const editUserApi = async ({ username, name, bio, imageFile, removedPicture, newPassword, currentPassword }) => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("first_name", name);
    formData.append("bio", bio);

    if (removedPicture) {
        formData.append("profile_picture", "");
    } else if (imageFile) {
        formData.append("profile_picture", imageFile);
    }

    if (newPassword) {
        formData.append("new_password", newPassword);
        formData.append("current_password", currentPassword);
    }

    try {
        await api.patch("/edit-user/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return { success: true };
    } catch (error) {
        console.error("Error during user edit:", error);
        return { success: false, error: error.response?.data?.error || "Unknown error" };
    }
};

export const deleteUserApi = async () => {
    try {
        await api.delete("/delete-user/");
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
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

export const likeApi = async (postId) => {
    try {
        const response = await api.post("/like/", { id: postId });
        return response.data;
    } catch (error) {
        console.error("Error liking post:", error);
        throw error;
    }
};

export const getLikersApi = async (id) => {
    const res = await api.get(`/likers/${id}/`);
    return res.data;
};

export const getCommentsApi = async (id, cursor = null) => {
    let url = cursor ? cursor : `/comments/${id}/`;
    try {
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching comments:", error);
        throw error;
    }
};

export const createCommentApi = async (postId, text) => {
    const data = { post_id: postId, text: text.trim() };
    try {
        const response = await api.post("/create-comment/", data);
        return response.data;
    } catch (error) {
        console.error("Error creating comment:", error);
        throw error;
    }
};

export const editCommentApi = async (id, text) => {
    const data = { text: text.trim() };
    try {
        const response = await api.post(`/edit-comment/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error("Error editing comment:", error);
        throw error;
    }
};

export const deleteCommentApi = async (id) => {
    try {
        await api.delete(`/delete-comment/${id}/`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting comment:", error);
        throw error;
    }
};

export const likeCommentApi = async (id) => {
    try {
        const response = await api.post("/like-comment/", { id });
        return response.data;
    } catch (error) {
        console.error("Error liking comment:", error);
        throw error;
    }
};

export const getCommentLikersApi = async (id) => {
    try {
        const response = await api.get(`/comment-likers/${id}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching comment likers:", error);
        throw error;
    }
};

export const feedApi = async (cursor = null) => {
    const url = cursor ? cursor : `/feed/`;
    try {
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching feed:", error);
        throw error;
    }
};

export const discoverApi = async (cursor = null) => {
    const url = cursor ? cursor : `/discover/`;
    try {
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching discover feed:", error);
        throw error;
    }
};
