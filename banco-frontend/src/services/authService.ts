import {
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  signUp,
  confirmSignUp,
} from "aws-amplify/auth";

export const iniciarSesion = async (
  username: string,
  password: string
) => {
  return await signIn({
    username,
    password,
  });
};

export const registrarUsuario = async (
  email: string,
  password: string
) => {
  return await signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
      },
    },
  });
};

export const confirmarRegistro = async (
  email: string,
  codigo: string
) => {
  return await confirmSignUp({
    username: email,
    confirmationCode: codigo,
  });
};

export const cerrarSesion = async (): Promise<void> => {
  await signOut();
};

export const obtenerUsuarioActual = async () => {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
};

export const obtenerToken = async (): Promise<string | null> => {
  try {
    const session = await fetchAuthSession();

    return session.tokens?.accessToken?.toString() ?? null;
  } catch {
    return null;
  }
};

export const obtenerGrupos = async (): Promise<string[]> => {
  try {
    const session = await fetchAuthSession();

    const groups = session.tokens?.accessToken?.payload["cognito:groups"];

    if (Array.isArray(groups)) {
      return groups as string[];
    }

    return [];
  } catch {
    return [];
  }
};