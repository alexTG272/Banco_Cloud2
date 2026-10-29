import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./components/Login";
import Registro from "./pages/Registro";
import Dashboard from "./pages/Dashboard";
import Cuentas from "./pages/Cuentas";
import Solicitudes from "./pages/Solicitudes";
import Empleado from "./pages/Empleado";
import AuthTest from "./pages/AuthTest";

import {
  obtenerGrupos,
  obtenerUsuarioActual,
} from "./services/authService";

function RutaProtegida({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cargando, setCargando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const usuario = await obtenerUsuarioActual();

        setAutenticado(usuario !== null);
      } catch (error) {
        console.error(
          "Error al verificar la sesión:",
          error
        );

        setAutenticado(false);
      } finally {
        setCargando(false);
      }
    };

    verificarSesion();
  }, []);

  if (cargando) {
    return <p>Verificando sesión...</p>;
  }

  if (!autenticado) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function RutaEmpleado({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cargando, setCargando] = useState(true);
  const [esEmpleado, setEsEmpleado] = useState(false);

  useEffect(() => {
    const verificarRol = async () => {
      try {
        const usuario = await obtenerUsuarioActual();

        if (!usuario) {
          setEsEmpleado(false);
          return;
        }

        const grupos = await obtenerGrupos();

        setEsEmpleado(grupos.includes("Empleado"));
      } catch (error) {
        console.error(
          "Error al verificar el rol:",
          error
        );

        setEsEmpleado(false);
      } finally {
        setCargando(false);
      }
    };

    verificarRol();
  }, []);

  if (cargando) {
    return <p>Verificando permisos...</p>;
  }

  if (!esEmpleado) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route
          path="/"
          element={<Login />}
        />

        {/* Registro */}
        <Route
          path="/registro"
          element={<Registro />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <RutaProtegida>
              <Dashboard />
            </RutaProtegida>
          }
        />

        {/* Cuentas */}
        <Route
          path="/cuentas"
          element={
            <RutaProtegida>
              <Cuentas />
            </RutaProtegida>
          }
        />

        {/* Solicitudes */}
        <Route
          path="/solicitudes"
          element={
            <RutaProtegida>
              <Solicitudes />
            </RutaProtegida>
          }
        />

        {/* Panel de empleado */}
        <Route
          path="/empleado"
          element={
            <RutaEmpleado>
              <Empleado />
            </RutaEmpleado>
          }
        />

        {/* Prueba de autenticación */}
        <Route
          path="/auth-test"
          element={
            <RutaProtegida>
              <AuthTest />
            </RutaProtegida>
          }
        />

        {/* Ruta inexistente */}
        <Route
          path="*"
          element={
            <Navigate to="/" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;