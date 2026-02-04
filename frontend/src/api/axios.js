import axios from "axios";
import { store } from "../app/store.js";
import { logout } from "../features/auth/authSlice.js";

export const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API,
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const state = store.getState();
        const accessToken = state.auth.accessToken;
        if (accessToken && accessToken.trim() !== '') {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshResponse = await axios.post(
                    `${import.meta.env.VITE_BACKEND_API}/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                const { accessToken } = refreshResponse.data;

                store.dispatch({
                    type: 'auth/loginSuccess',
                    payload: refreshResponse.data
                });

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                store.dispatch(logout());
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
