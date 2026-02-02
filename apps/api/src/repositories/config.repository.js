// apps/api/src/repositories/config.repository.js
import { db } from "../config/db.js";

export const configRepository = {
  
  // Obtener config (y crearla si no existe)
  async getConfig() {
    const [rows] = await db.query(`SELECT * FROM parametros_sistema WHERE id = 1`);
    
    // ✅ SEGURIDAD: Si la tabla está vacía, insertamos la fila 1 por defecto
    if (rows.length === 0) {
      await db.query(`
        INSERT INTO parametros_sistema 
        (id, watermark_enabled, watermark_opacity, watermark_size, watermark_position, calidad_default)
        VALUES (1, 0, 80, 0.3, 'south_east', 80)
      `);
      // Llamamos de nuevo para devolver el objeto recién creado
      return (await db.query(`SELECT * FROM parametros_sistema WHERE id = 1`))[0][0];
    }

    return rows[0];
  },

  async updateConfig(data) {
    const {
      watermark_enabled,
      watermark_opacity,
      watermark_size,
      watermark_position,
      calidad_default
    } = data;

    // Aseguramos que watermark_enabled sea 1 o 0 (booleano para SQL)
    const enabled = watermark_enabled ? 1 : 0;

    await db.query(
      `UPDATE parametros_sistema 
       SET 
         watermark_enabled = ?, 
         watermark_opacity = ?, 
         watermark_size = ?, 
         watermark_position = ?, 
         calidad_default = ?
       WHERE id = 1`,
      [
        enabled,
        watermark_opacity,
        watermark_size,
        watermark_position,
        calidad_default
      ]
    );

    return await this.getConfig();
  },

  async updateWatermarkPublicId(publicId) {
    await db.query(
      `UPDATE parametros_sistema 
       SET watermark_public_id = ?
       WHERE id = 1`,
      [publicId]
    );

    return await this.getConfig();
  }
};