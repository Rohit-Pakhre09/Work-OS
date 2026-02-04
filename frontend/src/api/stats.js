import { api } from "./axios";

export const getStats = async (role) => {
  const url = role === "Admin" ? "/stats/admin" : "/stats/employee";
  const { data } = await api.get(url);
  return data.data;
};
