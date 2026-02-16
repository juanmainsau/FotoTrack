import { MercadoPagoConfig, Preference } from 'mercadopago';

// Inicializamos MP con tu Access Token del .env
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN 
});

export const paymentController = {
  async createPreference(req, res) {
    try {
      const { items } = req.body;

      // Validación simple
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "El carrito está vacío o tiene formato incorrecto." });
      }

      // Convertimos tus items al formato de Mercado Pago
      const mpItems = items.map(item => ({
        id: String(item.id),
        title: item.title,
        quantity: Number(item.quantity || 1),
        unit_price: Number(item.price),
        currency_id: 'ARS',
      }));

      // Configuración del cuerpo de la preferencia
      const preferenceBody = {
        items: mpItems,
        // 👇 CAMBIO IMPORTANTE: Usar camelCase (el SDK lo transforma a snake_case)
        backUrls: {
          success: "http://localhost:5173/checkout/success",
          failure: "http://localhost:5173/checkout/failure",
          pending: "http://localhost:5173/checkout/pending"
        },
        autoReturn: "approved", // 👇 También aquí: autoReturn en lugar de auto_return
      };

      console.log("📤 Enviando preferencia a MP (SDK v2):", JSON.stringify(preferenceBody, null, 2));

      const preference = new Preference(client);
      
      const result = await preference.create({ body: preferenceBody });

      res.json({
        ok: true,
        id: result.id,
        url: result.sandbox_init_point || result.init_point 
      });

    } catch (error) {
      console.error("❌ Error al crear preferencia en Mercado Pago:", error);
      res.status(500).json({ 
        ok: false, 
        error: "No se pudo conectar con Mercado Pago." 
      });
    }
  }
};