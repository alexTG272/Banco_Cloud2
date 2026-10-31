
import { useCallback, useEffect, useState } from "react";

import {
  crearCola,
  eliminarCola,
  crearExchange,
  eliminarExchange,
  crearBinding,
  eliminarBinding,
  listarColas,
  listarExchanges,
  listarBindings,
  type QueueInfo,
  type ExchangeInfo,
  type BindingInfo,
  type BindingRequest,
  type ExchangeRequest,
} from "../services/rabbitMQAdminService";

type Seccion = "colas" | "exchanges" | "bindings";

function RabbitMQAdmin() {
  const [seccion, setSeccion] = useState<Seccion>("colas");

  const [colas, setColas] = useState<QueueInfo[]>([]);
  const [exchanges, setExchanges] = useState<ExchangeInfo[]>([]);
  const [bindings, setBindings] = useState<BindingInfo[]>([]);

  const [nombreCola, setNombreCola] = useState("");
  const [nombreExchange, setNombreExchange] = useState("");
  const [tipoExchange, setTipoExchange] =
    useState<ExchangeRequest["tipo"]>("DIRECT");

  // Estado independiente para crear bindings
  const [binding, setBinding] = useState<BindingRequest>({
    nombreCola: "",
    nombreExchange: "",
    routingKey: "",
  });

  // Estado independiente para eliminar bindings
  const [bindingEliminar, setBindingEliminar] =
    useState<BindingRequest>({
      nombreCola: "",
      nombreExchange: "",
      routingKey: "",
    });

  const [nombreEliminar, setNombreEliminar] = useState("");

  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [ultimaActualizacion, setUltimaActualizacion] = useState("");

  const limpiarMensajes = () => {
    setMensaje("");
    setError("");
  };

  // ==========================================
  // CONSULTAR INFORMACIÓN DE RABBITMQ
  // ==========================================

  const cargarDatos = useCallback(async () => {
    try {
      setCargandoDatos(true);
      setError("");

      const [datosColas, datosExchanges, datosBindings] =
        await Promise.all([
          listarColas(),
          listarExchanges(),
          listarBindings(),
        ]);

      setColas(datosColas);
      setExchanges(datosExchanges);
      setBindings(datosBindings);

      setUltimaActualizacion(
        new Date().toLocaleTimeString("es-CL")
      );
    } catch (err: unknown) {
      console.error("Error consultando RabbitMQ:", err);
      setError("No se pudo obtener la información actual de RabbitMQ.");
    } finally {
      setCargandoDatos(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  // ==========================================
  // EJECUCIÓN SEGURA DE OPERACIONES
  // ==========================================

  const ejecutarOperacion = async (
    operacion: () => Promise<string>
  ): Promise<boolean> => {
    try {
      setCargando(true);
      limpiarMensajes();

      const respuesta = await operacion();

      setMensaje(
        typeof respuesta === "string"
          ? respuesta
          : "Operación realizada correctamente."
      );

      return true;
    } catch (err: unknown) {
      console.error("Error en administración RabbitMQ:", err);

      const errorApi = err as {
        response?: {
          data?: unknown;
        };
        message?: string;
      };

      const datos = errorApi.response?.data;

      let mensajeError = "No se pudo completar la operación.";

      if (typeof datos === "string") {
        mensajeError = datos;
      } else if (datos && typeof datos === "object") {
        const detalle = datos as Record<string, unknown>;

        if (typeof detalle.mensaje === "string") {
          mensajeError = detalle.mensaje;
        } else if (typeof detalle.message === "string") {
          mensajeError = detalle.message;
        } else if (typeof detalle.error === "string") {
          mensajeError = detalle.error;
        }
      } else if (errorApi.message) {
        mensajeError = errorApi.message;
      }

      setError(mensajeError);
      return false;
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // COLAS
  // ==========================================

  const handleCrearCola = async () => {
    if (!nombreCola.trim()) {
      setError("Debes ingresar el nombre de la cola.");
      return;
    }

    const correcto = await ejecutarOperacion(() =>
      crearCola(nombreCola.trim())
    );

    if (correcto) {
      setNombreCola("");
      await cargarDatos();
    }
  };

  const handleEliminarCola = async () => {
    if (!nombreEliminar.trim()) {
      setError("Debes ingresar el nombre de la cola.");
      return;
    }

    const correcto = await ejecutarOperacion(() =>
      eliminarCola(nombreEliminar.trim())
    );

    if (correcto) {
      setNombreEliminar("");
      await cargarDatos();
    }
  };

  // ==========================================
  // EXCHANGES
  // ==========================================

  const handleCrearExchange = async () => {
    if (!nombreExchange.trim()) {
      setError("Debes ingresar el nombre del exchange.");
      return;
    }

    const correcto = await ejecutarOperacion(() =>
      crearExchange(nombreExchange.trim(), tipoExchange)
    );

    if (correcto) {
      setNombreExchange("");
      await cargarDatos();
    }
  };

  const handleEliminarExchange = async () => {
    if (!nombreEliminar.trim()) {
      setError("Debes ingresar el nombre del exchange.");
      return;
    }

    const correcto = await ejecutarOperacion(() =>
      eliminarExchange(nombreEliminar.trim())
    );

    if (correcto) {
      setNombreEliminar("");
      await cargarDatos();
    }
  };

  // ==========================================
  // BINDINGS
  // ==========================================

  const handleCrearBinding = async () => {
    if (
      !binding.nombreCola.trim() ||
      !binding.nombreExchange.trim() ||
      !binding.routingKey.trim()
    ) {
      setError("Debes completar todos los campos del binding.");
      return;
    }

    const correcto = await ejecutarOperacion(() =>
      crearBinding({
        nombreCola: binding.nombreCola.trim(),
        nombreExchange: binding.nombreExchange.trim(),
        routingKey: binding.routingKey.trim(),
      })
    );

    if (correcto) {
      setBinding({
        nombreCola: "",
        nombreExchange: "",
        routingKey: "",
      });

      await cargarDatos();
    }
  };

  const handleEliminarBinding = async () => {
    if (
      !bindingEliminar.nombreCola.trim() ||
      !bindingEliminar.nombreExchange.trim() ||
      !bindingEliminar.routingKey.trim()
    ) {
      setError("Completa los datos del binding que deseas eliminar.");
      return;
    }

    const correcto = await ejecutarOperacion(() =>
      eliminarBinding({
        nombreCola: bindingEliminar.nombreCola.trim(),
        nombreExchange: bindingEliminar.nombreExchange.trim(),
        routingKey: bindingEliminar.routingKey.trim(),
      })
    );

    if (correcto) {
      setBindingEliminar({
        nombreCola: "",
        nombreExchange: "",
        routingKey: "",
      });

      await cargarDatos();
    }
  };

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <section className="rabbit-admin">

      <div className="rabbit-admin-heading">
        <div>
          <span className="rabbit-section-kicker">
            GESTIÓN DEL BROKER
          </span>

          <h2>Administración de RabbitMQ</h2>

          <p>
            Administra y supervisa colas, exchanges y bindings
            directamente desde BancoCloud.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            limpiarMensajes();
            void cargarDatos();
          }}
          disabled={cargandoDatos || cargando}
        >
          {cargandoDatos ? "Actualizando..." : "↻ Actualizar"}
        </button>
      </div>

      {/* MÉTRICAS GENERALES */}

      <div className="rabbit-admin-grid">

        <article className="rabbit-admin-card">
          <span>COLAS</span>
          <h3>{colas.length}</h3>
          <p>Colas registradas en el broker</p>
        </article>

        <article className="rabbit-admin-card">
          <span>EXCHANGES</span>
          <h3>{exchanges.length}</h3>
          <p>Exchanges disponibles</p>
        </article>

        <article className="rabbit-admin-card">
          <span>BINDINGS</span>
          <h3>{bindings.length}</h3>
          <p>Vinculaciones registradas</p>
        </article>

      </div>

      {ultimaActualizacion && (
        <p className="rabbit-admin-hint">
          Última actualización: {ultimaActualizacion}
        </p>
      )}

      {/* PESTAÑAS */}

      <div className="rabbit-admin-tabs">

        <button
          type="button"
          className={seccion === "colas" ? "active" : ""}
          onClick={() => {
            setSeccion("colas");
            limpiarMensajes();
          }}
        >
          Colas ({colas.length})
        </button>

        <button
          type="button"
          className={seccion === "exchanges" ? "active" : ""}
          onClick={() => {
            setSeccion("exchanges");
            limpiarMensajes();
          }}
        >
          Exchanges ({exchanges.length})
        </button>

        <button
          type="button"
          className={seccion === "bindings" ? "active" : ""}
          onClick={() => {
            setSeccion("bindings");
            limpiarMensajes();
          }}
        >
          Bindings ({bindings.length})
        </button>

      </div>

      {/* MENSAJES */}

      {mensaje && (
        <div className="rabbit-admin-alert success" role="status">
          ✓ {mensaje}
        </div>
      )}

      {error && (
        <div className="rabbit-admin-alert error" role="alert">
          ! {error}
        </div>
      )}

      {cargandoDatos && (
        <p className="rabbit-admin-hint">
          Consultando información de RabbitMQ...
        </p>
      )}

      {/* ======================================
          COLAS
      ====================================== */}

      {seccion === "colas" && (
        <>

          <article className="rabbit-admin-card">

            <h3>Colas registradas</h3>

            <div style={{ overflowX: "auto" }}>
              <table className="rabbit-admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Estado</th>
                    <th>Mensajes</th>
                    <th>Pendientes</th>
                    <th>Consumidores</th>
                    <th>Durable</th>
                  </tr>
                </thead>

                <tbody>
                  {colas.map((cola) => (
                    <tr key={`${cola.vhost}-${cola.name}`}>
                      <td>{cola.name || "(exchange predeterminado)"}</td>
                      <td>
                        <span className="rabbit-admin-status">
                          {cola.state}
                        </span>
                      </td>
                      <td>{cola.messages}</td>
                      <td>{cola.messages_ready}</td>
                      <td>{cola.consumers}</td>
                      <td>{cola.durable ? "Sí" : "No"}</td>
                    </tr>
                  ))}

                  {!cargandoDatos && colas.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        No hay colas disponibles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </article>

          <div className="rabbit-admin-grid rabbit-admin-actions">

            <article className="rabbit-admin-card">

              <h3>Crear cola</h3>
              <p>Declara una nueva cola durable en RabbitMQ.</p>

              <label htmlFor="admin-queue-name">
                Nombre de la cola
              </label>

              <input
                id="admin-queue-name"
                value={nombreCola}
                onChange={(e) => setNombreCola(e.target.value)}
                placeholder="bancocloud.mi.cola"
                maxLength={200}
                disabled={cargando}
              />

              <button
                type="button"
                onClick={handleCrearCola}
                disabled={cargando}
              >
                {cargando ? "Procesando..." : "Crear cola"}
              </button>

            </article>

            <article className="rabbit-admin-card danger">

              <h3>Eliminar cola</h3>
              <p>Elimina una cola existente del broker.</p>

              <label htmlFor="admin-delete-queue">
                Nombre de la cola
              </label>

              <input
                id="admin-delete-queue"
                value={nombreEliminar}
                onChange={(e) => setNombreEliminar(e.target.value)}
                placeholder="bancocloud.mi.cola"
                disabled={cargando}
              />

              <button
                type="button"
                onClick={handleEliminarCola}
                disabled={cargando}
              >
                {cargando ? "Procesando..." : "Eliminar cola"}
              </button>

            </article>

          </div>
        </>
      )}

      {/* ======================================
          EXCHANGES
      ====================================== */}

      {seccion === "exchanges" && (
        <>

          <article className="rabbit-admin-card">

            <h3>Exchanges registrados</h3>

            <div style={{ overflowX: "auto" }}>
              <table className="rabbit-admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Durable</th>
                    <th>Interno</th>
                  </tr>
                </thead>

                <tbody>
                  {exchanges.map((exchange) => (
                    <tr key={`${exchange.vhost}-${exchange.name}`}>
                      <td>
                        {exchange.name || "(predeterminado)"}
                      </td>
                      <td>{exchange.type}</td>
                      <td>
                        <span className="rabbit-admin-status">
                          Disponible
                        </span>
                      </td>
                      <td>{exchange.durable ? "Sí" : "No"}</td>
                      <td>{exchange.internal ? "Sí" : "No"}</td>
                    </tr>
                  ))}

                  {!cargandoDatos && exchanges.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        No hay exchanges disponibles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </article>

          <div className="rabbit-admin-grid rabbit-admin-actions">

            <article className="rabbit-admin-card">

              <h3>Crear exchange</h3>
              <p>Declara un exchange para enrutar mensajes.</p>

              <label htmlFor="admin-exchange-name">
                Nombre
              </label>

              <input
                id="admin-exchange-name"
                value={nombreExchange}
                onChange={(e) => setNombreExchange(e.target.value)}
                placeholder="bancocloud.mi.exchange"
                maxLength={200}
                disabled={cargando}
              />

              <label htmlFor="admin-exchange-type">
                Tipo de exchange
              </label>

              <select
                id="admin-exchange-type"
                value={tipoExchange}
                onChange={(e) =>
                  setTipoExchange(
                    e.target.value as ExchangeRequest["tipo"]
                  )
                }
                disabled={cargando}
              >
                <option value="DIRECT">Direct</option>
                <option value="TOPIC">Topic</option>
              </select>

              <button
                type="button"
                onClick={handleCrearExchange}
                disabled={cargando}
              >
                {cargando ? "Procesando..." : "Crear exchange"}
              </button>

            </article>

            <article className="rabbit-admin-card danger">

              <h3>Eliminar exchange</h3>
              <p>Elimina un exchange existente del broker.</p>

              <label htmlFor="admin-delete-exchange">
                Nombre
              </label>

              <input
                id="admin-delete-exchange"
                value={nombreEliminar}
                onChange={(e) => setNombreEliminar(e.target.value)}
                placeholder="bancocloud.mi.exchange"
                disabled={cargando}
              />

              <button
                type="button"
                onClick={handleEliminarExchange}
                disabled={cargando}
              >
                {cargando ? "Procesando..." : "Eliminar exchange"}
              </button>

            </article>

          </div>
        </>
      )}

      {/* ======================================
          BINDINGS
      ====================================== */}

      {seccion === "bindings" && (
        <>

          <article className="rabbit-admin-card">

            <h3>Bindings registrados</h3>

            <div style={{ overflowX: "auto" }}>
              <table className="rabbit-admin-table">
                <thead>
                  <tr>
                    <th>Exchange origen</th>
                    <th>Cola destino</th>
                    <th>Routing key</th>
                    <th>Tipo destino</th>
                  </tr>
                </thead>

                <tbody>
                  {bindings.map((item, index) => (
                    <tr
                      key={`${item.source}-${item.destination}-${item.routing_key}-${index}`}
                    >
                      <td>{item.source || "(predeterminado)"}</td>
                      <td>{item.destination}</td>
                      <td>{item.routing_key}</td>
                      <td>{item.destination_type}</td>
                    </tr>
                  ))}

                  {!cargandoDatos && bindings.length === 0 && (
                    <tr>
                      <td colSpan={4}>
                        No hay bindings disponibles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </article>

          <div className="rabbit-admin-grid rabbit-admin-actions">

            {/* CREAR BINDING */}

            <article className="rabbit-admin-card">

              <h3>Crear binding</h3>

              <p>
                Vincula una cola con un exchange mediante una routing key.
              </p>

              <label htmlFor="binding-queue">
                Nombre de la cola
              </label>

              <input
                id="binding-queue"
                value={binding.nombreCola}
                onChange={(e) =>
                  setBinding({
                    ...binding,
                    nombreCola: e.target.value,
                  })
                }
                placeholder="bancocloud.mi.cola"
                disabled={cargando}
              />

              <label htmlFor="binding-exchange">
                Nombre del exchange
              </label>

              <input
                id="binding-exchange"
                value={binding.nombreExchange}
                onChange={(e) =>
                  setBinding({
                    ...binding,
                    nombreExchange: e.target.value,
                  })
                }
                placeholder="bancocloud.mi.exchange"
                disabled={cargando}
              />

              <label htmlFor="binding-routing">
                Routing key
              </label>

              <input
                id="binding-routing"
                value={binding.routingKey}
                onChange={(e) =>
                  setBinding({
                    ...binding,
                    routingKey: e.target.value,
                  })
                }
                placeholder="mensaje.creado"
                disabled={cargando}
              />

              <button
                type="button"
                onClick={handleCrearBinding}
                disabled={cargando}
              >
                {cargando ? "Procesando..." : "Crear binding"}
              </button>

            </article>

            {/* ELIMINAR BINDING */}

            <article className="rabbit-admin-card danger">

              <h3>Eliminar binding</h3>

              <p>
                Elimina la vinculación indicada entre una cola y un exchange.
              </p>

              <label htmlFor="delete-binding-queue">
                Nombre de la cola
              </label>

              <input
                id="delete-binding-queue"
                value={bindingEliminar.nombreCola}
                onChange={(e) =>
                  setBindingEliminar({
                    ...bindingEliminar,
                    nombreCola: e.target.value,
                  })
                }
                placeholder="bancocloud.mi.cola"
                disabled={cargando}
              />

              <label htmlFor="delete-binding-exchange">
                Nombre del exchange
              </label>

              <input
                id="delete-binding-exchange"
                value={bindingEliminar.nombreExchange}
                onChange={(e) =>
                  setBindingEliminar({
                    ...bindingEliminar,
                    nombreExchange: e.target.value,
                  })
                }
                placeholder="bancocloud.mi.exchange"
                disabled={cargando}
              />

              <label htmlFor="delete-binding-routing">
                Routing key
              </label>

              <input
                id="delete-binding-routing"
                value={bindingEliminar.routingKey}
                onChange={(e) =>
                  setBindingEliminar({
                    ...bindingEliminar,
                    routingKey: e.target.value,
                  })
                }
                placeholder="mensaje.creado"
                disabled={cargando}
              />

              <button
                type="button"
                onClick={handleEliminarBinding}
                disabled={cargando}
              >
                {cargando ? "Procesando..." : "Eliminar binding"}
              </button>

            </article>

          </div>
        </>
      )}

    </section>
  );
}

export default RabbitMQAdmin;
