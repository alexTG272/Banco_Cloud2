
import { useState } from "react";

import Sidebar from "../components/Sidebar";
import RabbitMQAdmin from "./RabbitMQAdmin";

import {
  enviarMensajeDemo,
  consultarEstadoDemo,
  type DemoMessageStatus,
} from "../services/rabbitMQDemoService";

import "./RabbitMQ.css";

function RabbitMQ() {
  const [contenido, setContenido] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [estadoActual, setEstadoActual] =
    useState<DemoMessageStatus | null>(null);

  const [historial, setHistorial] =
    useState<DemoMessageStatus[]>([]);

  const [consultando, setConsultando] = useState(false);

  const actualizarHistorial = (
    nuevoEstado: DemoMessageStatus
  ) => {
    setHistorial((actual) => {
      const existe = actual.some(
        (item) => item.id === nuevoEstado.id
      );

      if (existe) {
        return actual.map((item) =>
          item.id === nuevoEstado.id
            ? nuevoEstado
            : item
        );
      }

      return [nuevoEstado, ...actual];
    });
  };

  const consultarMensaje = async (id: string) => {
    setConsultando(true);

    try {
      const resultado = await consultarEstadoDemo(id);

      setEstadoActual(resultado);
      actualizarHistorial(resultado);

      return resultado;
    } finally {
      setConsultando(false);
    }
  };

  const handleEnviar = async () => {
    if (!contenido.trim()) {
      setError("Debes escribir un mensaje antes de enviarlo.");
      return;
    }

    try {
      setEnviando(true);
      setError("");
      setMensaje("");
      setEstadoActual(null);

      const respuesta = await enviarMensajeDemo(
        contenido.trim()
      );

      setMensaje("Mensaje aceptado para su publicación.");

      // Consultar el procesamiento durante un máximo de 10 segundos.
      let resultado: DemoMessageStatus | null = null;

      for (let intento = 0; intento < 10; intento++) {
        resultado = await consultarEstadoDemo(respuesta.id);

        setEstadoActual(resultado);
        actualizarHistorial(resultado);

        if (
          resultado.estado === "PROCESADO_ACK_ENVIADO" ||
          resultado.estado === "ERROR"
        ) {
          break;
        }

        if (intento < 9) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000)
          );
        }
      }

      if (resultado?.estado === "PROCESADO_ACK_ENVIADO") {
        setMensaje(
          "El consumidor procesó el mensaje y confirmó su recepción mediante ACK."
        );
      } else if (resultado?.estado === "ERROR") {
        setError("El consumidor informó un error al procesar el mensaje.");
      } else {
        setMensaje(
          "El mensaje fue publicado. Su procesamiento continúa pendiente."
        );
      }

      setContenido("");
    } catch (err) {
      console.error("Error en demostración RabbitMQ:", err);

      setError(
        "No se pudo completar la operación. Comprueba la conexión con BancoCloud."
      );
    } finally {
      setEnviando(false);
    }
  };

  const handleActualizarEstado = async () => {
    if (!estadoActual?.id) return;

    try {
      setError("");

      const resultado = await consultarMensaje(estadoActual.id);

      if (resultado.estado === "PROCESADO_ACK_ENVIADO") {
        setMensaje("Mensaje procesado correctamente. ACK confirmado.");
      } else if (resultado.estado === "ERROR") {
        setError("El mensaje terminó con un error de procesamiento.");
      } else {
        setMensaje("El mensaje todavía está pendiente de procesamiento.");
      }
    } catch (err) {
      console.error("Error al consultar estado:", err);
      setError("No se pudo consultar el estado del mensaje.");
    }
  };

  const estadoEsProcesado =
    estadoActual?.estado === "PROCESADO_ACK_ENVIADO";

  const estadoEsError =
    estadoActual?.estado === "ERROR";

  const formatoFecha = (fecha?: string | null) => {
    if (!fecha) return "Pendiente";

    return new Date(fecha).toLocaleString("es-CL");
  };

  return (
    <div className="rabbit-page">
      <Sidebar />

      <main className="rabbit-main">
        <header className="rabbit-header">
          <div>
            <div className="rabbit-breadcrumb">
              BANCO CLOUD / INFRAESTRUCTURA
            </div>

            <h1>RabbitMQ</h1>

            <p>
              Administración y demostración de mensajería asíncrona.
            </p>
          </div>

          <div className="rabbit-header-tag">
            <span className="rabbit-status-dot" />
            Módulo de demostración
          </div>
        </header>

        <section className="rabbit-hero">
          <div className="rabbit-hero-content">
            <span className="rabbit-eyebrow">
              MENSAJERÍA ASÍNCRONA
            </span>

            <h2>
              Comunicación entre servicios.
            </h2>

            <p>
              Envía mensajes al broker, comprueba su recepción
              y visualiza la confirmación de procesamiento del consumidor.
            </p>
          </div>

          <div className="rabbit-hero-icon">
            <span>RMQ</span>
          </div>
        </section>

        {/* Administración de colas, exchanges y bindings */}
        <RabbitMQAdmin />

        <section className="rabbit-section">
          <div className="rabbit-section-heading">
            <div>
              <span className="rabbit-section-kicker">
                CONFIGURACIÓN
              </span>
              <h2>Componentes de mensajería</h2>
              <p>
                Recursos utilizados por la demostración.
              </p>
            </div>
          </div>

          <div className="rabbit-info-grid">
            <article className="rabbit-info-card">
              <div className="rabbit-info-icon exchange">
                ↔
              </div>
              <div>
                <span>EXCHANGE</span>
                <strong>bancocloud.demo.exchange</strong>
                <small>Tipo Direct · Durable</small>
              </div>
            </article>

            <article className="rabbit-info-card">
              <div className="rabbit-info-icon queue">
                ▤
              </div>
              <div>
                <span>COLA</span>
                <strong>bancocloud.demo.queue</strong>
                <small>Cola durable</small>
              </div>
            </article>

            <article className="rabbit-info-card">
              <div className="rabbit-info-icon routing">
                ⇢
              </div>
              <div>
                <span>ROUTING KEY</span>
                <strong>demo.mensaje</strong>
                <small>Clave de enrutamiento</small>
              </div>
            </article>
          </div>
        </section>

        <section className="rabbit-workspace">
          <div className="rabbit-form-card">
            <div className="rabbit-section-heading">
              <div>
                <span className="rabbit-section-kicker">
                  PRODUCTOR
                </span>
                <h2>Enviar un mensaje</h2>
                <p>
                  Escribe el contenido que deseas publicar en RabbitMQ.
                </p>
              </div>

              <div className="rabbit-card-icon">
                ↑
              </div>
            </div>

            <label htmlFor="rabbit-message">
              Contenido del mensaje
            </label>

            <textarea
              id="rabbit-message"
              value={contenido}
              onChange={(event) =>
                setContenido(event.target.value)
              }
              placeholder="Ejemplo: Mensaje de prueba desde BancoCloud..."
              maxLength={500}
              rows={5}
              disabled={enviando}
            />

            <div className="rabbit-input-footer">
              <span>{contenido.length}/500 caracteres</span>
              <span>Formato de mensaje: JSON</span>
            </div>

            <button
              type="button"
              className="rabbit-send-button"
              onClick={handleEnviar}
              disabled={enviando || !contenido.trim()}
            >
              {enviando ? (
                <>
                  <span className="rabbit-button-spinner" />
                  Enviando mensaje...
                </>
              ) : (
                <>
                  <span>↑</span>
                  Enviar mensaje a RabbitMQ
                </>
              )}
            </button>

            {mensaje && (
              <div className="rabbit-alert success">
                <span>✓</span>
                {mensaje}
              </div>
            )}

            {error && (
              <div className="rabbit-alert error">
                <span>!</span>
                {error}
              </div>
            )}
          </div>

          <div className="rabbit-flow-card">
            <div className="rabbit-section-heading">
              <div>
                <span className="rabbit-section-kicker">
                  FLUJO DE MENSAJERÍA
                </span>
                <h2>¿Cómo funciona?</h2>
                <p>
                  Recorrido del mensaje dentro del sistema.
                </p>
              </div>
            </div>

            <div className="rabbit-flow">
              <div className="rabbit-flow-step">
                <div className="rabbit-flow-number">01</div>
                <div>
                  <strong>Productor</strong>
                  <span>Publica el mensaje</span>
                </div>
              </div>

              <div className="rabbit-flow-line" />

              <div className="rabbit-flow-step">
                <div className="rabbit-flow-number">02</div>
                <div>
                  <strong>Exchange</strong>
                  <span>Enruta el mensaje</span>
                </div>
              </div>

              <div className="rabbit-flow-line" />

              <div className="rabbit-flow-step">
                <div className="rabbit-flow-number">03</div>
                <div>
                  <strong>Cola</strong>
                  <span>Almacena el mensaje</span>
                </div>
              </div>

              <div className="rabbit-flow-line" />

              <div className="rabbit-flow-step">
                <div className="rabbit-flow-number">04</div>
                <div>
                  <strong>Consumidor</strong>
                  <span>Procesa y envía ACK</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {estadoActual && (
          <section className="rabbit-result-card">
            <div className="rabbit-section-heading">
              <div>
                <span className="rabbit-section-kicker">
                  RESULTADO
                </span>
                <h2>Estado del mensaje</h2>
                <p>
                  Información devuelta por el servicio de mensajería.
                </p>
              </div>

              <span
                className={`rabbit-result-badge ${
                  estadoEsProcesado
                    ? "processed"
                    : estadoEsError
                      ? "failed"
                      : "pending"
                }`}
              >
                {estadoEsProcesado
                  ? "Procesado · ACK"
                  : estadoEsError
                    ? "Error"
                    : estadoActual.estado}
              </span>
            </div>

            <div className="rabbit-result-grid">
              <div>
                <span>Identificador</span>
                <strong className="rabbit-id">
                  {estadoActual.id}
                </strong>
              </div>

              <div>
                <span>Contenido</span>
                <strong>{estadoActual.contenido}</strong>
              </div>

              <div>
                <span>Fecha de publicación</span>
                <strong>
                  {formatoFecha(estadoActual.fechaPublicacion)}
                </strong>
              </div>

              <div>
                <span>Fecha de procesamiento</span>
                <strong>
                  {formatoFecha(estadoActual.fechaProcesamiento)}
                </strong>
              </div>
            </div>

            <div className="rabbit-result-footer">
              <div className="rabbit-ack-indicator">
                <span
                  className={
                    estadoEsProcesado ? "ack-active" : ""
                  }
                />
                {estadoEsProcesado
                  ? "Confirmación ACK recibida"
                  : estadoEsError
                    ? "Procesamiento fallido"
                    : "Esperando confirmación del consumidor"}
              </div>

              <button
                type="button"
                className="rabbit-refresh-button"
                onClick={handleActualizarEstado}
                disabled={consultando || enviando}
              >
                {consultando ? "Consultando..." : "Actualizar estado"}
              </button>
            </div>
          </section>
        )}

        <section className="rabbit-history-card">
          <div className="rabbit-section-heading">
            <div>
              <span className="rabbit-section-kicker">
                ACTIVIDAD DE LA SESIÓN
              </span>
              <h2>Historial de mensajes</h2>
              <p>
                Mensajes enviados desde esta pantalla mientras permanezca abierta.
              </p>
            </div>

            <span className="rabbit-history-count">
              {historial.length} mensajes
            </span>
          </div>

          {historial.length === 0 ? (
            <div className="rabbit-empty">
              <div className="rabbit-empty-icon">↗</div>
              <strong>Aún no hay mensajes</strong>
              <span>
                Cuando envíes tu primer mensaje, aparecerá aquí.
              </span>
            </div>
          ) : (
            <div className="rabbit-history-list">
              {historial.map((item) => (
                <article
                  className="rabbit-history-item"
                  key={item.id}
                >
                  <div className="rabbit-history-symbol">
                    {item.estado === "PROCESADO_ACK_ENVIADO"
                      ? "✓"
                      : item.estado === "ERROR"
                        ? "!"
                        : "…"}
                  </div>

                  <div className="rabbit-history-copy">
                    <strong>{item.contenido}</strong>
                    <span>
                      {formatoFecha(item.fechaPublicacion)}
                    </span>
                  </div>

                  <span
                    className={`rabbit-result-badge ${
                      item.estado === "PROCESADO_ACK_ENVIADO"
                        ? "processed"
                        : item.estado === "ERROR"
                          ? "failed"
                          : "pending"
                    }`}
                  >
                    {item.estado}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default RabbitMQ;
