import { useEffect, useState } from "react";
import { authFetch } from "../api/authFetch";
import { PageHeader } from "../components/PageHeader";

function MisComprasPage() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const res = await authFetch("http://localhost:4000/api/compras/mias");
      const data = await res.json();

      if (data.ok) {
        setCompras(data.compras);
      }
    } catch (err) {
      console.error("Error cargando compras:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const descargarImagenes = async (idCompra) => {
    try {
      const response = await authFetch(
        `http://localhost:4000/api/compras/${idCompra}/descargar`
      );

      if (!response.ok) throw new Error("No se pudo descargar el archivo");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `compra_${idCompra}.zip`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error descargando imágenes:", err);
      alert("Error descargando las imágenes.");
    }
  };

  return (
    <>
      <PageHeader title="Mis compras" />

      {loading ? (
        <p>Cargando...</p>
      ) : compras.length === 0 ? (
        <p>No tenés compras realizadas.</p>
      ) : (
        <div className="space-y-6">
          {compras.map((compra) => (
            <div
              key={compra.idCompra}
              className="border p-4 rounded-lg shadow-sm bg-white"
            >
              <h3 className="text-lg font-semibold">
                Compra #{compra.idCompra}
              </h3>

              <p className="text-sm text-gray-600">
                Fecha: {new Date(compra.fechaCompra).toLocaleString()}
              </p>

              <p className="mt-2 mb-4 font-semibold text-gray-800">
                Total: ${compra.total}
              </p>

              <div className="flex gap-3">
                <button className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300">
                  Ver comprobante
                </button>

                <button
                  className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300"
                  onClick={() => descargarImagenes(compra.idCompra)}
                >
                  Descargar imágenes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default MisComprasPage;
