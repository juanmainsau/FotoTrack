// firebase login + register + google (nuevo sistema)
import { useState } from "react";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

import axios from "axios";
import { useNavigate } from "react-router-dom";

import EyeOpenIcon from "../assets/icons/ojo-abierto.png";
import EyeClosedIcon from "../assets/icons/ojo-cerrado.png";

export default function LandingPage() {
  const [mode, setMode] = useState("login"); 
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
          Sistema web para la gestión comercial de fotografías de eventos
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

          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   COMPONENTE: INPUT PASSWORD
   ========================================================== */
function PasswordInput({ value, onChange, placeholder, className = "" }) {
  const [show, setShow] = useState(false);

  return (
    <div className="position-relative">
      <input
        type={show ? "text" : "password"}
        className={`form-control ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />

      <img
        src={show ? EyeOpenIcon : EyeClosedIcon}
        onClick={() => setShow(!show)}
        alt="toggle visibility"
        style={{
          position: "absolute",
          right: "10px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "22px",
          height: "22px",
          cursor: "pointer",
          opacity: 0.7,
        }}
      />
    </div>
  );
}

/* ==========================================================
   LOGIN (Firebase email/password + Google)
   ========================================================== */
function LoginForm() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  function redirectByRole(user) {
    if (user.rol === "admin") {
      navigate("/admin");
    } else {
      navigate("/app/mainscreen");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const userCred = await signInWithEmailAndPassword(auth, correo, password);
      const idToken = await userCred.user.getIdToken();

      const res = await axios.post("http://localhost:4000/api/auth/login", {
        idToken,
      });

      console.log("USUARIO DEL BACKEND:", res.data.user);

      localStorage.setItem("fototrack-token", res.data.token);
      localStorage.setItem("fototrack-user", JSON.stringify(res.data.user));

      redirectByRole(res.data.user);
    } catch (err) {
      console.error(err);
      alert("Correo o contraseña inválidos");
    }
  }

  async function handleGoogleLogin() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await axios.post("http://localhost:4000/api/auth/google", {
        idToken,
      });

      console.log("USUARIO DEL BACKEND:", res.data.user);

      localStorage.setItem("fototrack-token", res.data.token);
      localStorage.setItem("fototrack-user", JSON.stringify(res.data.user));

      redirectByRole(res.data.user);
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

        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="Contraseña"
          className="mb-3"
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
   REGISTRO (Firebase)
   ========================================================== */
function RegisterForm() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [errorPass, setErrorPass] = useState("");

  function redirectByRole(user) {
    if (user.rol === "admin") {
      navigate("/admin");
    } else {
      navigate("/app/mainscreen");
    }
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (password !== password2) {
      setErrorPass("Las contraseñas no coinciden");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, correo, password);
      const idToken = await userCred.user.getIdToken();

      const res = await axios.post("http://localhost:4000/api/auth/register", {
        idToken,
      });

      console.log("USUARIO DEL BACKEND:", res.data.user);

      localStorage.setItem("fototrack-token", res.data.token);
      localStorage.setItem("fototrack-user", JSON.stringify(res.data.user));

      redirectByRole(res.data.user);
    } catch (err) {
      console.error(err);
      alert("No se pudo crear la cuenta");
    }
  }

  async function handleGoogleRegister() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await axios.post("http://localhost:4000/api/auth/google", {
        idToken,
      });

      console.log("USUARIO DEL BACKEND:", res.data.user);

      localStorage.setItem("fototrack-token", res.data.token);
      localStorage.setItem("fototrack-user", JSON.stringify(res.data.user));

      redirectByRole(res.data.user);
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

        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="Contraseña"
          className="mb-2"
        />

        <PasswordInput
          value={password2}
          onChange={setPassword2}
          placeholder="Repetir contraseña"
          className="mb-1"
        />

        {errorPass && (
          <div className="text-danger small mb-2">{errorPass}</div>
        )}

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
