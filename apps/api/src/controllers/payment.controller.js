import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

async function getNgrokUrl() {
  try {
    const response = await fetch("http://127.0.0.1:4040/api/tunnels");
    const data = await response.json();

    const httpsTunnel = data.tunnels.find((t) =>
      t.public_url.startsWith("https")
    );

    return httpsTunnel ? httpsTunnel.public_url : null;
  } catch {
    console.warn("⚠️ Ngrok no está corriendo en el puerto 4040.");
    return null;
  }
}

export const paymentController = {
  async createPreference(req, res) {
    try {
      console.log("👮‍♂️ AUTENTICACIÓN RECIBIDA:", req.user);

      const { items, idCarrito } = req.body;

      const userId = req.user?.idUsuario || req.user?.id;
      const userEmail = req.user?.correo || req.user?.email || "sin_email@test.com";

      if (!userId) {
        return res.status(401).json({
          ok: false,
          error: "Usuario no autenticado.",
        });
      }

      if (!idCarrito) {
        return res.status(400).json({
          ok: false,
          error: "No se recibió el ID del carrito.",
        });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          ok: false,
          error: "El carrito está vacío.",
        });
      }

      const mpItems = items.map((item) => ({
        id: String(item.idItem || item.idImagen || item.idAlbum),
        title:
          item.title ||
          item.nombreProducto ||
          item.nombreAlbum ||
          `Producto FotoTrack #${item.idItem || item.idImagen || item.idAlbum}`,
        quantity: Number(item.quantity || item.cantidad || 1),
        unit_price: Number(item.price || item.precioUnitario || 0),
        currency_id: "ARS",
      }));

      const total = mpItems.reduce(
        (acc, item) => acc + item.unit_price * item.quantity,
        0
      );

      if (total <= 0) {
        return res.status(400).json({
          ok: false,
          error: "El total de la compra debe ser mayor a cero.",
        });
      }

      const ngrokBaseUrl = await getNgrokUrl();
      const baseUrl = ngrokBaseUrl || "http://localhost:4000";
      const finalWebhookUrl = `${baseUrl}/api/payment/webhook`;

      console.log(`🔗 URL del Webhook configurada en: ${finalWebhookUrl}`);

      const preferenceBody = {
        items: mpItems,

        payer: {
          email: userEmail,
        },

        back_urls: {
          success: "http://localhost:5173/checkout/success",
          failure: "http://localhost:5173/checkout/failure",
          pending: "http://localhost:5173/checkout/pending",
        },

        notification_url: finalWebhookUrl,

        metadata: {
          user_id: String(userId),
          email: userEmail,
          carrito_id: String(idCarrito),
        },
      };

      console.log("📤 Enviando a Mercado Pago...");

      const preference = new Preference(client);
      const result = await preference.create({ body: preferenceBody });

      return res.json({
        ok: true,
        id: result.id,
        url: result.init_point,
      });
    } catch (error) {
      console.error("❌ Error al crear preferencia en Mercado Pago:", error);

      return res.status(500).json({
        ok: false,
        error: "No se pudo conectar con Mercado Pago.",
        details: error.message,
      });
    }
  },
};