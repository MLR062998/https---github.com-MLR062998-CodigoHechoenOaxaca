import React, { useState, useEffect } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Wallet from "./Wallet.jsx";
import Cliente from "./Cliente.jsx";
import Artesano from "./Artesano.jsx";
import Intermediario from "./Intermediario.jsx";
import Administrador from "./Administrador.jsx";
import Registro from "./Registro.jsx";
import { AuthClient } from "@dfinity/auth-client";
import { HechoenOaxaca_icp_backend } from "../../../declarations/HechoenOaxaca-icp-backend";
import "../index.scss";

const Menu = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [principalId, setPrincipalId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  // Maneja la autenticación con NFID
  const handleLogin = async () => {
    const authClient = await AuthClient.create();
    const APP_NAME = "Hecho en Oaxaca";
    const APP_LOGO = "https://example.com/logo.png"; // Cambia por la URL de tu logo
    const identityProvider = `https://nfid.one/authenticate?applicationName=${APP_NAME}&applicationLogo=${APP_LOGO}`;

    authClient.login({
      identityProvider,
      onSuccess: async () => {
        const principal = authClient.getIdentity().getPrincipal().toText();
        setPrincipalId(principal);
        setIsConnected(true);

        // Consultar el rol del usuario
        try {
          const role = await HechoenOaxaca_icp_backend.getUserRole(principal);
          if (role) {
            setUserRole(role);
            navigate(`/${role}-dashboard`); // Redirige al dashboard según el rol
          } else {
            navigate("Registro"); // Si el usuario no está registrado
          }
        } catch (err) {
          console.error("Error al obtener el rol del usuario:", err);
          navigate("/Registro");
        }
      },
      onError: (error) => {
        console.error("Error de autenticación:", error);
      },
    });
  };

  // Maneja la desconexión
  const handleDisconnect = () => {
    setIsConnected(false);
    setPrincipalId(null);
    setUserRole(null);
    navigate("/");
  };

  useEffect(() => {
    // Si el usuario ya está autenticado, consultar su rol al cargar el menú
    const fetchUserRole = async () => {
      if (principalId) {
        try {
          const role = await HechoenOaxaca_icp_backend.getUserRole(principalId);
          setUserRole(role);
        } catch (err) {
          console.error("Error al obtener el rol del usuario:", err);
        }
      }
    };
    fetchUserRole();
  }, [principalId]);

  return (
    <div>
      <nav className="navbar navbar-expand-lg custom-navbar">
        <div className="container-fluid custom-container">
          <Link to="/" className="custom-brand">
            Hecho en Oaxaca
          </Link>
          <div className="custom-links-container">
            {isConnected ? (
              <>
                {/* Enlaces dinámicos según el rol del usuario */}
                {userRole === "cliente" && (
                  <Link to="/Cliente" className="custom-link">
                    Mi Dashboard
                  </Link>
                )}
                {userRole === "Artesano" && (
                  <Link to="/Artesano" className="custom-link">
                    Artesano
                  </Link>
                )}
                {userRole === "Intermediario" && (
                  <Link to="/Intermediario" className="custom-link">
                    Dashboard Intermediario
                  </Link>
                )}
                {userRole === "Administrador" && (
                  <Link to="/Administrador" className="custom-link">
                    Panel de Administración
                  </Link>
                )}
                {/* Enlace a la wallet */}
                <Link to="/wallet" className="custom-btn wallet-btn">
                  Wallet
                </Link>
                {/* Botón de logout */}
                <button
                  className="custom-btn logout-btn"
                  onClick={() => setShowLogoutModal(true)}
                >
                  Salir
                </button>
              </>
            ) : (
              <button className="custom-btn connect-btn" onClick={handleLogin}>
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Modal de confirmación de salida */}
      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmación</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Está seguro de que quiere salir?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setShowLogoutModal(false); // Cierra el modal
              handleDisconnect(); // Desconectar al usuario
            }}
          >
            Salir
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Rutas dinámicas para los dashboards */}
      <Routes>
        <Route
          path="/wallet"
          element={
            <Wallet principalId={principalId} isConnected={isConnected} />
          }
        />
        <Route path="/Registro" element={<Registro />} />
        <Route path="/Cliente" element={<Cliente />} />
        <Route path="/Artesano" element={<Artesano />} />
        <Route path="/Intermediario" element={<Intermediario />} />
        <Route path="/Administrador" element={<Administrador />} />
      </Routes>
    </div>
  );
};

export default Menu;
