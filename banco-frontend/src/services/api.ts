import axios from "axios";
import { fetchAuthSession } from "aws-amplify/auth";

const api = axios.create({
  baseURL: "https://crw0cnjdxj.execute-api.us-east-1.amazonaws.com",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error(
        "No se pudo obtener la sesión de Cognito:",
        error
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;