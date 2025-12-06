// src/pages/AlbumGalleryPage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import toast, { Toaster } from "react-hot-toast";
import { addImageToCart } from "../api/cart";

export function AlbumGalleryPage() {
  const { idAlbum } = useParams();

  const [album, setAlbum] = useState(null);      // ⬅ para controlar estado del álbum
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [visorIndex, setVisorIndex] = useState(null);
  const [buyingId, setBuyingId] = useState(null);

  // ------------------------------------------------
  // 1️⃣ Cargar datos del álbum (solo para ver si está archivado)
  // ------------------------------------------------
  useEffect(() => {
    async function loadAlbum() {
      try {
        const res = await fetch(`http://localhost:4000/api/albums/${idAlbum}`);
        const data = await res.json();

        if (!data.ok || !data.album) {
          setAlbum("no-existe");
          return;
        }

        if (data.album.estado === "archivado") {
          setAlbum("archivado");
          return;
        }

        setAlbum(data.album);
      } catch (err) {
        console.error("Error cargando álbum:", err);
        setAlbum("error");
      }
    }

    loadAlbum();
  }, [idAlbum]);

  // ------------------------------------------------
  // 2️⃣ Cargar imágenes del álbum
  // ------------------------------------------------
  useEffect(() => {
    async function loadImages() {
      try {
        const res = await fetch(
          `http://localhost:4000/api/imagenes/album/${idAlbum}`
        );
        const data = await res.json();

        if (data && data.ok && Array.isArray(data.imagenes)) {
          setImagenes(data.imagenes);
        } else if (Array.isArray(data)) {
          setImagenes(data);
        } else {
          setImagenes([]);
        }
      } catch (err) {
        console.error("Error cargando imágenes:", err);
        setImagenes([]);
      } finally {
        setLoading(false);
      }
    }

    loadImages();
  }, [idAlbum]);

  // ------------------------------------------------
  // 3️⃣ Si el álbum está archivado o no existe → mostrar mensaje
  // ------------------------------------------------
  if (album === "archivado") {
    return (
      <div className="container py-5 text-center">
        <h3>⛔ Este álbum ya no está disponible</h3>
        <p className="text-muted">Ha sido archivado por el administrador.</p>
      </div>
    );
  }

  if (album === "no-existe") {
    return (
      <div className="container py-5 text-center">
        <h3>❌ Álbum no encontrado</h3>
      </div>
    );
  }

  // ------------------------------------------------
  // 4️⃣ Controles del visor y compra
  // ------------------------------------------------
  const openVisor = (index) => {
    setVisorIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeVisor = () => {
    setVisorIndex(null);
    document.body.style.overflow = "auto";
  };

  const nextImage = () =>
    setVisorIndex((prev) => (prev + 1) % imagenes.length);

  const prevImage = () =>
    setVisorIndex((prev) => (prev - 1 >= 0 ? prev - 1 : imagenes.length - 1));

  const safeUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : url.replace(/^\//, "");
  };

  async function comprarFoto(idImagen) {
    try {
      setBuyingId(idImagen);
      await addImageToCart(idImagen);
      toast.success("Foto agregada al carrito 🛒");
    } catch (err) {
      console.error(err);
      toast.error("Error al agregar al carrito");
    } finally {
      setBuyingId(null);
    }
  }

  // ------------------------------------------------
  // 5️⃣ Render de la galería
  // ------------------------------------------------
  return (
    <>
      <Toaster />

      <PageHeader titulo={`Galería del Álbum #${idAlbum}`} />

      <div className="container py-3">
        {loading && (
          <div className="row g-3">
            {Array.from({ length: 20 }).map((_, i) => (
              <div className="col-6 col-md-4 col-lg-2" key={i}>
                <div
                  className="placeholder-glow"
                  style={{
                    width: "100%",
                    paddingBottom: "100%",
                    background: "#e0e0e0",
                    borderRadius: "8px",
                  }}
                ></div>
              </div>
            ))}
          </div>
        )}

        {!loading && imagenes.length === 0 && (
          <p className="text-muted">No hay imágenes aún.</p>
        )}

        <div className="row g-3">
          {imagenes.map((img, index) => (
            <div key={img.idImagen} className="col-6 col-md-4 col-lg-2">
              <img
                src={safeUrl(img.rutaMiniatura)}
                className="img-fluid rounded shadow-sm gallery-thumb"
                onClick={() => openVisor(index)}
                style={{
                  cursor: "pointer",
                  width: "100%",
                  aspectRatio: "1 / 1",
                  objectFit: "cover",
                }}
                alt=""
              />

              <button
                className="btn btn-primary w-100 mt-2"
                onClick={() => comprarFoto(img.idImagen)}
                disabled={buyingId === img.idImagen}
              >
                {buyingId === img.idImagen ? "Agregando..." : "Comprar foto"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {visorIndex !== null && (
        <div className="visor-overlay">
          <span className="visor-close" onClick={closeVisor}>
            &times;
          </span>

          <span className="visor-arrow left" onClick={prevImage}>
            &#10094;
          </span>

          {imagenes[visorIndex]?.rutaOptimizado ? (
            <img
              src={safeUrl(imagenes[visorIndex].rutaOptimizado)}
              className="visor-image"
              alt="imagen"
            />
          ) : (
            <div style={{ color: "white", fontSize: "1.4rem" }}>
              Cargando imagen...
            </div>
          )}

          <span className="visor-arrow right" onClick={nextImage}>
            &#10095;
          </span>
        </div>
      )}

      <style>{`
        .gallery-thumb {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .gallery-thumb:hover {
          transform: scale(1.04);
          box-shadow: 0 6px 16px rgba(0,0,0,0.3);
        }

        .visor-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.9);
          z-index: 2000;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .visor-image {
          max-width: 90%;
          max-height: 85vh;
          border-radius: 10px;
        }

        .visor-close {
          position: absolute;
          top: 20px;
          right: 25px;
          font-size: 2.5rem;
          color: white;
          cursor: pointer;
        }

        .visor-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          font-size: 2rem;
          padding: 8px;
          border: 2px solid #fff;
          border-radius: 50%;
          color: #fff;
          cursor: pointer;
          width: 45px;
          height: 45px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .visor-arrow.left { left: 25px; }
        .visor-arrow.right { right: 25px; }
      `}</style>
    </>
  );
}
