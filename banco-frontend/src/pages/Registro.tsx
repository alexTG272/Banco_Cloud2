import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import Icon from "../components/Icon";
import "./Registro.css";
import {
  confirmarRegistro,
  registrarUsuario,
} from "../services/authService";

function Registro() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codigo, setCodigo] = useState("");

  const [registroRealizado, setRegistroRealizado] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  const handleRegistro = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMensaje("");
    setError("");
    setCargando(true);

    try {
      const resultado = await registrarUsuario(
        email.trim().toLowerCase(),
        password
      );

      if (
        resultado.nextStep.signUpStep ===
        "CONFIRM_SIGN_UP"
      ) {
        setRegistroRealizado(true);

        setMensaje(
          "Te enviamos un código de confirmación a tu correo electrónico."
        );
      } else {
        setMensaje("Registro completado.");
      }
    } catch (err) {
      console.error("ERROR REAL DE COGNITO:", err);

      if (err instanceof Error) {
        setError(`${err.name}: ${err.message}`);
      } else {
        setError("No se pudo registrar el usuario.");
      }
    } finally {
      setCargando(false);
    }
  };

  const handleConfirmacion = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMensaje("");
    setError("");
    setCargando(true);

    try {
      const resultado = await confirmarRegistro(
        email.trim().toLowerCase(),
        codigo.trim()
      );

      if (
        resultado.nextStep.signUpStep === "DONE"
      ) {
        setMensaje(
          "Cuenta confirmada correctamente. Ya puedes iniciar sesión."
        );

        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (err) {
      console.error("ERROR REAL DE COGNITO:", err);

      setError(
        "El código de confirmación no es válido."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-decoration">
        <div className="decoration-circle circle-one" />
        <div className="decoration-circle circle-two" />

        <div className="register-decoration-content">
          <p className="decoration-eyebrow">
            BANCOCLOUD
          </p>

          <h2>
            Comienza tu experiencia bancaria digital.
          </h2>

          <p>
            Crea tu cuenta de acceso y administra tus productos
            financieros de forma simple y segura.
          </p>
        </div>

        <div className="decoration-card">
          <span className="decoration-card-icon">
            <Icon
              name="user"
              className="icon decoration-user-icon"
            />
          </span>

          <div>
            <strong>
              Registro seguro
            </strong>

            <span>
              Tu correo se confirma mediante Cognito
            </span>
          </div>
        </div>
      </div>

      <main className="register-card">
        <div className="register-brand">
          <span className="brand-mark">
            B
          </span>

          <span>
            Banco
            <span className="brand-accent">
              Cloud
            </span>
          </span>
        </div>

        {!registroRealizado ? (
          <>
            <div className="register-heading">
              <p className="eyebrow">
                NUEVO CLIENTE
              </p>

              <h1>
                Crea tu cuenta
              </h1>

              <p>
                Completa tus datos para comenzar.
              </p>
            </div>

            <div className="register-info">
              <span className="info-icon">
                <Icon
                  name="user"
                  className="icon register-info-user-icon"
                />
              </span>

              <div>
                <strong>
                  Acceso para clientes
                </strong>

                <span>
                  Tu registro quedará listo para usar después
                  de confirmar tu correo.
                </span>
              </div>
            </div>

            <form
              className="register-form"
              onSubmit={handleRegistro}
            >
              <label>
                Correo electrónico

                <input
                  id="email"
                  type="email"
                  placeholder="cliente@bancocloud.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                  autoComplete="email"
                />
              </label>

              <label>
                Contraseña

                <input
                  id="password"
                  type="password"
                  placeholder="Crea una contraseña segura"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>

              <p className="register-hint">
                La contraseña debe cumplir las políticas
                configuradas en Cognito.
              </p>

              <button
                type="submit"
                className="primary-button register-button"
                disabled={cargando}
              >
                {cargando
                  ? "Creando cuenta..."
                  : "Crear cuenta"}

                {!cargando && (
                  <Icon name="arrow" />
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="register-heading">
              <p className="eyebrow">
                CONFIRMA TU CUENTA
              </p>

              <h1>
                Revisa tu correo
              </h1>

              <p>
                Ingresa el código que te enviamos para activar
                tu cuenta.
              </p>
            </div>

            <div className="confirmation-email">
              <span className="info-icon">
                <Icon name="file" />
              </span>

              <div>
                <span>
                  Correo registrado
                </span>

                <strong>
                  {email}
                </strong>
              </div>
            </div>

            <form
              className="register-form"
              onSubmit={handleConfirmacion}
            >
              <label>
                Código de confirmación

                <input
                  id="codigo"
                  type="text"
                  inputMode="numeric"
                  placeholder="Ingresa el código"
                  value={codigo}
                  onChange={(event) =>
                    setCodigo(event.target.value)
                  }
                  required
                  autoComplete="one-time-code"
                />
              </label>

              <button
                type="submit"
                className="primary-button register-button"
                disabled={cargando}
              >
                {cargando
                  ? "Confirmando..."
                  : "Confirmar cuenta"}

                {!cargando && (
                  <Icon name="arrow" />
                )}
              </button>
            </form>
          </>
        )}

        {mensaje && (
          <div className="auth-alert success-alert">
            <span className="alert-check">
              ✓
            </span>

            <span>
              {mensaje}
            </span>
          </div>
        )}

        {error && (
          <div className="auth-alert error-alert">
            <Icon name="close" />

            <span>
              {error}
            </span>
          </div>
        )}

        <p className="register-help">
          ¿Ya tienes una cuenta?{" "}

          <button
            type="button"
            onClick={() => navigate("/")}
          >
            Volver a iniciar sesión
          </button>
        </p>

        <p className="register-security">
          <span>✓</span>

          Tu registro y confirmación se procesan de forma
          segura mediante Cognito
        </p>
      </main>
    </div>
  );
}

export default Registro;