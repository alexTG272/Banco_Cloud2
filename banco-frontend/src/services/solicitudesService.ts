import api from "./api";

export interface Solicitud {
  id: number;
  tipoCuenta: string;
  montoInicial: number;
  estado: string;
  cliente: string;
  fechaSolicitud: string;
}

export const listarSolicitudes = async (): Promise<Solicitud[]> => {
  const response = await api.get<Solicitud[]>(
    "/api/solicitudes"
  );

  return response.data;
};

export const buscarSolicitud = async (
  id: number
): Promise<Solicitud> => {
  const response = await api.get<Solicitud>(
    `/api/solicitudes/${id}`
  );

  return response.data;
};

export const crearSolicitud = async (
  solicitud: {
    tipoCuenta: string;
    montoInicial: number;
  }
): Promise<Solicitud> => {
  const response = await api.post<Solicitud>(
    "/api/solicitudes",
    solicitud
  );

  return response.data;
};

export const aprobarSolicitud = async (
  id: number
): Promise<Solicitud> => {
  const response = await api.put<Solicitud>(
    `/api/solicitudes/${id}/aprobar`
  );

  return response.data;
};

export const rechazarSolicitud = async (
  id: number
): Promise<Solicitud> => {
  const response = await api.put<Solicitud>(
    `/api/solicitudes/${id}/rechazar`
  );

  return response.data;
};