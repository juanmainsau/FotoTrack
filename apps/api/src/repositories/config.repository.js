// apps/api/src/repositories/config.repository.js
import { db } from "../config/db.js";

const DEFAULT_CONFIG = {
  watermark_enabled: false,
  watermark_public_id: null,
  watermark_ruta: null,
  watermark_opacity: 40,
  watermark_size: 0.3,
  watermark_position: "south_east",
  calidad_default: 90,
  vendedor_nombre: "Mi Negocio de Fotografía",
  vendedor_cuit: "",
  vendedor_direccion: "",
  vendedor_telefono: "",
  vendedor_email: "",
  precio_foto_default: 0,
  precio_album_default: 0,
};

function parseValue(valor, tipoDato) {
  if (valor === null || valor === undefined) return null;

  switch (tipoDato) {
    case "boolean":
      return valor === "true" || valor === "1" || valor === 1 || valor === true;

    case "number": {
      const numberValue = Number(valor);
      return Number.isNaN(numberValue) ? 0 : numberValue;
    }

    case "json":
      try {
        return JSON.parse(valor);
      } catch {
        return null;
      }

    case "string":
    default:
      return valor;
  }
}

function inferTipoDato(value) {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (typeof value === "object" && value !== null) return "json";
  return "string";
}

function serializeValue(value, tipoDato) {
  if (value === null || value === undefined) return null;

  if (tipoDato === "boolean") {
    return value ? "true" : "false";
  }

  if (tipoDato === "number") {
    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
      throw new Error("Los parámetros numéricos deben ser números válidos.");
    }

    return String(numberValue);
  }

  if (tipoDato === "json") {
    return JSON.stringify(value);
  }

  return String(value);
}

async function ensureDefaultConfig() {
  for (const [clave, valor] of Object.entries(DEFAULT_CONFIG)) {
    const tipoDato = inferTipoDato(valor);
    const serialized = serializeValue(valor, tipoDato);

    await db.query(
      `
      INSERT INTO parametros_sistema (
        clave,
        valor,
        tipoDato,
        descripcion,
        estaActivo
      )
      VALUES (?, ?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE clave = clave
      `,
      [clave, serialized, tipoDato, `Parámetro ${clave}`]
    );
  }
}

export const configRepository = {
  async getConfig() {
    await ensureDefaultConfig();

    const [rows] = await db.query(
      `
      SELECT clave, valor, tipoDato
      FROM parametros_sistema
      WHERE estaActivo = 1
      `
    );

    const config = { ...DEFAULT_CONFIG };

    for (const row of rows) {
      config[row.clave] = parseValue(row.valor, row.tipoDato);
    }

    return config;
  },

  async updateConfig(data) {
    await ensureDefaultConfig();

    const allowedKeys = Object.keys(DEFAULT_CONFIG);

    for (const key of allowedKeys) {
      if (!(key in data)) continue;

      const value = data[key];
      const tipoDato = inferTipoDato(DEFAULT_CONFIG[key]);
      const serialized = serializeValue(value, tipoDato);

      await db.query(
        `
        UPDATE parametros_sistema
        SET
          valor = ?,
          tipoDato = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE clave = ?
        `,
        [serialized, tipoDato, key]
      );
    }

    return await this.getConfig();
  },

  async updateWatermarkPublicId(publicId) {
    await ensureDefaultConfig();

    await db.query(
      `
      UPDATE parametros_sistema
      SET
        valor = ?,
        tipoDato = 'string',
        updated_at = CURRENT_TIMESTAMP
      WHERE clave = 'watermark_public_id'
      `,
      [publicId || null]
    );

    return await this.getConfig();
  },
};