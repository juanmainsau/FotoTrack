import { useState } from "react";

export default function App() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const isLogin = mode === "login";

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Primer tercio con fondo gris: branding */}
      <div
        className="d-flex flex-column justify-content-center px-5"
        style={{
          width: "33.33%",
          backgroundColor: "#f2f2f2"
        }}
      >
        <h1 className="fw-bold mb-3">FotoTrack</h1>
        <p className="fw-semibold mb-4">
          Sistema de gestión de fotografías para eventos MTB
        </p>

        <p className="small text-muted">
          Iniciá sesión o creá tu cuenta para acceder a tus fotos, álbumes y compras.
        </p>
      </div>

      {/* Dos tercios derechos con imagen de fondo + panel de auth */}
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          width: "66.67%",
          backgroundImage: 'url("/landing-mtb.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div
          className="bg-white shadow"
          style={{
            width: "340px",
            padding: "22px 28px",
            borderRadius: "16px",
            maxWidth: "90%"
          }}
        >

          {/* Tabs login / register */}
          <div className="d-flex mb-4 border-bottom">
            <button
              type="button"
              onClick={() => setMode("login")}
              className="btn flex-fill border-0 pb-2"
              style={{
                borderBottom: isLogin ? "2px solid #0b6623" : "2px solid transparent",
                color: isLogin ? "#0b6623" : "#6c757d",
                fontWeight: isLogin ? "600" : "400",
                borderRadius: 0
              }}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className="btn flex-fill border-0 pb-2"
              style={{
                borderBottom: !isLogin ? "2px solid #0b6623" : "2px solid transparent",
                color: !isLogin ? "#0b6623" : "#6c757d",
                fontWeight: !isLogin ? "600" : "400",
                borderRadius: 0
              }}
            >
              Crear cuenta
            </button>
          </div>

          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}

/* ---------- Formularios internos ---------- */

function LoginForm() {
  return (
    <>
      <h3 className="fw-semibold mb-3" style={{ fontSize: "1.4rem" }}>
        Bienvenido otra vez
      </h3>


      <form>
        <div className="mb-3">
          <label className="form-label">Correo electrónico</label>
          <input
            type="email"
            className="form-control"
            placeholder="tuemail@ejemplo.com"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-control"
            placeholder="••••••••"
          />
        </div>

        <div className="d-flex justify-content-center mb-3">
          <button
            type="button"
            className="btn btn-link p-0 small text-decoration-none"
            style={{ color: "#0b6623" }}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>


        <button type="submit" className="btn btn-ft btn-ft-solid w-100 mb-2">
          Iniciar sesión
        </button>
      </form>
    </>
  );
}

function RegisterForm() {
  return (
    <>
      <h3 className="fw-semibold mb-3" style={{ fontSize: "1.4rem" }}>
        Crear cuenta
      </h3>


      <form>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input type="text" className="form-control" />
        </div>

        <div className="mb-3">
          <label className="form-label">Apellido</label>
          <input type="text" className="form-control" />
        </div>

        <div className="mb-3">
          <label className="form-label">Correo electrónico</label>
          <input type="email" className="form-control" />
        </div>

        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input type="password" className="form-control" />
        </div>

        <div className="mb-4">
          <label className="form-label">Confirmar contraseña</label>
          <input type="password" className="form-control" />
        </div>

        <button type="submit" className="btn btn-ft btn-ft-solid w-100 mb-2">
          Registrarse
        </button>
      </form>
    </>
  );
}


