import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import Icon from "../components/Icon";
import Sidebar from "../components/Sidebar";

import {
  obtenerGrupos,
  obtenerUsuarioActual,
} from "../services/authService";

import {
  listarCuentas,
  type Cuenta,
} from "../services/cuentasService";

import "./Cuentas.css";

function Cuentas() {
  const [cuentas, setCuentas] =
    useState<Cuenta[]>([]);

  const [rol, setRol] =
    useState("");

  const [usuario, setUsuario] =
    useState("");

  const [cargando, setCargando] =
    useState(true);

  const [recargando, setRecargando] =
    useState(false);

  const [error, setError] =
    useState("");

  const navigate = useNavigate();

  const cargarDatos = async (
    silencioso = false
  ) => {
    if (silencioso) {
      setRecargando(true);
    } else {
      setCargando(true);
    }

    setError("");

    /*
     * =====================================================
     * COGNITO
     * =====================================================
     *
     * Se procesa independientemente del backend.
     * Si listarCuentas() falla, el rol NO se pierde.
     */
    try {
      const usuarioActual =
        await obtenerUsuarioActual();

      const grupos =
        await obtenerGrupos();

      setUsuario(
        usuarioActual?.username ?? ""
      );

      if (
        grupos.includes("Empleado")
      ) {
        setRol("Empleado");
      } else if (
        grupos.includes("Cliente")
      ) {
        setRol("Cliente");
      } else {
        setRol("Sin rol");
      }
    } catch (error) {
      console.error(
        "Error al obtener información de Cognito:",
        error
      );

      setRol("Sin rol");
    }

    /*
     * =====================================================
     * BACKEND
     * =====================================================
     */
    try {
      const datos =
        await listarCuentas();

      setCuentas(datos);
    } catch (error) {
      console.error(
        "Error al cargar cuentas:",
        error
      );

      setCuentas([]);

      setError(
        "No se pudieron cargar las cuentas. Intenta nuevamente."
      );
    } finally {
      setCargando(false);
      setRecargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const totalSaldo = useMemo(
    () =>
      cuentas.reduce(
        (total, cuenta) =>
          total + cuenta.saldo,
        0
      ),
    [cuentas]
  );

  const esEmpleado =
    rol === "Empleado";

  if (cargando) {
    return (
      <div className="accounts-loading">
        <div
          className="accounts-spinner"
          aria-hidden="true"
        />

        <p>
          Cargando tus cuentas...
        </p>
      </div>
    );
  }

  return (
    <div className="accounts-page">
      <Sidebar />

      <main className="accounts-main">
        <header className="accounts-topbar">
          <div>
            <p className="accounts-breadcrumb">
              BANCO CLOUD / CUENTAS
            </p>

            <h1>
              {esEmpleado
                ? "Todas las cuentas"
                : "Mis cuentas"}
            </h1>

            <p className="accounts-subtitle">
              {esEmpleado
                ? "Consulta las cuentas registradas en BancoCloud."
                : "Consulta tus productos y saldos disponibles."}
            </p>
          </div>

          <div className="accounts-user">
            <span className="accounts-user-icon">
              <Icon name="user" />
            </span>

            <div>
              <strong>
                {rol || "Usuario"}
              </strong>

              <span>
                {usuario ||
                  "Sesión activa"}
              </span>
            </div>
          </div>
        </header>

        {error && (
          <section
            className="accounts-message accounts-message-error"
            role="alert"
          >
            <span className="accounts-message-icon">
              <Icon name="close" />
            </span>

            <div>
              <strong>
                No pudimos cargar las cuentas
              </strong>

              <p>
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                cargarDatos(true)
              }
              disabled={recargando}
            >
              {recargando
                ? "Reintentando..."
                : "Reintentar"}
            </button>
          </section>
        )}

        <section className="accounts-summary-grid">
          <article className="accounts-summary-card accounts-summary-card-primary">
            <span className="accounts-summary-icon">
              <Icon name="wallet" />
            </span>

            <div>
              <p>
                {esEmpleado
                  ? "Cuentas registradas"
                  : "Mis cuentas"}
              </p>

              <strong>
                {cuentas.length}
              </strong>
            </div>
          </article>

          <article className="accounts-summary-card accounts-summary-card-balance">
            <span className="accounts-summary-icon">
              <Icon name="check" />
            </span>

            <div>
              <p>
                Saldo total
              </p>

              <strong>
                $
                {totalSaldo.toLocaleString(
                  "es-CL"
                )}
              </strong>
            </div>
          </article>

          <button
            type="button"
            className="accounts-refresh-card"
            onClick={() =>
              cargarDatos(true)
            }
            disabled={recargando}
          >
            <span className="accounts-refresh-icon">
              <Icon name="arrow" />
            </span>

            <div>
              <strong>
                {recargando
                  ? "Actualizando..."
                  : "Actualizar información"}
              </strong>

              <small>
                Consulta nuevamente el estado de tus cuentas.
              </small>
            </div>
          </button>
        </section>

        <section className="accounts-content-card">
          <div className="accounts-content-heading">
            <div>
              <p className="accounts-eyebrow">
                PRODUCTOS FINANCIEROS
              </p>

              <h2>
                {cuentas.length === 0
                  ? "Todavía no tienes cuentas"
                  : "Cuentas disponibles"}
              </h2>
            </div>

            <span className="accounts-count-badge">
              {cuentas.length}{" "}
              {cuentas.length === 1
                ? "cuenta"
                : "cuentas"}
            </span>
          </div>

          {cuentas.length === 0 ? (
            <div className="accounts-empty">
              <span className="accounts-empty-icon">
                <Icon name="wallet" />
              </span>

              <h3>
                {esEmpleado
                  ? "No hay cuentas registradas"
                  : "No tienes cuentas registradas"}
              </h3>

              <p>
                {esEmpleado
                  ? "Las cuentas creadas mediante solicitudes aprobadas aparecerán aquí."
                  : "Cuando una solicitud de apertura sea aprobada, tu cuenta aparecerá aquí automáticamente."}
              </p>

              <button
                type="button"
                className="accounts-secondary-button"
                onClick={() =>
                  navigate("/solicitudes")
                }
              >
                Ver solicitudes

                <Icon name="arrow" />
              </button>
            </div>
          ) : (
            <div className="accounts-list">
              {cuentas.map(
                (cuenta) => (
                  <article
                    className="account-item"
                    key={cuenta.id}
                  >
                    <div className="account-item-icon">
                      <Icon name="wallet" />
                    </div>

                    <div className="account-item-main">
                      <div className="account-item-topline">
                        <div>
                          <p className="account-item-label">
                            TIPO DE CUENTA
                          </p>

                          <h3>
                            {cuenta.tipoCuenta}
                          </h3>
                        </div>

                        <span className="account-status">
                          <span className="account-status-dot" />

                          Activa
                        </span>
                      </div>

                      <div className="account-item-details">
                        <div>
                          <span>
                            Número de cuenta
                          </span>

                          <strong>
                            {cuenta.numeroCuenta ??
                              "Pendiente"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Saldo disponible
                          </span>

                          <strong>
                            $
                            {cuenta.saldo.toLocaleString(
                              "es-CL"
                            )}
                          </strong>
                        </div>

                        {esEmpleado && (
                          <div>
                            <span>
                              Cliente
                            </span>

                            <strong className="account-client-value">
                              {cuenta.cliente}
                            </strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Cuentas;