
import api from "./api";

// ==========================================
// TIPOS DE SOLICITUD
// ==========================================

export interface QueueRequest {
  nombre: string;
}

export interface ExchangeRequest {
  nombre: string;
  tipo: "DIRECT" | "TOPIC";
}

export interface BindingRequest {
  nombreCola: string;
  nombreExchange: string;
  routingKey: string;
}

// ==========================================
// TIPOS DE RESPUESTA RABBITMQ
// ==========================================

export interface QueueInfo {
  name: string;
  vhost: string;
  type: string;
  state: string;
  durable: boolean;
  auto_delete: boolean;
  consumers: number;
  messages: number;
  messages_ready: number;
  messages_unacknowledged: number;
}

export interface ExchangeInfo {
  name: string;
  vhost: string;
  type: string;
  durable: boolean;
  auto_delete: boolean;
  internal: boolean;
}

export interface BindingInfo {
  source: string;
  vhost: string;
  destination: string;
  destination_type: string;
  routing_key: string;
}

// ==========================================
// CONSULTAS DE COLAS
// ==========================================

export const listarColas = async (): Promise<QueueInfo[]> => {
  const response = await api.get<QueueInfo[]>(
    "/api/admin/rabbitmq/queues"
  );

  return response.data;
};

// ==========================================
// CONSULTAS DE EXCHANGES
// ==========================================

export const listarExchanges = async (): Promise<ExchangeInfo[]> => {
  const response = await api.get<ExchangeInfo[]>(
    "/api/admin/rabbitmq/exchanges"
  );

  return response.data;
};

// ==========================================
// CONSULTAS DE BINDINGS
// ==========================================

export const listarBindings = async (): Promise<BindingInfo[]> => {
  const response = await api.get<BindingInfo[]>(
    "/api/admin/rabbitmq/bindings"
  );

  return response.data;
};

// ==========================================
// ADMINISTRACIÓN DE COLAS
// ==========================================

export const crearCola = async (nombre: string): Promise<string> => {
  const response = await api.post<string>(
    "/api/admin/rabbitmq/queues",
    { nombre }
  );

  return response.data;
};

export const eliminarCola = async (nombre: string): Promise<string> => {
  const response = await api.delete<string>(
    "/api/admin/rabbitmq/queues",
    { params: { nombre } }
  );

  return response.data;
};

// ==========================================
// ADMINISTRACIÓN DE EXCHANGES
// ==========================================

export const crearExchange = async (
  nombre: string,
  tipo: ExchangeRequest["tipo"]
): Promise<string> => {
  const response = await api.post<string>(
    "/api/admin/rabbitmq/exchanges",
    { nombre, tipo }
  );

  return response.data;
};

export const eliminarExchange = async (
  nombre: string
): Promise<string> => {
  const response = await api.delete<string>(
    "/api/admin/rabbitmq/exchanges",
    { params: { nombre } }
  );

  return response.data;
};

// ==========================================
// ADMINISTRACIÓN DE BINDINGS
// ==========================================

export const crearBinding = async (
  datos: BindingRequest
): Promise<string> => {
  const response = await api.post<string>(
    "/api/admin/rabbitmq/bindings",
    datos
  );

  return response.data;
};

export const eliminarBinding = async (
  datos: BindingRequest
): Promise<string> => {
  const response = await api.delete<string>(
    "/api/admin/rabbitmq/bindings",
    { data: datos }
  );

  return response.data;
};
