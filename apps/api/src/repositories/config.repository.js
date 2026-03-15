// apps/api/src/repositories/config.repository.js
import { db } from "../config/db.js";

export const configRepository = {
  
  // Obtener config (y crearla si no existe)
  async getConfig() {
    const [rows] = await db.query(`SELECT * FROM parametros_sistema WHERE id = 1`);
    
    // ✅ SEGURIDAD: Si la tabla está vacía, insertamos la fila 1 por defecto con todos los campos
    if (rows.length === 0) {
      await db.query(`
        INSERT INTO parametros_sistema 
        (id, watermark_enabled, watermark_opacity, watermark_size, watermark_position, calidad_default, vendedor_nombre, vendedor_cuit, vendedor_direccion, vendedor_telefono, vendedor_email, precio_foto_default, precio_album_default)
        VALUES (1, 0, 80, 0.3, 'south_east', 80, 'Mi Negocio', '', '', '', '', 500, 0)
      `);
      // Llamamos de nuevo para devolver el objeto recién creado
      const [newRows] = await db.query(`SELECT * FROM parametros_sistema WHERE id = 1`);
      return newRows[0];
    }

    return rows[0];
  },

  async updateConfig(data) {
    const {
      watermark_enabled,
      watermark_opacity,
      watermark_size,
      watermark_position,
      calidad_default,
      vendedor_nombre = "",
      vendedor_cuit = "",
      vendedor_direccion = "",
      vendedor_telefono = "",
      vendedor_email = "",
      // 👇 AGREGAMOS ESTOS DOS CAMPOS QUE FALTABAN
      precio_foto_default = 500,
      precio_album_default = 0
    } = data;

    // Aseguramos que watermark_enabled sea 1 o 0 (booleano para SQL)
    const enabled = watermark_enabled ? 1 : 0;

    // 👇 Actualizamos la query para guardar ABSOLUTAMENTE TODO
    await db.query(
      `UPDATE parametros_sistema 
       SET 
         watermark_enabled = ?, 
         watermark_opacity = ?, 
         watermark_size = ?, 
         watermark_position = ?, 
         calidad_default = ?,
         vendedor_nombre = ?,
         vendedor_cuit = ?,
         vendedor_direccion = ?,
         vendedor_telefono = ?,
         vendedor_email = ?,
         precio_foto_default = ?,
         precio_album_default = ?
       WHERE id = 1`,
      [
        enabled,
        watermark_opacity,
        watermark_size,
        watermark_position,
        calidad_default,
        vendedor_nombre,
        vendedor_cuit,
        vendedor_direccion,
        vendedor_telefono,
        vendedor_email,
        precio_foto_default, // 👈 Se guarda el precio por foto
        precio_album_default  // 👈 Se guarda el precio por álbum
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