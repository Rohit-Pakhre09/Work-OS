import { api } from "./axios";

export const getUsers = async () => {
  const { data } = await api.get("/users");
  return data.data.users || [];
};

export const createUser = async (userData) => {
  const { data } = await api.post("/users", userData);
  return data;
};

export const updateUser = async (userId, userData) => {
  const { data } = await api.patch(`/users/${userId}`, userData);
  return data;
};

export const deleteUser = async (userId) => {
  const { data } = await api.delete(`/users/${userId}`);
  return data;
};

export const getRoles = async () => {
    const { data } = await api.get("/roles");
    return data.data.roles || [];
}
