import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HechoenOaxaca_icp_backend } from "../../../declarations/HechoenOaxaca-icp-backend";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";

const Registro = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    lugarOrigen: "",
    telefono: "",
    rol: "artesano",
  });
  const [fotoBuffer, setFotoBuffer] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFotoBuffer(reader.result);
      reader.readAsArrayBuffer(file);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const { nombreCompleto, lugarOrigen, telefono, rol } = formData;

    if (!nombreCompleto || !lugarOrigen || !telefono || !rol) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await HechoenOaxaca_icp_backend.registrarUsuario(
        nombreCompleto,
        lugarOrigen,
        telefono,
        rol,
        fotoBuffer ? Array.from(new Uint8Array(fotoBuffer)) : null
      );

      if (result.ok) {
        onRegister(rol);
        navigate(`/${rol}-dashboard`);
      } else {
        setError(result.err || "Ya estás registrado.");
      }
    } catch (err) {
      console.error("Error al registrar usuario:", err);
      setError("Hubo un problema al registrar el usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center mt-5">
      <Card className="p-4 shadow-lg" style={{ width: "100%", maxWidth: "500px" }}>
        <h2 className="text-center mb-4">Registro de Usuario</h2>
        <Form onSubmit={handleRegister}>
          <Form.Group className="mb-3" controlId="nombreCompleto">
            <Form.Label>Nombre Completo</Form.Label>
            <Form.Control
              type="text"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleChange}
              required
              placeholder="Ingresa tu nombre completo"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="lugarOrigen">
            <Form.Label>Lugar de Origen</Form.Label>
            <Form.Control
              type="text"
              name="lugarOrigen"
              value={formData.lugarOrigen}
              onChange={handleChange}
              required
              placeholder="Ingresa tu lugar de origen"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="telefono">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              pattern="[0-9]{10}"
              required
              placeholder="Ingresa tu número de teléfono (10 dígitos)"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="rol">
            <Form.Label>Rol del usuario</Form.Label>
            <Form.Select
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              required
            >
              <option value="artesano">Artesano</option>
              <option value="cliente">Cliente</option>
              <option value="intermediario">Intermediario</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="foto">
            <Form.Label>Foto de perfil</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </Form.Group>

          {error && <p className="text-danger text-center">{error}</p>}

          <Button
            variant="primary"
            type="submit"
            className="w-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registrando..." : "Registrar"}
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default Registro;
