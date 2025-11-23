import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const [mode, setMode] = useState("login"); // login | register
  const isLogin = mode === "login";

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* PANEL IZQUIERDO */}
      <div
        className="d-flex flex-column justify-content-center px-5"
        style={{
          width: "33.33%",
          backgroundColor: "#f2f2f2",
        }}
      >
        <h1 className="fw-bold mb-3">FotoTrack</h1>
        <p className="fw-semibold mb-4">
          Sistema de gestión de fotografías para eventos MTB
        </p>

        <p className="small text-muted">
          Iniciá sesión o creá tu cuenta para acceder a tus fotos y álbumes.
        </p>
      </div>

      {/* PANEL DERECHO */}
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          width: "66.67%",
          backgroundImage: 'url("/landing-mtb.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="bg-white shadow"
          style={{
            width: "340px",
            padding: "22px 28px",
            borderRadius: "16px",
          }}
        >
          {/* TABS */}
          <div className="d-flex mb-4 border-bottom">
            <button
              type="button"
              onClick={() => setMode("login")}
              className="btn flex-fill border-0 pb-2"
              style={{
                borderBottom: isLogin
                  ? "2px solid #0b6623"
                  : "2px solid transparent",
                color: isLogin ? "#0b6623" : "#6c757d",
                fontWeight: isLogin ? "600" : "400",
              }}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              onClick={() => setMode("register")}
              className="btn flex-fill border-0 pb-2"
              style={{
                borderBottom: !isLogin
                  ? "2px solid #0b6623"
                  : "2px solid transparent",
                color: !isLogin ? "#0b6623" : "#6c757d",
                fontWeight: !isLogin ? "600" : "400",
              }}
            >
              Crear cuenta
            </button>
          </div>

          {/* CONTENIDO */}
          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   LOGIN TRADICIONAL + GOOGLE LOGIN
   ========================================================== */

function LoginForm() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:4000/auth/login", {
        correo,
        password, // 🔥 Corregido: antes enviabas "contrasena"
      });

      localStorage.setItem("fototrack-token", res.data.token);
      localStorage.setItem("fototrack-rol", res.data.rol);

      if (res.data.rol === "administrador") navigate("/admin");
      else navigate("/app/mainscreen");
    } catch (err) {
      console.error(err);
      alert("Correo o contraseña inválidos");
    }
  }

  async function handleGoogleLogin() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await axios.post("http://localhost:4000/auth/google", {
        token: idToken,
      });

      localStorage.setItem("fototrack-token", res.data.token);
      localStorage.setItem("fototrack-rol", res.data.rol);

      if (res.data.rol === "administrador") navigate("/admin");
      else navigate("/app/mainscreen");
    } catch (err) {
      console.error("Google Login Error:", err);
      alert("Error al iniciar sesión con Google");
    }
  }

  return (
    <>
      <h3 className="fw-semibold mb-3" style={{ fontSize: "1.4rem" }}>
        Bienvenido otra vez
      </h3>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          className="form-control mb-2"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn btn-success w-100 mb-3">
          Iniciar sesión
        </button>
      </form>

      <button className="btn btn-ft btn-ft-solid w-100" onClick={handleGoogleLogin}>
        Continuar con Google
      </button>
    </>
  );
}

/* ==========================================================
   REGISTRO TRADICIONAL + GOOGLE REGISTER
   ========================================================== */

function RegisterForm() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister(e) {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:4000/auth/register", {
        correo,
        password, // 🔥 Corregido: antes enviabas "contrasena"
      });

      localStorage.setItem("fototrack-token", res.data.token);
      localStorage.setItem("fototrack-rol", res.data.rol);

      navigate("/app/mainscreen");
    } catch (err) {
      console.error(err);
      alert("No se pudo crear la cuenta");
    }
  }

  async function handleGoogleRegister() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await axios.post("http://localhost:4000/auth/google", {
        token: idToken,
      });

      localStorage.setItem("fototrack-token", res.data.token);
      localStorage.setItem("fototrack-rol", res.data.rol);

      navigate("/app/mainscreen");
    } catch (err) {
      console.error("Google Register Error:", err);
      alert("Error registrando con Google");
    }
  }

  return (
    <>
      <h3 className="fw-semibold mb-3" style={{ fontSize: "1.4rem" }}>
        Crear cuenta
      </h3>

      <form onSubmit={handleRegister}>
        <input
          type="email"
          className="form-control mb-2"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn btn-success w-100 mb-3">
          Registrar cuenta
        </button>
      </form>

      <button className="btn btn-ft btn-ft-solid w-100" onClick={handleGoogleRegister}>
        Crear cuenta con Google
      </button>
    </>
  );
}
