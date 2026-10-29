import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import Icon from "./Icon";
import "./Login.css";
import { iniciarSesion } from "../services/authService";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setCargando(true);

    try {
      const usernameNormalizado = username.trim().toLowerCase();

      const resultado = await iniciarSesion(
        usernameNormalizado,
        password
      );

      if (resultado.isSignedIn) {
        navigate("/dashboard");
        return;
      }

      const paso = resultado.nextStep?.signInStep;

      switch (paso) {
        case "CONFIRM_SIGN_UP":
          setError("La cuenta todavía no está confirmada.");
          break;

        case "RESET_PASSWORD":
          setError("Debes restablecer la contraseña.");
          break;

        case "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED":
          setError(
            "Cognito requiere establecer una nueva contraseña."
          );
          break;

        default:
          setError(
            `La autenticación requiere un paso adicional: ${
              paso ?? "desconocido"
            }`
          );
          break;
      }
    } catch (err) {
      console.error("ERROR REAL DE COGNITO:", err);

      if (err instanceof Error) {
        setError(`${err.name}: ${err.message}`);
      } else {
        setError(
          "Se produjo un error desconocido al iniciar sesión."
        );
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-decoration">
        <div className="decoration-circle circle-one" />
        <div className="decoration-circle circle-two" />

        <div className="login-decoration-content">
          <p className="decoration-eyebrow">BANCOCLOUD</p>

          <h2>
            Tu banca, simple y segura.
          </h2>

          <p>
            Consulta tus cuentas, gestiona solicitudes y mantén
            tus productos financieros bajo control desde
            cualquier lugar.
          </p>
        </div>

        <div className="decoration-card">
          <span className="decoration-card-icon">
            <Icon name="wallet" />
          </span>

          <div>
            <strong>
              Tu dinero, siempre contigo
            </strong>

            <span>
              Una banca simple, segura y digital
            </span>
          </div>
        </div>
      </div>

      <main className="login-card">
        <div className="login-brand">
          <span className="brand-mark">B</span>

          <span>
            Banco
            <span className="brand-accent">
              Cloud
            </span>
          </span>
        </div>

        <div className="login-heading">
          <p className="eyebrow">
            BIENVENIDO DE VUELTA
          </p>

          <h1>
            Inicia sesión
          </h1>

          <p>
            Accede a tu cuenta para continuar.
          </p>
        </div>

        <div className="login-mode-note">
          Tu acceso y rol se determinan automáticamente mediante
          Amazon Cognito.
        </div>

        <form
          className="login-form"
          onSubmit={handleLogin}
        >
          <label>
            Correo electrónico

            <input
              type="email"
              placeholder="tu@bancocloud.com"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              required
            />
          </label>

          <label>
            Contraseña

            <div className="password-field">
              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />

              <span aria-hidden="true">
                •••
              </span>
            </div>
          </label>

          <div className="login-options">
            <label className="remember">
              <input type="checkbox" />
              Recordarme
            </label>

            <span className="forgot muted-action">
              Acceso protegido por Cognito
            </span>
          </div>

          <button
            type="submit"
            className="primary-button login-button"
            disabled={cargando}
          >
            {cargando
              ? "Iniciando sesión..."
              : "Ingresar"}

            {!cargando && (
              <Icon name="arrow" />
            )}
          </button>
        </form>

        {error && (
          <div
            className="auth-alert error-alert"
            role="alert"
          >
            <Icon name="close" />

            <span>
              {error}
            </span>
          </div>
        )}

        <p className="login-help">
          ¿Aún no tienes una cuenta?{" "}

          <button
            type="button"
            onClick={() =>
              navigate("/registro")
            }
          >
            Solicita ser cliente
          </button>
        </p>

        <p className="login-security">
          <span>✓</span>

          Tus credenciales se procesan de forma segura mediante
          Cognito
        </p>
      </main>
    </div>
  );
}

export default Login;