import { MercadoPagoConfig, Preference } from 'mercadopago';

// Inicializamos MP con tu Access Token del .env
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN 
});

// =========================================================
// 🤖 FUNCIÓN AUTÓMATA: Busca la URL de Ngrok por su cuenta
// =========================================================
async function getNgrokUrl() {
  try {
    const response = await fetch("http://127.0.0.1:4040/api/tunnels");
    const data = await response.json();
    const httpsTunnel = data.tunnels.find(t => t.public_url.startsWith("https"));
    return httpsTunnel ? httpsTunnel.public_url : null;
  } catch (error) {
    console.warn("⚠️ Ngrok no está corriendo en el puerto 4040 o no se pudo conectar.");
    return null;
  }
}

export const paymentController = {
  async createPreference(req, res) {
    try {
      console.log("👮‍♂️ AUTENTICACIÓN RECIBIDA:", req.user); 

      const { items, idCarrito } = req.body;
      const userId = req.user?.id || req.user?.idUsuario || req.user?.uid || req.user?.sub;
      const userEmail = req.user?.email || req.user?.correo || "email_no_encontrado@test.com";

      if (!userId) {
        return res.status(401).json({ error: "Usuario no autenticado (ID no encontrado)." });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "El carrito está vacío." });
      }

      const mpItems = items.map(item => ({
        id: String(item.id || item.idImagen),
        title: item.title || `Foto #${item.idImagen}`,
        quantity: Number(item.quantity || 1),
        unit_price: Number(item.price || item.precioUnitario),
        currency_id: 'ARS',
      }));

      const ngrokBaseUrl = await getNgrokUrl();
      const baseUrl = ngrokBaseUrl || "http://localhost:4000"; 
      const finalWebhookUrl = `${baseUrl}/api/payment/webhook`;

      console.log(`🔗 URL del Webhook configurada en: ${finalWebhookUrl}`);

      // ==============================================================
      // 3. CUERPO DE PREFERENCIA (Súper limpio para el Popup)
      // ==============================================================
      const preferenceBody = {
        items: mpItems,
        payer: { email: userEmail },
        
        // Dejamos las back_urls por si Mercado Pago las pide por protocolo,
        // pero eliminamos por completo el "auto_return" problemático.
        back_urls: {
          success: "http://localhost:5173/checkout/success",
          failure: "http://localhost:5173/checkout/failure",
          pending: "http://localhost:5173/checkout/pending"
        },
        
        notification_url: finalWebhookUrl,
        
        metadata: {
          user_id: userId,
          email: userEmail,
          carrito_id: idCarrito
        }
      };

      console.log(`📤 Enviando a Mercado Pago...`);

      const preference = new Preference(client);
      const result = await preference.create({ body: preferenceBody });

      res.json({
        ok: true,
        id: result.id,
        url: result.init_point 
      });

    } catch (error) {
      console.error("❌ Error al crear preferencia en Mercado Pago:", error);
      res.status(500).json({ 
        ok: false, 
        error: "No se pudo conectar con Mercado Pago.",
        details: error.message 
      });
    }
  }
};