import { useEffect, useState } from "react";

import {
  listarSolicitudes,
  aprobarSolicitud,
  rechazarSolicitud,
  type Solicitud,
} from "../services/solicitudesService";

import {
  listarUsuarios,
  autorizarUsuario,
  type UsuarioCognito,
} from "../services/usuariosService";

import Sidebar from "../components/Sidebar";

import "./Empleado.css";

function badgeClass(value: string) {
  switch (value) {
    case "APROBADA":
      return "status-badge status-approved";

    case "RECHAZADA":
      return "status-badge status-rejected";

    case "PENDIENTE":
      return "status-badge status-pending";

    default:
      return "status-badge";
  }
}

function Empleado() {
  const [solicitudes, setSolicitudes] =
    useState<Solicitud[]>([]);

  const [usuarios, setUsuarios] =
    useState<UsuarioCognito[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [cargandoUsuarios, setCargandoUsuarios] =
    useState(true);

  const [procesando, setProcesando] =
    useState<number | null>(null);

  const [procesandoUsuario, setProcesandoUsuario] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [errorUsuarios, setErrorUsuarios] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  const [mensajeUsuarios, setMensajeUsuarios] =
    useState("");

  const cargarSolicitudes = async () => {
    try {
      setError("");

      const datos =
        await listarSolicitudes();

      setSolicitudes(datos);
    } catch (error) {
      console.error(
        "Error al cargar solicitudes:",
        error
      );

      setSolicitudes([]);

      setError(
        "No se pudieron cargar las solicitudes."
      );
    } finally {
      setCargando(false);
    }
  };

  const cargarUsuarios = async () => {
    try {
      setErrorUsuarios("");

      const datos =
        await listarUsuarios();

      setUsuarios(datos);
    } catch (error) {
      console.error(
        "Error al cargar usuarios:",
        error
      );

      setUsuarios([]);

      setErrorUsuarios(
        "No se pudieron cargar los usuarios."
      );
    } finally {
      setCargandoUsuarios(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
    cargarUsuarios();
  }, []);

  const handleAprobar = async (
    id: number
  ) => {
    try {
      setError("");
      setMensaje("");
      setProcesando(id);

      await aprobarSolicitud(id);

      setMensaje(
        "Solicitud aprobada y cuenta procesada correctamente."
      );

      await cargarSolicitudes();
    } catch (error) {
      console.error(
        "Error al aprobar solicitud:",
        error
      );

      setError(
        "No se pudo aprobar la solicitud. Verifica que tengas permisos de empleado."
      );
    } finally {
      setProcesando(null);
    }
  };

  const handleRechazar = async (
    id: number
  ) => {
    try {
      setError("");
      setMensaje("");
      setProcesando(id);

      await rechazarSolicitud(id);

      setMensaje(
        "Solicitud rechazada correctamente."
      );

      await cargarSolicitudes();
    } catch (error) {
      console.error(
        "Error al rechazar solicitud:",
        error
      );

      setError(
        "No se pudo rechazar la solicitud. Verifica que tengas permisos de empleado."
      );
    } finally {
      setProcesando(null);
    }
  };

  const handleAutorizar = async (
    username: string
  ) => {
    try {
      setErrorUsuarios("");
      setMensajeUsuarios("");
      setProcesandoUsuario(username);

      await autorizarUsuario(
        username
      );

      setMensajeUsuarios(
        "El acceso del usuario fue autorizado correctamente."
      );

      await cargarUsuarios();
    } catch (error) {
      console.error(
        "Error al autorizar usuario:",
        error
      );

      setErrorUsuarios(
        "No se pudo autorizar el usuario. Verifica que tengas permisos de empleado."
      );
    } finally {
      setProcesandoUsuario(null);
    }
  };

  const pendientes =
    solicitudes.filter(
      (solicitud) =>
        solicitud.estado ===
        "PENDIENTE"
    ).length;

  const aprobadas =
    solicitudes.filter(
      (solicitud) =>
        solicitud.estado ===
        "APROBADA"
    ).length;

  const rechazadas =
    solicitudes.filter(
      (solicitud) =>
        solicitud.estado ===
        "RECHAZADA"
    ).length;

  const noAutorizados =
    usuarios.filter(
      (usuario) =>
        usuario.rol !==
          "Empleado" &&
        !usuario.autorizado
    ).length;

  /*
   * Loading inicial:
   * esperamos a que terminen ambas cargas para
   * mostrar el panel completo.
   */
  const cargandoPanel =
    cargando && cargandoUsuarios;

  if (cargandoPanel) {
    return (
      <div className="employee-loading">
        <div
          className="employee-spinner"
          aria-hidden="true"
        />

        <p>
          Cargando panel de empleado...
        </p>
      </div>
    );
  }

  return (
    <div className="employee-page">
      <Sidebar />

      <main className="employee-main">

        {/* =========================================
            HEADER
           ========================================= */}

        <header className="employee-header">
          <div>
            <div className="breadcrumb">
              BANCO CLOUD / ADMINISTRACIÓN
            </div>

            <h1>
              Panel de empleado
            </h1>

            <p>
              Gestiona solicitudes, cuentas y
              accesos de clientes.
            </p>
          </div>

          <div className="header-profile">
            <div className="profile-avatar">
              E
            </div>

            <div>
              <strong>
                Empleado
              </strong>

              <span>
                Sesión activa
              </span>
            </div>
          </div>
        </header>

        {/* =========================================
            HERO
           ========================================= */}

        <section className="employee-hero">
          <div>
            <div className="hero-eyebrow">
              CENTRO DE ADMINISTRACIÓN
            </div>

            <h2>
              Todo bajo control.
            </h2>

            <p>
              Revisa operaciones pendientes y
              gestiona el acceso de los clientes.
            </p>
          </div>

          <div className="hero-mark">
            B
          </div>
        </section>

        {/* =========================================
            ESTADÍSTICAS
           ========================================= */}

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-icon blue">
              ▤
            </div>

            <div>
              <span>
                Total solicitudes
              </span>

              <strong>
                {solicitudes.length}
              </strong>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon amber">
              →
            </div>

            <div>
              <span>
                Pendientes
              </span>

              <strong>
                {pendientes}
              </strong>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon green">
              ✓
            </div>

            <div>
              <span>
                Aprobadas
              </span>

              <strong>
                {aprobadas}
              </strong>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon red">
              ×
            </div>

            <div>
              <span>
                Rechazadas
              </span>

              <strong>
                {rechazadas}
              </strong>
            </div>
          </article>
        </section>

        {/* =========================================
            GESTIÓN DE SOLICITUDES
           ========================================= */}

        <section className="content-card">
          <div className="section-heading">
            <div>
              <div className="section-kicker">
                GESTIÓN DE SOLICITUDES
              </div>

              <h2>
                Solicitudes de clientes
              </h2>
            </div>

            <div className="section-count">
              {pendientes} pendientes
            </div>
          </div>

          {mensaje && (
            <div className="alert success">
              ✓ {mensaje}
            </div>
          )}

          {error && (
            <div className="alert error">
              × {error}
            </div>
          )}

          {cargando ? (
            <div className="empty-state">
              Cargando solicitudes...
            </div>
          ) : solicitudes.length ===
            0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                ▤
              </div>

              <strong>
                No hay solicitudes registradas
              </strong>

              <span>
                Las nuevas solicitudes de clientes
                aparecerán aquí.
              </span>
            </div>
          ) : (
            <div className="request-list">
              {solicitudes.map(
                (solicitud) => (
                  <article
                    className="request-row"
                    key={solicitud.id}
                  >
                    <div className="request-main">

                      <div className="request-title-row">
                        <strong>
                          Solicitud #
                          {solicitud.id}
                        </strong>

                        <span
                          className={badgeClass(
                            solicitud.estado
                          )}
                        >
                          {solicitud.estado}
                        </span>
                      </div>

                      <span className="request-client">
                        Cliente:{" "}
                        {solicitud.cliente}
                      </span>

                      <div className="request-meta">

                        <span>
                          {
                            solicitud.tipoCuenta
                          }
                        </span>

                        <span>
                          $
                          {solicitud.montoInicial.toLocaleString(
                            "es-CL"
                          )}
                        </span>

                        <span>
                          {new Date(
                            solicitud.fechaSolicitud
                          ).toLocaleString(
                            "es-CL"
                          )}
                        </span>

                      </div>

                    </div>

                    {solicitud.estado ===
                      "PENDIENTE" && (
                      <div className="request-actions">

                        <button
                          type="button"
                          className="approve-button"
                          onClick={() =>
                            handleAprobar(
                              solicitud.id
                            )
                          }
                          disabled={
                            procesando ===
                            solicitud.id
                          }
                        >
                          {procesando ===
                          solicitud.id
                            ? "Procesando..."
                            : "Aprobar"}
                        </button>

                        <button
                          type="button"
                          className="reject-button"
                          onClick={() =>
                            handleRechazar(
                              solicitud.id
                            )
                          }
                          disabled={
                            procesando ===
                            solicitud.id
                          }
                        >
                          Rechazar
                        </button>

                      </div>
                    )}
                  </article>
                )
              )}
            </div>
          )}
        </section>

        {/* =========================================
            CONTROL DE ACCESO
           ========================================= */}

        <section className="content-card">

          <div className="section-heading">
            <div>
              <div className="section-kicker">
                CONTROL DE ACCESO
              </div>

              <h2>
                Usuarios registrados
              </h2>
            </div>

            <div className="section-count">
              {noAutorizados} por autorizar
            </div>
          </div>

          {mensajeUsuarios && (
            <div className="alert success">
              ✓ {mensajeUsuarios}
            </div>
          )}

          {errorUsuarios && (
            <div className="alert error">
              × {errorUsuarios}
            </div>
          )}

          {cargandoUsuarios ? (
            <div className="empty-state">
              Cargando usuarios...
            </div>
          ) : usuarios.length ===
            0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                ◯
              </div>

              <strong>
                No hay usuarios registrados
              </strong>

              <span>
                Los nuevos usuarios de Cognito
                aparecerán aquí.
              </span>
            </div>
          ) : (
            <div className="user-list">

              {usuarios.map(
                (usuario) => (
                  <article
                    className="user-row"
                    key={
                      usuario.username
                    }
                  >

                    <div className="user-avatar">
                      {(
                        usuario.email ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="user-main">
                      <strong>
                        {usuario.email ||
                          "Sin correo"}
                      </strong>

                      <span>
                        {usuario.username}
                      </span>
                    </div>

                    <div className="user-details">
                      <span className="detail-label">
                        Rol
                      </span>

                      <span className="detail-value">
                        {usuario.rol}
                      </span>
                    </div>

                    <div className="user-details">
                      <span className="detail-label">
                        Estado
                      </span>

                      <span className="detail-value">
                        {usuario.estado}
                      </span>
                    </div>

                    <div className="user-access">
                      {usuario.rol ===
                      "Empleado" ? (
                        <span className="access-badge employee">
                          Empleado
                        </span>
                      ) : usuario.autorizado ? (
                        <span className="access-badge authorized">
                          Autorizado
                        </span>
                      ) : (
                        <span className="access-badge pending">
                          No autorizado
                        </span>
                      )}
                    </div>

                    {usuario.rol !==
                      "Empleado" &&
                      !usuario.autorizado && (
                        <button
                          type="button"
                          className="authorize-button"
                          onClick={() =>
                            handleAutorizar(
                              usuario.username
                            )
                          }
                          disabled={
                            procesandoUsuario ===
                            usuario.username
                          }
                        >
                          {procesandoUsuario ===
                          usuario.username
                            ? "Autorizando..."
                            : "Autorizar acceso"}
                        </button>
                      )}

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

export default Empleado;