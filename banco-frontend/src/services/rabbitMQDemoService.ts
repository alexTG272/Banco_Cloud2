
import api from "./api";

export interface DemoMessage {
  id: string;
  contenido: string;
}

export interface DemoMessageStatus {
  id: string;
  contenido: string;
  estado: string;
  fechaPublicacion: string;
  fechaProcesamiento: string | null;
}

export const enviarMensajeDemo = async (
  contenido: string
): Promise<DemoMessage> => {
  const response = await api.post<DemoMessage>(
    "/api/admin/rabbitmq/demo/send",
    { contenido }
  );

  return response.data;
};

export const consultarEstadoDemo = async (
  id: string
): Promise<DemoMessageStatus> => {
  const response = await api.get<DemoMessageStatus>(
    `/api/admin/rabbitmq/demo/status/${id}`
  );

  return response.data;
};
