import api from "./api";

export interface Cuenta {
  id: number;
  numeroCuenta: string | null;
  tipoCuenta: string;
  saldo: number;
  cliente: string;
}

export const listarCuentas = async (): Promise<Cuenta[]> => {
  const response = await api.get<Cuenta[]>("/api/cuentas");

  return response.data;
};

export const buscarCuenta = async (
  id: number
): Promise<Cuenta> => {
  const response = await api.get<Cuenta>(
    `/api/cuentas/${id}`
  );

  return response.data;
};

export const consultarSaldo = async (
  id: number
): Promise<number> => {
  const response = await api.get<number>(
    `/api/cuentas/${id}/saldo`
  );

  return response.data;
};

export const crearCuenta = async (
  cuenta: Omit<Cuenta, "id">
): Promise<Cuenta> => {
  const response = await api.post<Cuenta>(
    "/api/cuentas",
    cuenta
  );

  return response.data;
};

export const asignarNumeroCuenta = async (
  id: number,
  numeroCuenta: string
): Promise<Cuenta> => {
  const response = await api.put<Cuenta>(
    `/api/cuentas/${id}/numero`,
    null,
    {
      params: {
        numeroCuenta,
      },
    }
  );

  return response.data;
};