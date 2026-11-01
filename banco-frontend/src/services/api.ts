
import axios from "axios";
import { fetchAuthSession } from "aws-amplify/auth";

// URL de API Gateway configurada en las variables de entorno de Amplify.
const API_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_URL) {
  throw new Error(
    "La variable VITE_API_BASE_URL no está configurada en Amplify."
  );
}

// Instancia principal de Axios.
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Agregar automáticamente el token de Cognito a cada solicitud.
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
  (error) => {
    return Promise.reject(error);
  }
);

// Exportar instancia para utilizarla en los servicios del frontend.
export default api;
