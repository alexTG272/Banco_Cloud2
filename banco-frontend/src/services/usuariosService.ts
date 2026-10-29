import api from "./api";

export interface UsuarioCognito {
  username: string;
  email: string;
  estado: string;
  habilitado: boolean;
  grupos: string[];
  rol: string;
  autorizado: boolean;
}

export const listarUsuarios = async (): Promise<UsuarioCognito[]> => {
  const response = await api.get<UsuarioCognito[]>(
    "/api/admin/usuarios"
  );

  return response.data;
};

export const autorizarUsuario = async (
  username: string
): Promise<UsuarioCognito> => {
  const response = await api.put<UsuarioCognito>(
    `/api/admin/usuarios/${encodeURIComponent(username)}/autorizar`
  );

  return response.data;
};