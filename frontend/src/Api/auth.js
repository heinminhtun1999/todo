import axios from "axios";
import resolve from "./resolve.js";
import resovle from "./resolve.js";

export const login = async (data) => {
    return await resovle(() => axios({ method: "post", url: "/auth/login", data }));
}

export const register = async (data) => {
    return await resolve(() => axios({ method: "post", url: "/auth/register", headers: { "Content-Type": "multipart/form-data" }, data }));
}

export const isAuthenticated = async () => {
    return await resovle(() => axios({ method: "get", url: "/auth/is_authenticated", withCredentials: true }));
}

export const logout = async () => {
    return await resovle(() => axios(({ method: "get", url: "/auth/logout" })));
}

export const forgotPassword = async (username) => {
    return await resovle(() => axios({ method: "post", url: "/auth/forgot", data: { username } }));
}

// to check if token in password reset link is valid
export const checkPasswordReset = async (token) => {
    return await resolve(() => axios({ method: "get", url: `/reset?token=${token}` }));
}

export const resetPassword = async (token, password) => {
    return await resolve(() => axios({ method: "post", url: `/reset?token=${token}`, data: { password } }))
}

