// apps/api/src/repositories/config.repository.js
import { db } from "../config/db.js";

export const configRepository = {
  async getConfig() {
    const [rows] = await db.query(`SELECT * FROM parametros_sistema WHERE id = 1`);
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
        watermark_enabled,
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
