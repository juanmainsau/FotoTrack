// src/pages/LandingPage.jsx
import { useRef, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [showFaceModal, setShowFaceModal] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [faceLoading, setFaceLoading] = useState(false);
  const [faceError, setFaceError] = useState("");

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

      const res = await axios.post("http://localhost:4000/api/auth/google", {
        idToken,
      });

      localStorage.setItem("fototrack-token", res.data.token);
      localStorage.setItem("fototrack-user", JSON.stringify(res.data.user));

      redirectByRole(res.data.user);
    } catch (err) {
      console.error("Google Login Error:", err);
      alert("Error al iniciar sesión con Google");
    }
  }

  async function openFaceModal() {
    setShowFaceModal(true);
    setFaceError("");
    setCameraReady(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraReady(true);
        }
      }, 100);
    } catch (err) {
      console.error("Error abriendo cámara:", err);
      setFaceError("No se pudo acceder a la cámara. Revisá los permisos del navegador.");
    }
  }

  function closeFaceModal() {
    setShowFaceModal(false);
    setFaceError("");
    setCameraReady(false);
    setFaceLoading(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  async function captureFrameAsBlob() {
    const video = videoRef.current;

    if (!video) {
      throw new Error("La cámara no está lista.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) reject(new Error("No se pudo capturar la imagen."));
          else resolve(blob);
        },
        "image/jpeg",
        0.92
      );
    });
  }

  async function handleFaceLogin() {
    try {
      setFaceLoading(true);
      setFaceError("");

      const blob = await captureFrameAsBlob();

      const formData = new FormData();
      formData.append("selfie", blob, "face-login.jpg");

      const res = await axios.post(
        "http://localhost:4000/api/auth/face-login",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!res.data.ok) {
        throw new Error(res.data.error || "No se pudo iniciar sesión con Face ID.");
      }

      localStorage.setItem("fototrack-token", res.data.token);
      localStorage.setItem("fototrack-user", JSON.stringify(res.data.user));

      closeFaceModal();
      redirectByRole(res.data.user);
    } catch (err) {
      console.error("Face ID Login Error:", err);

      const msg =
        err.response?.data?.error ||
        err.message ||
        "No pudimos identificarte. Probá nuevamente o ingresá con Google.";

      setFaceError(msg);
    } finally {
      setFaceLoading(false);
    }
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
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
          Iniciá sesión con Google o usá Face ID si ya configuraste tu rostro en el perfil.
        </p>
      </div>

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
            width: "360px",
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
            style={{ fontWeight: "600", fontSize: "1.05rem" }}
          >
            Continuar con Google
          </button>

          <button
            className="btn btn-dark w-100 d-flex align-items-center justify-content-center gap-2 py-2 mt-3"
            onClick={openFaceModal}
            style={{ fontWeight: "600", fontSize: "1.05rem" }}
          >
            🔐 Ingresar con Face ID
          </button>

          <div className="mt-4 pt-3 border-top text-muted" style={{ fontSize: "0.8rem" }}>
            Face ID requiere haber configurado previamente tu selfie en el perfil.
          </div>
        </div>
      </div>

      {showFaceModal && (
        <>
          <div className="modal-backdrop fade show"></div>

          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
            onClick={closeFaceModal}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header bg-dark text-white">
                  <h5 className="modal-title fw-bold">Ingreso con Face ID</h5>

                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={closeFaceModal}
                    disabled={faceLoading}
                  ></button>
                </div>

                <div className="modal-body p-4 text-center">
                  <p className="text-muted small mb-3">
                    Mirá a la cámara y presioná “Escanear rostro”.
                  </p>

                  <div
                    className="bg-black rounded-4 overflow-hidden mx-auto position-relative"
                    style={{
                      width: "100%",
                      maxWidth: "420px",
                      aspectRatio: "4 / 3",
                    }}
                  >
                    <video
                      ref={videoRef}
                      muted
                      playsInline
                      autoPlay
                      className="w-100 h-100"
                      style={{
                        objectFit: "cover",
                        transform: "scaleX(-1)",
                      }}
                    />

                    {!cameraReady && (
                      <div className="position-absolute top-50 start-50 translate-middle text-white">
                        Activando cámara...
                      </div>
                    )}
                  </div>

                  {faceError && (
                    <div className="alert alert-danger mt-3 mb-0 small">
                      {faceError}
                    </div>
                  )}
                </div>

                <div className="modal-footer border-0 p-4 pt-0">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={closeFaceModal}
                    disabled={faceLoading}
                  >
                    Cancelar
                  </button>

                  <button
                    className="btn btn-primary fw-bold"
                    onClick={handleFaceLogin}
                    disabled={!cameraReady || faceLoading}
                  >
                    {faceLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Escaneando...
                      </>
                    ) : (
                      "Escanear rostro"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}