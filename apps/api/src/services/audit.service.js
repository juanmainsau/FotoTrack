// src/services/audit.service.js
import { db } from "../config/db.js";

export const auditService = {
  async log({
    req = null,
    idAccion,
    idTipoEntidad = null,
    idEntidadAfectada = null,
    detalle = null,
    datosAntes = null,
    datosDespues = null,
  }) {
    try {
      const idUsuarioResponsable =
        req?.user?.idUsuario ||
        req?.user?.id ||
        null;

      const ipOrigen =
        req?.ip ||
        req?.headers?.["x-forwarded-for"] ||
        "0.0.0.0";

      await db.execute(
        `
        INSERT INTO auditoria (
          idUsuarioResponsable,
          idAccion,
          idTipoEntidad,
          idEntidadAfectada,
          detalle,
          datosAntes,
          datosDespues,
          ipOrigen
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          idUsuarioResponsable,
          idAccion,
          idTipoEntidad,
          idEntidadAfectada,
          detalle,

          datosAntes
            ? JSON.stringify(datosAntes)
            : null,

          datosDespues
            ? JSON.stringify(datosDespues)
            : null,

          ipOrigen,
        ]
      );

      console.log(
        `📝 Auditoría registrada | Acción: ${idAccion}`
      );

      return true;
    } catch (error) {
      console.error(
        "❌ Error en auditService:",
        error
      );

      return false;
    }
  },
};