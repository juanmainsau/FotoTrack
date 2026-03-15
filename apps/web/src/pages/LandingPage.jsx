// firebase login + register + google (nuevo sistema)
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  function redirectByRole(user) {
    if (user.rol === "admin") {
      navigate("/admin");
    } else {
      navigate("/app/mainscreen");
    }
  }

  async function handleGoogleLogin() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // El endpoint de Google suele funcionar como "Upsert" (Ingresa o Registra)
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
          Iniciá sesión o creá tu cuenta rápido y seguro con Google.
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
          className="bg-white shadow text-center"
          style={{
            width: "340px",
            padding: "40px 28px",
            borderRadius: "16px",
          }}
        >
          
          <h3 className="fw-bold mb-2" style={{ fontSize: "1.6rem" }}>
            Bienvenido
          </h3>
          <p className="text-muted small mb-4">
            Ingresá a tu cuenta para ver tus fotos
          </p>

          <button 
            className="btn btn-ft btn-ft-solid w-100 d-flex align-items-center justify-content-center gap-2 py-2" 
            onClick={handleGoogleLogin}
            style={{ fontWeight: "600", fontSize: "1.1rem" }}
          >
            {/* Si tenés el iconito de google, ideal. Si no, queda solo el texto */}
            Continuar con Google
          </button>
          
          <div className="mt-4 pt-3 border-top text-muted" style={{ fontSize: "0.8rem" }}>
            Protegido por Google y Firebase Auth
          </div>

        </div>
      </div>
    </div>
  );
}