import { useEffect, useState } from "react";
import {
  obtenerGrupos,
  obtenerToken,
  obtenerUsuarioActual,
} from "../services/authService";
import { listarCuentas, type Cuenta } from "../services/cuentasService";

function AuthTest() {
  const [usuario, setUsuario] = useState("");
  const [grupos, setGrupos] = useState<string[]>([]);
  const [tokenDisponible, setTokenDisponible] = useState(false);

  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [respuestaBff, setRespuestaBff] = useState("");
  const [error, setError] = useState("");

  const [cargando, setCargando] = useState(true);
  const [probandoBff, setProbandoBff] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setError("");

        const usuarioActual = await obtenerUsuarioActual();
        const tokenActual = await obtenerToken();
        const gruposActuales = await obtenerGrupos();

        if (usuarioActual) {
          setUsuario(usuarioActual.username);
        }

        setTokenDisponible(tokenActual !== null);
        setGrupos(gruposActuales);
      } catch (err) {
        console.error(
          "Error al obtener datos de autenticación:",
          err
        );

        setError(
          "No se pudieron obtener los datos de autenticación."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const probarBff = async () => {
    try {
      setError("");
      setRespuestaBff("");
      setProbandoBff(true);

      const datos = await listarCuentas();

      setCuentas(datos);
      setRespuestaBff(
        "La petición al BFF fue exitosa."
      );
    } catch (err) {
      console.error(
        "Error al comunicarse con el BFF:",
        err
      );

      setRespuestaBff(
        "La petición al BFF falló."
      );

      setError(
        "No fue posible consultar las cuentas mediante el BFF."
      );
    } finally {
      setProbandoBff(false);
    }
  };

  if (cargando) {
    return <p>Cargando autenticación...</p>;
  }

  return (
    <div>
      <h1>Prueba de autenticación</h1>

      <section>
        <h2>Usuario</h2>

        <p>
          {usuario || "Sin sesión"}
        </p>
      </section>

      <section>
        <h2>Grupos</h2>

        {grupos.length > 0 ? (
          <ul>
            {grupos.map((grupo) => (
              <li key={grupo}>
                {grupo}
              </li>
            ))}
          </ul>
        ) : (
          <p>
            No se encontraron grupos.
          </p>
        )}
      </section>

      <section>
        <h2>Access Token</h2>

        <p>
          {tokenDisponible
            ? "Access Token obtenido correctamente."
            : "No hay Access Token."}
        </p>
      </section>

      <section>
        <h2>Prueba BFF</h2>

        <button
          type="button"
          onClick={probarBff}
          disabled={probandoBff}
        >
          {probandoBff
            ? "Consultando..."
            : "Consultar cuentas mediante BFF"}
        </button>

        {respuestaBff && (
          <p>{respuestaBff}</p>
        )}

        {cuentas.length > 0 && (
          <div>
            <h3>Cuentas recibidas</h3>

            {cuentas.map((cuenta) => (
              <article key={cuenta.id}>
                <p>
                  Tipo: {cuenta.tipoCuenta}
                </p>

                <p>
                  Número:{" "}
                  {cuenta.numeroCuenta ??
                    "Pendiente"}
                </p>

                <p>
                  Saldo: $
                  {cuenta.saldo.toLocaleString(
                    "es-CL"
                  )}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      {error && (
        <p>{error}</p>
      )}
    </div>
  );
}

export default AuthTest;