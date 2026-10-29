import { useEffect, useState } from "react";

import {
  obtenerGrupos,
  obtenerUsuarioActual,
} from "../services/authService";

import Icon from "../components/Icon";
import Sidebar from "../components/Sidebar";

import "./Dashboard.css";

function Dashboard() {
  const [usuario, setUsuario] =
    useState("");

  const [rol, setRol] =
    useState("");

  const [cargando, setCargando] =
    useState(true);

  useEffect(() => {
    let activo = true;

    const cargarDatosUsuario =
      async () => {
        /*
         * Guardamos el momento en que comienza
         * la carga para garantizar que el loading
         * sea visible durante al menos 700 ms.
         */
        const inicio =
          Date.now();

        try {
          const [
            usuarioActual,
            grupos,
          ] = await Promise.all([
            obtenerUsuarioActual(),
            obtenerGrupos(),
          ]);

          if (!activo) {
            return;
          }

          if (usuarioActual) {
            setUsuario(
              usuarioActual.username
            );
          }

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
            "Error al obtener datos del usuario:",
            error
          );

          if (activo) {
            setRol("Sin rol");
          }
        } finally {
          /*
           * Tiempo mínimo del loading:
           * 700 ms.
           */
          const transcurrido =
            Date.now() - inicio;

          const tiempoRestante =
            Math.max(
              700 - transcurrido,
              0
            );

          await new Promise<void>(
            (resolve) => {
              setTimeout(
                resolve,
                tiempoRestante
              );
            }
          );

          if (activo) {
            setCargando(false);
          }
        }
      };

    cargarDatosUsuario();

    return () => {
      activo = false;
    };
  }, []);

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (cargando) {
    return (
      <div
        className="dashboard-loading"
        role="status"
        aria-live="polite"
      >
        <div
          className="dashboard-spinner"
          aria-hidden="true"
        />

        <p>
          Cargando tu información...
        </p>
      </div>
    );
  }

  const esEmpleado =
    rol === "Empleado";

  return (
    <div className="dashboard-page">
      <Sidebar />

      <main className="dashboard-main">
        {/* =================================================
            HEADER
           ================================================= */}

        <header className="dashboard-topbar">
          <div>
            <p className="dashboard-breadcrumb">
              BANCO CLOUD / INICIO
            </p>

            <h1>
              Bienvenido de vuelta
            </h1>
          </div>

          <div className="dashboard-user">
            <span className="dashboard-user-icon">
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

        {/* =================================================
            HERO
           ================================================= */}

        <section className="dashboard-welcome-card">
          <div>
            <p className="dashboard-eyebrow">
              TU BANCO EN LA NUBE
            </p>

            <h2>
              Gestiona tus productos financieros desde un solo lugar.
            </h2>

            <p>
              Consulta tus cuentas, revisa solicitudes
              y accede a las funciones disponibles para tu rol.
            </p>
          </div>

          <div className="dashboard-welcome-mark">
            B
          </div>
        </section>

        {/* =================================================
            ACCESOS
           ================================================= */}

        <section className="dashboard-content-section">
          <div className="dashboard-section-heading">
            <div>
              <p>
                ACCESOS
              </p>

              <h2>
                ¿Qué necesitas hacer?
              </h2>
            </div>
          </div>

          <div className="dashboard-card-grid">
            {/* =================================================
                CUENTAS
               ================================================= */}

            <button
              type="button"
              className="dashboard-action-card"
              onClick={() =>
                (window.location.href =
                  "/cuentas")
              }
            >
              <span className="dashboard-action-icon blue">
                <Icon name="wallet" />
              </span>

              <span className="dashboard-action-copy">
                <strong>
                  {esEmpleado
                    ? "Todas las cuentas"
                    : "Mis cuentas"}
                </strong>

                <small>
                  {esEmpleado
                    ? "Consulta las cuentas registradas en BancoCloud."
                    : "Consulta tus cuentas y saldos disponibles."}
                </small>
              </span>

              <Icon
                name="arrow"
                className="dashboard-action-arrow"
              />
            </button>

            {/* =================================================
                SOLICITUDES
               ================================================= */}

            <button
              type="button"
              className="dashboard-action-card"
              onClick={() =>
                (window.location.href =
                  "/solicitudes")
              }
            >
              <span className="dashboard-action-icon teal">
                <Icon name="file" />
              </span>

              <span className="dashboard-action-copy">
                <strong>
                  Solicitudes
                </strong>

                <small>
                  {esEmpleado
                    ? "Consulta y gestiona las solicitudes de clientes."
                    : "Revisa el estado y crea nuevas solicitudes."}
                </small>
              </span>

              <Icon
                name="arrow"
                className="dashboard-action-arrow"
              />
            </button>

            {/* =================================================
                ADMINISTRACION
               ================================================= */}

            {esEmpleado && (
              <button
                type="button"
                className="dashboard-action-card"
                onClick={() =>
                  (window.location.href =
                    "/empleado")
                }
              >
                <span className="dashboard-action-icon violet">
                  <Icon name="users" />
                </span>

                <span className="dashboard-action-copy">
                  <strong>
                    Administración
                  </strong>

                  <small>
                    Gestiona solicitudes y autoriza clientes.
                  </small>
                </span>

                <Icon
                  name="arrow"
                  className="dashboard-action-arrow"
                />
              </button>
            )}
          </div>
        </section>

        {/* =================================================
            SEGURIDAD
           ================================================= */}

        <section className="dashboard-security-note">
          <span className="dashboard-security-icon">
            <Icon name="check" />
          </span>

          <div>
            <strong>
              Acceso protegido
            </strong>

            <p>
              Tu sesión y permisos son gestionados
              mediante Amazon Cognito.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;