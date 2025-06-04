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
    const response = await api.post("/token/", { username, password });
    return response.data;
};

export const getAuthApi = async () => {
    const response = await api.get("/authenticated/");
    return response.data;
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
    const response = await api.get(`/username-exists/`, { params: { username } });
    return response.data.exists;
};

export const checkEmailApi = async (email) => {
    const response = await api.get(`/email-exists/`, { params: { email } });
    return response.data.exists;
};

export const registerApi = async (username, name, email, password) => {
    if (!username || !email || !password) {
        return { success: false };
    }
    const response = await api.post("/register/", { username, first_name: name, email, password });
    return response.data;
};

export const confirmEmailApi = async (activation_key) => {
    const response = await api.post(`/activate/${activation_key}/`);
    return response.data;
};

export const logoutApi = async () => {
    await api.post("/logout/");
    return { success: true };
};

export const searchUsersApi = async (query) => {
    const response = await api.get("/search-users/", { params: { q: query } });
    return response.data;
};

export const getUserApi = async (username) => {
    const response = await api.get(`/user/${username}`);
    return response.data;
};

export const getFollowersApi = async (username) => {
    const response = await api.get(`/followers/${username}/`);
    return response.data;
};

export const getFollowingApi = async (username) => {
    const response = await api.get(`/following/${username}/`);
    return response.data;
};

export const followApi = async (username) => {
    const response = await api.post("/follow/", { username: username });
    return response.data;
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
    await api.delete("/delete-user/");
    return { success: true };
};

export const getPostApi = async (id) => {
    const response = await api.get(`/post/${id}`);
    return response.data;
};

export const getPostsApi = async (username, cursor = null) => {
    const url = cursor ? cursor : `/posts/${username}/`;
    const response = await api.get(url);
    return response.data;
};

export const createPostApi = async (imageFile, text) => {
    const formData = new FormData();
    formData.append("text", text);
    if (imageFile) formData.append("image", imageFile);

    const response = await api.post("/create-post/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const editPostApi = async (id, text) => {
    const response = await api.post(`/edit-post/${id}/`, { text: text.trim() });
    return response.data;
};

export const deletePostApi = async (id) => {
    await api.delete(`/delete-post/${id}/`);
    return { success: true };
};

export const likeApi = async (postId) => {
    const response = await api.post("/like/", { id: postId });
    return response.data;
};

export const getLikersApi = async (id) => {
    const res = await api.get(`/likers/${id}/`);
    return res.data;
};

export const getCommentsApi = async (id, cursor = null) => {
    let url = cursor ? cursor : `/comments/${id}/`;
    const response = await api.get(url);
    return response.data;
};

export const createCommentApi = async (postId, text) => {
    const response = await api.post("/create-comment/", { post_id: postId, text: text.trim() });
    return response.data;
};

export const editCommentApi = async (id, text) => {
    const response = await api.post(`/edit-comment/${id}/`, { text: text.trim() });
    return response.data;
};

export const deleteCommentApi = async (id) => {
    await api.delete(`/delete-comment/${id}/`);
    return { success: true };
};

export const likeCommentApi = async (id) => {
    const response = await api.post("/like-comment/", { id });
    return response.data;
};

export const getCommentLikersApi = async (id) => {
    const response = await api.get(`/comment-likers/${id}/`);
    return response.data;
};

export const feedApi = async (cursor = null) => {
    const url = cursor ? cursor : `/feed/`;
    const response = await api.get(url);
    return response.data;
};

export const discoverApi = async (cursor = null) => {
    const url = cursor ? cursor : `/discover/`;
    const response = await api.get(url);
    return response.data;
};
