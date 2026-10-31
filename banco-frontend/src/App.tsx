
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

import Login from "./components/Login";
import Registro from "./pages/Registro";
import Dashboard from "./pages/Dashboard";
import Cuentas from "./pages/Cuentas";
import Solicitudes from "./pages/Solicitudes";
import Empleado from "./pages/Empleado";
import RabbitMQ from "./pages/RabbitMQ.tsx";
import AuthTest from "./pages/AuthTest";

import {
  cerrarSesion,
  obtenerGrupos,
  obtenerUsuarioActual,
} from "./services/authService";

type Rol = "Cliente" | "Empleado";

interface RutaConRolProps {
  children: React.ReactNode;
  rolesPermitidos?: Rol[];
  soloSinRol?: boolean;
}

function AccesoPendiente() {
  const navigate = useNavigate();
  const [cerrando, setCerrando] = useState(false);

  const handleLogout = async () => {
    try {
      setCerrando(true);
      await cerrarSesion();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setCerrando(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#f5f7fb",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "520px",
          padding: "40px",
          background: "#ffffff",
          border: "1px solid #e5eaf2",
          borderRadius: "16px",
          textAlign: "center",
          boxShadow: "0 8px 30px rgba(20, 40, 80, 0.06)",
        }}
      >
        <div style={{ fontSize: "42px", marginBottom: "16px" }}>
          🔒
        </div>

        <p
          style={{
            color: "#64748b",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "1.5px",
          }}
        >
          CONTROL DE ACCESO
        </p>

        <h1
          style={{
            color: "#17233c",
            fontSize: "25px",
            marginBottom: "12px",
          }}
        >
          Acceso pendiente de autorización
        </h1>

        <p
          style={{
            color: "#64748b",
            lineHeight: 1.7,
            marginBottom: "26px",
          }}
        >
          Tu cuenta fue registrada correctamente, pero todavía
          no tienes un rol asignado en BancoCloud.
          <br />
          <br />
          Un empleado debe autorizar tu acceso antes de que
          puedas utilizar las funcionalidades bancarias.
        </p>

        <button
          type="button"
          onClick={handleLogout}
          disabled={cerrando}
          style={{
            width: "100%",
            padding: "13px",
            border: "none",
            borderRadius: "9px",
            background: "#2457c5",
            color: "#ffffff",
            fontWeight: 600,
            cursor: cerrando ? "wait" : "pointer",
          }}
        >
          {cerrando ? "Cerrando sesión..." : "Cerrar sesión"}
        </button>
      </section>
    </main>
  );
}

function RutaConRol({
  children,
  rolesPermitidos = ["Cliente", "Empleado"],
  soloSinRol = false,
}: RutaConRolProps) {
  const [cargando, setCargando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);
  const [rol, setRol] = useState<Rol | null>(null);

  useEffect(() => {
    let activo = true;

    const verificarAcceso = async () => {
      try {
        const usuario = await obtenerUsuarioActual();

        if (!usuario) {
          if (activo) {
            setAutenticado(false);
          }
          return;
        }

        const grupos = await obtenerGrupos();

        const rolActual: Rol | null = grupos.includes("Empleado")
          ? "Empleado"
          : grupos.includes("Cliente")
            ? "Cliente"
            : null;

        if (activo) {
          setAutenticado(true);
          setRol(rolActual);
        }
      } catch (error) {
        console.error("Error al verificar permisos:", error);

        if (activo) {
          setAutenticado(false);
          setRol(null);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    verificarAcceso();

    return () => {
      activo = false;
    };
  }, []);

  if (cargando) {
    return <p>Verificando permisos de acceso...</p>;
  }

  if (!autenticado) {
    return <Navigate to="/" replace />;
  }

  if (soloSinRol) {
    if (rol !== null) {
      return <Navigate to="/dashboard" replace />;
    }

    return <AccesoPendiente />;
  }

  if (rol === null) {
    return <Navigate to="/acceso-pendiente" replace />;
  }

  if (!rolesPermitidos.includes(rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/registro" element={<Registro />} />

        <Route
          path="/acceso-pendiente"
          element={
            <RutaConRol soloSinRol>
              <></>
            </RutaConRol>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RutaConRol>
              <Dashboard />
            </RutaConRol>
          }
        />

        <Route
          path="/cuentas"
          element={
            <RutaConRol>
              <Cuentas />
            </RutaConRol>
          }
        />

        <Route
          path="/solicitudes"
          element={
            <RutaConRol>
              <Solicitudes />
            </RutaConRol>
          }
        />

        <Route
          path="/empleado"
          element={
            <RutaConRol rolesPermitidos={["Empleado"]}>
              <Empleado />
            </RutaConRol>
          }
        />

        <Route
          path="/rabbitmq"
          element={
            <RutaConRol rolesPermitidos={["Empleado"]}>
              <RabbitMQ />
            </RutaConRol>
          }
        />

        <Route
          path="/auth-test"
          element={
            <RutaConRol rolesPermitidos={["Empleado"]}>
              <AuthTest />
            </RutaConRol>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
