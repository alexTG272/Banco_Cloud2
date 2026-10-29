import { useEffect, useMemo, useState, type FormEvent } from "react";

import Icon from "../components/Icon";
import Sidebar from "../components/Sidebar";
import {
  obtenerGrupos,
  obtenerUsuarioActual,
} from "../services/authService";
import {
  crearSolicitud,
  listarSolicitudes,
  type Solicitud,
} from "../services/solicitudesService";

import "./Solicitudes.css";

const formatearMonto = (valor: number) =>
  `$${valor.toLocaleString("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [tipoCuenta, setTipoCuenta] = useState("Cuenta Corriente");
  const [montoInicial, setMontoInicial] = useState("");

  const [rol, setRol] = useState("");
  const [usuario, setUsuario] = useState("");

  const [cargando, setCargando] = useState(true);
  const [recargando, setRecargando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const cargarDatos = async (silencioso = false) => {
    try {
      setError("");

      if (silencioso) {
        setRecargando(true);
      } else {
        setCargando(true);
      }

      // Primero obtenemos identidad y rol desde Cognito.
      // Esto permite que la interfaz conozca el rol
      // aunque el backend tenga un problema temporal.
      try {
        const usuarioActual = await obtenerUsuarioActual();
        const grupos = await obtenerGrupos();

        setUsuario(usuarioActual?.username ?? "");

        if (grupos.includes("Empleado")) {
          setRol("Empleado");
        } else if (grupos.includes("Cliente")) {
          setRol("Cliente");
        } else {
          setRol("Sin rol");
        }
      } catch (authError) {
        console.error("Error al obtener datos de Cognito:", authError);
        setRol("Sin rol");
      }

      // Luego cargamos las solicitudes.
      try {
        const datos = await listarSolicitudes();
        setSolicitudes(datos);
      } catch (backendError) {
        console.error("Error al cargar solicitudes:", backendError);
        setSolicitudes([]);
        setError(
          "No se pudieron cargar las solicitudes. Intenta nuevamente."
        );
      }
    } finally {
      setCargando(false);
      setRecargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const resumen = useMemo(() => {
    return {
      total: solicitudes.length,
      pendientes: solicitudes.filter(
        (solicitud) => solicitud.estado === "PENDIENTE"
      ).length,
      aprobadas: solicitudes.filter(
        (solicitud) => solicitud.estado === "APROBADA"
      ).length,
      rechazadas: solicitudes.filter(
        (solicitud) => solicitud.estado === "RECHAZADA"
      ).length,
    };
  }, [solicitudes]);

  const handleCrearSolicitud = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMensaje("");
    setError("");

    const monto = Number(montoInicial);

    if (!Number.isFinite(monto) || monto <= 0) {
      setError("El monto inicial debe ser mayor que 0.");
      return;
    }

    try {
      setEnviando(true);

      await crearSolicitud({
        tipoCuenta,
        montoInicial: monto,
      });

      setMontoInicial("");

      setMensaje(
        "Solicitud creada correctamente. Quedó pendiente de revisión."
      );

      await cargarDatos(true);
    } catch (err) {
      console.error("Error al crear solicitud:", err);

      setError(
        "No se pudo crear la solicitud. Intenta nuevamente."
      );
    } finally {
      setEnviando(false);
    }
  };

  const esEmpleado = rol === "Empleado";
  const esCliente = rol === "Cliente";

  if (cargando) {
    return (
      <div className="requests-loading">
        <div className="requests-spinner" aria-hidden="true" />
        <p>Cargando tus solicitudes...</p>
      </div>
    );
  }

  return (
    <div className="requests-page">
      <Sidebar />

      <main className="requests-main">
        <header className="requests-topbar">
          <div>
            <p className="requests-breadcrumb">
              BANCO CLOUD / SOLICITUDES
            </p>

            <h1>
              {esEmpleado ? "Solicitudes" : "Mis solicitudes"}
            </h1>

            <p className="requests-subtitle">
              {esEmpleado
                ? "Consulta el estado general de las solicitudes registradas."
                : "Solicita la apertura de una cuenta y revisa su estado."}
            </p>
          </div>

          <div className="requests-user">
            <span className="requests-user-icon">
              <Icon name="user" />
            </span>

            <div>
              <strong>{rol || "Usuario"}</strong>
              <span>{usuario || "Sesión activa"}</span>
            </div>
          </div>
        </header>

        {/* ==========================================
            FORMULARIO PARA CLIENTES
        ========================================== */}
        {esCliente && (
          <section className="requests-form-card">
            <div className="requests-card-heading">
              <div>
                <p className="requests-eyebrow">
                  NUEVA SOLICITUD
                </p>

                <h2>
                  Solicitar apertura de cuenta
                </h2>

                <p>
                  Completa los datos y envía tu solicitud
                  para revisión.
                </p>
              </div>

              <span className="requests-card-icon">
                <Icon name="plus" />
              </span>
            </div>

            <form
              className="requests-form"
              onSubmit={handleCrearSolicitud}
            >
              <div className="requests-form-grid">
                
                {/* CAMPO: TIPO DE CUENTA */}
                <label>
                  <span>Tipo de cuenta</span>

                  <div className="requests-select-wrap">
                    <select
                      value={tipoCuenta}
                      onChange={(event) =>
                        setTipoCuenta(event.target.value)
                      }
                    >
                      <option value="Cuenta Corriente">
                        Cuenta Corriente
                      </option>

                      <option value="Cuenta Ahorro">
                        Cuenta Ahorro
                      </option>

                      <option value="Cuenta Vista">
                        Cuenta Vista
                      </option>
                    </select>
                  </div>
                  
                  <small>
                    Selecciona el tipo de cuenta a abrir.
                  </small>
                </label>

                {/* CAMPO: MONTO INICIAL */}
                <label>
                  <span>Monto inicial</span>

                  <div className="requests-input-wrap">
                    <span>$</span>

                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={montoInicial}
                      onChange={(event) =>
                        setMontoInicial(event.target.value)
                      }
                      placeholder="10000"
                      required
                    />
                  </div>

                  <small>
                    Ingresa el monto inicial que deseas depositar.
                  </small>
                </label>
              </div>

              <div className="requests-form-footer">
                <div className="requests-info-note">
                  <span>
                    <Icon name="check" />
                  </span>

                  <p>
                    La solicitud será enviada como{" "}
                    <strong>PENDIENTE</strong>{" "}
                    para revisión de un empleado.
                  </p>
                </div>

                <button
                  className="requests-primary-button"
                  type="submit"
                  disabled={enviando}
                >
                  {enviando
                    ? "Enviando..."
                    : "Crear solicitud"}

                  <Icon name="arrow" />
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ==========================================
            MENSAJES
        ========================================== */}

        {mensaje && (
          <section
            className="requests-message requests-message-success"
            role="status"
          >
            <span className="requests-message-icon">
              <Icon name="check" />
            </span>

            <div>
              <strong>Solicitud creada</strong>
              <p>{mensaje}</p>
            </div>
          </section>
        )}

        {error && (
          <section
            className="requests-message requests-message-error"
            role="alert"
          >
            <span className="requests-message-icon">
              <Icon name="close" />
            </span>

            <div>
              <strong>
                No pudimos completar la solicitud
              </strong>

              <p>{error}</p>
            </div>

            <button
              onClick={() => cargarDatos(true)}
              disabled={recargando}
            >
              {recargando
                ? "Actualizando..."
                : "Reintentar"}
            </button>
          </section>
        )}

        {/* ==========================================
            RESUMEN
        ========================================== */}

        <section className="requests-summary-grid">
          <article className="requests-summary-card requests-summary-card-primary">
            <span className="requests-summary-icon">
              <Icon name="file" />
            </span>

            <div>
              <p>Total solicitudes</p>
              <strong>{resumen.total}</strong>
            </div>
          </article>

          <article className="requests-summary-card requests-summary-card-pending">
            <span className="requests-summary-icon">
              <Icon name="arrow" />
            </span>

            <div>
              <p>Pendientes</p>
              <strong>{resumen.pendientes}</strong>
            </div>
          </article>

          <article className="requests-summary-card requests-summary-card-success">
            <span className="requests-summary-icon">
              <Icon name="check" />
            </span>

            <div>
              <p>Aprobadas</p>
              <strong>{resumen.aprobadas}</strong>
            </div>
          </article>

          <article className="requests-summary-card requests-summary-card-danger">
            <span className="requests-summary-icon">
              <Icon name="close" />
            </span>

            <div>
              <p>Rechazadas</p>
              <strong>{resumen.rechazadas}</strong>
            </div>
          </article>
        </section>

        {/* ==========================================
            HISTORIAL
        ========================================== */}

        <section className="requests-content-card">
          <div className="requests-content-heading">
            <div>
              <p className="requests-eyebrow">
                HISTORIAL
              </p>

              <h2>
                {esEmpleado
                  ? "Solicitudes registradas"
                  : "Mis solicitudes"}
              </h2>
            </div>

            <button
              className="requests-refresh-button"
              onClick={() => cargarDatos(true)}
              disabled={recargando}
            >
              <Icon name="arrow" />

              {recargando
                ? "Actualizando..."
                : "Actualizar"}
            </button>
          </div>

          {solicitudes.length === 0 ? (
            <div className="requests-empty">
              <span className="requests-empty-icon">
                <Icon name="file" />
              </span>

              <h3>
                {esEmpleado
                  ? "No hay solicitudes registradas"
                  : "No tienes solicitudes registradas"}
              </h3>

              <p>
                {esEmpleado
                  ? "Cuando existan solicitudes de clientes, aparecerán en este listado."
                  : "Cuando crees una solicitud, podrás revisar aquí su estado."}
              </p>

              {esCliente && (
                <button
                  className="requests-secondary-button"
                  onClick={() =>
                    document
                      .querySelector(".requests-form-card")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                >
                  Crear solicitud

                  <Icon name="arrow" />
                </button>
              )}
            </div>
          ) : (
            <div className="requests-list">
              {solicitudes.map((solicitud) => {
                const estado =
                  solicitud.estado.toUpperCase();

                const estadoClass =
                  estado === "APROBADA"
                    ? "approved"
                    : estado === "RECHAZADA"
                      ? "rejected"
                      : "pending";

                return (
                  <article
                    className="request-item"
                    key={solicitud.id}
                  >
                    <div className="request-item-icon">
                      <Icon name="file" />
                    </div>

                    <div className="request-item-main">
                      <div className="request-item-topline">
                        <div>
                          <p className="request-item-label">
                            SOLICITUD #{solicitud.id}
                          </p>

                          <h3>
                            {solicitud.tipoCuenta}
                          </h3>
                        </div>

                        <span
                          className={`request-status ${estadoClass}`}
                        >
                          <span className="request-status-dot" />

                          {estado}
                        </span>
                      </div>

                      <div className="request-item-details">
                        <div>
                          <span>Monto inicial</span>

                          <strong>
                            {formatearMonto(
                              solicitud.montoInicial
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Fecha de solicitud
                          </span>

                          <strong>
                            {new Date(
                              solicitud.fechaSolicitud
                            ).toLocaleString("es-CL")}
                          </strong>
                        </div>

                        {esEmpleado && (
                          <div>
                            <span>Cliente</span>

                            <strong>
                              {solicitud.cliente}
                            </strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Solicitudes;