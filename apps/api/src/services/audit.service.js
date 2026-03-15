import { db } from "../config/db.js";

export const auditService = {
  async log({ req, idAccion, idTipoEntidad, idEntidadAfectada, detalle }) {
    try {
      const idUsuarioResponsable = req.user?.idUsuario || req.user?.id;
      const ipOrigen = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';

      const query = `
        INSERT INTO auditoria 
        (idUsuarioResponsable, idAccion, idTipoEntidad, idEntidadAfectada, detalle, ipOrigen) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      await db.execute(query, [
        idUsuarioResponsable,
        idAccion,
        idTipoEntidad,
        idEntidadAfectada,
        detalle,
        ipOrigen
      ]);
      
      // Solo un log pequeño para saber que funcionó
      console.log(`📝 Auditoría: Acción ${idAccion} registrada.`);
    } catch (error) {
      console.error("❌ Error en el servicio de auditoría:", error);
    }
  }
};