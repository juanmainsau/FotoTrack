export default function App() {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Primer tercio con fondo gris */}
      <div
        className="d-flex flex-column justify-content-center px-5"
        style={{
          width: "33.33%",
          backgroundColor: "#f2f2f2"
        }}
      >
        <h1 className="fw-bold mb-3">FotoTrack</h1>
        <p className="text-muted mb-4">
          Sistema de gestión de fotografías para eventos MTB
        </p>

        <div className="d-flex gap-2">
          <a href="/login" className="btn btn-ft btn-ft-outline flex-fill">
            Iniciar sesión
          </a>
          <a href="/register" className="btn btn-ft btn-ft-solid flex-fill">
            Registrarse
          </a>
        </div>
      </div>

      {/* Dos tercios derechos con imagen de fondo */}
      <div
        style={{
          width: "66.67%",
          backgroundImage: 'url("/landing-mtb.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />
    </div>
  )
}


