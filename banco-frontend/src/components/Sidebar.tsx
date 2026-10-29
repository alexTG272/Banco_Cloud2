import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import Icon from "./Icon";

import {
  cerrarSesion,
  obtenerGrupos,
} from "../services/authService";

import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  const location = useLocation();

  const [rol, setRol] =
    useState<string>("");

  useEffect(() => {
    let activo = true;

    const cargarRol = async () => {
      try {
        const grupos =
          await obtenerGrupos();

        if (!activo) {
          return;
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
          "Error al obtener grupos de Cognito:",
          error
        );

        if (activo) {
          setRol("Sin rol");
        }
      }
    };

    cargarRol();

    return () => {
      activo = false;
    };
  }, []);

  const esEmpleado =
    rol === "Empleado";

  const handleLogout =
    async () => {
      try {
        await cerrarSesion();

        navigate("/");
      } catch (error) {
        console.error(
          "Error al cerrar sesión:",
          error
        );
      }
    };

  const esActivo = (
    ruta: string
  ) =>
    location.pathname === ruta;

  return (
    <aside className="shared-sidebar">
      {/* =====================================================
          MARCA
         ===================================================== */}

      <div className="shared-brand">
        <span className="shared-brand-mark">
          B
        </span>

        <span className="shared-brand-name">
          Banco
          <span>Cloud</span>
        </span>
      </div>

      {/* =====================================================
          MENU
         ===================================================== */}

      <div className="shared-section-label">
        MENÚ PRINCIPAL
      </div>

      <nav
        className="shared-nav"
        aria-label="Navegación principal"
      >
        <button
          type="button"
          className={
            esActivo("/dashboard")
              ? "active"
              : ""
          }
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <span className="shared-nav-icon">
            <Icon name="home" />
          </span>

          <span>
            Inicio
          </span>
        </button>

        <button
          type="button"
          className={
            esActivo("/cuentas")
              ? "active"
              : ""
          }
          onClick={() =>
            navigate("/cuentas")
          }
        >
          <span className="shared-nav-icon">
            <Icon name="wallet" />
          </span>

          <span>
            {esEmpleado
              ? "Todas las cuentas"
              : "Mis cuentas"}
          </span>
        </button>

        <button
          type="button"
          className={
            esActivo("/solicitudes")
              ? "active"
              : ""
          }
          onClick={() =>
            navigate("/solicitudes")
          }
        >
          <span className="shared-nav-icon">
            <Icon name="file" />
          </span>

          <span>
            Solicitudes
          </span>
        </button>

        {esEmpleado && (
          <button
            type="button"
            className={
              esActivo("/empleado")
                ? "active"
                : ""
            }
            onClick={() =>
              navigate("/empleado")
            }
          >
            <span className="shared-nav-icon">
              <Icon name="users" />
            </span>

            <span>
              Administración
            </span>
          </button>
        )}
      </nav>

      {/* =====================================================
          PARTE INFERIOR
         ===================================================== */}

      <div className="shared-sidebar-bottom">
        <div className="shared-role-card">
          <span className="shared-role-icon">
            <Icon name="user" />
          </span>

          <div>
            <strong>
              {rol || "Cargando..."}
            </strong>

            <span>
              {esEmpleado
                ? "Acceso administrativo"
                : "Acceso autorizado por Cognito"}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="shared-logout"
          onClick={
            handleLogout
          }
        >
          <Icon name="logout" />

          <span>
            Cerrar sesión
          </span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;