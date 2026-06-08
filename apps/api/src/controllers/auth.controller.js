// src/controllers/auth.controller.js
import { userRepository } from "../repositories/user.repository.js";
import { db } from "../config/db.js";
import { faceService } from "../services/face.service.js";
import { authService } from "../services/auth.service.js";
import { auditService } from "../services/audit.service.js";
import crypto from "crypto";
import fs from "fs/promises";

const CONFIDENT_THRESHOLD = 0.5;
const DOUBT_THRESHOLD = 0.65;

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");

  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedValue) => {
  if (!storedValue || !storedValue.includes(":")) return false;

  const [salt, storedHash] = storedValue.split(":");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");

  return hash === storedHash;
};

const getUserId = (req) => req.user?.idUsuario || req.user?.id;

function parseDescriptor(descriptor) {
  if (!descriptor) return null;
  if (typeof descriptor === "string") return JSON.parse(descriptor);
  return descriptor;
}

function normalizeTelefono(value) {
  if (!value) return null;

  const clean = String(value).trim().replace(/\s/g, "");

  if (!clean) return null;

  return clean;
}

export const authController = {
  async login(req, res) {
    try {
      const { correo, password } = req.body;

      if (!correo || !password) {
        return res.status(400).json({
          ok: false,
          error: "Correo y contraseña requeridos.",
        });
      }

      const user = await userRepository.findByEmail(correo.trim());

      if (!user || !user.contrasena || !verifyPassword(password, user.contrasena)) {
        return res.status(401).json({
          ok: false,
          error: "Credenciales incorrectas.",
        });
      }

      if (user.estado !== "activo") {
        return res.status(403).json({
          ok: false,
          error:
            "Tu cuenta no está activa o se encuentra suspendida. Contacta al administrador.",
        });
      }

      await auditService.log({
        req: { ...req, user: { idUsuario: user.idUsuario } },
        idAccion: 4,
        idTipoEntidad: 1,
        idEntidadAfectada: user.idUsuario,
        detalle: `Inicio de sesión exitoso vía Email: ${correo}`,
      });

      return res.json({
        ok: true,
        mensaje: "Bienvenido a FotoTrack",
        user: {
          idUsuario: user.idUsuario,
          nombre: user.nombre,
          rol: user.rol,
        },
      });
    } catch (error) {
      console.error("❌ Error en login:", error);
      return res.status(500).json({
        ok: false,
        error: "Error interno al intentar iniciar sesión.",
      });
    }
  },

  async faceLogin(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          ok: false,
          error: "No se recibió imagen para Face ID.",
        });
      }

      const selfiePath = req.file.path;
      const identification = await faceService.identifyUserByFace(selfiePath);

      await fs.unlink(selfiePath).catch(() => {});

      if (!identification.ok || !identification.match) {
        return res.status(401).json({
          ok: false,
          error: identification.error || "No pudimos identificarte.",
          distance: identification.distance,
        });
      }

      const { user, token } = await authService.loginWithFaceId(
        identification.match.idUsuario
      );

      await auditService.log({
        req: { ...req, user: { idUsuario: user.idUsuario } },
        idAccion: 4,
        idTipoEntidad: 1,
        idEntidadAfectada: user.idUsuario,
        detalle: `Inicio de sesión exitoso mediante Face ID. Distancia: ${identification.distance}`,
      });

      return res.json({
        ok: true,
        mensaje: "Ingreso mediante Face ID exitoso.",
        token,
        user,
        distancia: identification.distance,
      });
    } catch (error) {
      console.error("❌ Error en faceLogin:", error);

      if (req.file?.path) {
        await fs.unlink(req.file.path).catch(() => {});
      }

      return res.status(500).json({
        ok: false,
        error: error.message || "Error procesando Face ID.",
      });
    }
  },

  async me(req, res) {
    try {
      const idUsuario = getUserId(req);

      const [rows] = await db.query(
        `
        SELECT
          u.idUsuario,
          u.correo,
          u.nombre,
          u.apellido,
          u.cuit,
          u.foto,
          r.nombre AS rol,
          er.nombre AS estado,
          p.telefono,
          p.consentimientoRF
        FROM usuarios u
        INNER JOIN roles r
          ON r.idRol = u.idRol
        INNER JOIN estados_registro er
          ON er.idEstadoRegistro = u.idEstadoRegistro
        LEFT JOIN perfiles p
          ON p.idUsuario = u.idUsuario
         AND p.deleted_at IS NULL
        WHERE u.idUsuario = ?
          AND u.deleted_at IS NULL
        LIMIT 1
        `,
        [idUsuario]
      );

      const user = rows[0];

      if (!user) {
        return res.status(404).json({
          ok: false,
          error: "Usuario no encontrado",
        });
      }

      if (user.estado !== "activo") {
        return res.status(403).json({
          ok: false,
          error: "Cuenta suspendida o inactiva.",
        });
      }

      return res.json({
        ok: true,
        user: {
          idUsuario: user.idUsuario,
          correo: user.correo,
          nombre: user.nombre,
          apellido: user.apellido,
          cuit: user.cuit,
          rol: user.rol,
          foto: user.foto,
          estado: user.estado,
          telefono: user.telefono || "",
          consentimientoRF: Boolean(user.consentimientoRF),
        },
      });
    } catch (err) {
      console.error("Error en /auth/me:", err);
      return res.status(500).json({
        ok: false,
        error: "Error al obtener usuario",
      });
    }
  },

  async register(req, res) {
    try {
      const { nombre, correo, password } = req.body;

      if (!correo || !password || !nombre) {
        return res.status(400).json({
          ok: false,
          error: "Todos los campos son obligatorios.",
        });
      }

      const existing = await userRepository.findByEmail(correo.trim());

      if (existing) {
        return res.status(400).json({
          ok: false,
          error: "El correo ya está registrado.",
        });
      }

      const hashedPassword = hashPassword(password);

      const user = await userRepository.createTraditionalUser({
        correo: correo.trim(),
        nombre: nombre.trim(),
        passwordHash: hashedPassword,
      });

      await auditService.log({
        req: { ...req, user: { idUsuario: user.idUsuario } },
        idAccion: 1,
        idTipoEntidad: 1,
        idEntidadAfectada: user.idUsuario,
        detalle: `Nueva cuenta creada vía Email: ${correo}`,
      });

      return res.status(201).json({
        ok: true,
        mensaje: "Usuario registrado con éxito.",
      });
    } catch (error) {
      console.error("❌ Error en registro:", error);
      return res.status(500).json({
        ok: false,
        error: "Error al crear la cuenta.",
      });
    }
  },

  async updateProfile(req, res) {
    try {
      const idUsuario = getUserId(req);
      const { nombre, cuit, telefono, consentimientoRF } = req.body;

      if (!idUsuario) {
        return res.status(401).json({
          ok: false,
          error: "Usuario no autenticado.",
        });
      }

      if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({
          ok: false,
          error: "El nombre debe tener al menos 3 caracteres.",
        });
      }

      const cuitFinal = cuit && cuit.trim() !== "" ? cuit.trim() : null;
      const telefonoFinal = normalizeTelefono(telefono);
      const consentimientoFinal = consentimientoRF ? 1 : 0;

      const result = await userRepository.updateProfile(idUsuario, {
        nombre: nombre.trim(),
        cuit: cuitFinal,
      });

      if (result.affectedRows === 0) {
        return res.status(404).json({
          ok: false,
          error: "Usuario no encontrado.",
        });
      }

      await db.query(
        `
        INSERT INTO perfiles (
          idUsuario,
          telefono,
          consentimientoRF
        )
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
          telefono = VALUES(telefono),
          consentimientoRF = VALUES(consentimientoRF),
          updated_at = CURRENT_TIMESTAMP,
          deleted_at = NULL,
          deleted_by = NULL
        `,
        [idUsuario, telefonoFinal, consentimientoFinal]
      );

      await auditService.log({
        req,
        idAccion: 2,
        idTipoEntidad: 1,
        idEntidadAfectada: idUsuario,
        detalle: `Perfil actualizado. CUIT: ${cuitFinal || "No especificado"} | WhatsApp: ${
          telefonoFinal || "No especificado"
        } | Notificaciones RF: ${consentimientoFinal ? "Sí" : "No"}`,
      });

      return res.json({
        ok: true,
        mensaje: "Perfil actualizado correctamente.",
      });
    } catch (error) {
      console.error("❌ Error en updateProfile:", error);
      return res.status(500).json({
        ok: false,
        error: "Error al actualizar el perfil.",
      });
    }
  },

  async uploadSelfie(req, res) {
    try {
      const idUsuario = getUserId(req);

      if (!idUsuario) {
        return res.status(401).json({
          ok: false,
          error: "Usuario no autenticado.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          ok: false,
          error: "No se recibió ninguna imagen.",
        });
      }

      const photoUrl = `/uploads/selfies/${req.file.filename}`;
      const absolutePath = req.file.path;

      console.log(`🧠 Iniciando reconocimiento facial para usuario ${idUsuario}...`);

      const resultadoIA = await faceService.registerUserFace(idUsuario, absolutePath);

      return res.json({
        ok: true,
        mensaje: "Reconocimiento facial configurado con éxito",
        matchesEncontrados: resultadoIA.matchesFound,
        url: photoUrl,
      });
    } catch (error) {
      console.error("❌ Error en uploadSelfie/IA:", error);
      return res.status(500).json({
        ok: false,
        error: error.message || "Error al procesar la selfie.",
      });
    }
  },

  async findMyPhotos(req, res) {
    try {
      const idUsuario = getUserId(req);

      const [referenceRows] = await db.execute(
        `
        SELECT descriptor
        FROM img_referencia_facial
        WHERE idUsuario = ?
          AND esActiva = 1
          AND deleted_at IS NULL
          AND descriptor IS NOT NULL
        LIMIT 1
        `,
        [idUsuario]
      );

      const reference = referenceRows[0];

      if (!reference?.descriptor) {
        return res.status(400).json({
          ok: false,
          error: "Primero debes subir tu selfie en el perfil para poder buscarte.",
        });
      }

      const parsedDescriptor = parseDescriptor(reference.descriptor);
      const userDescriptor = new Float32Array(parsedDescriptor);

      const [allFaces] = await db.execute(
        `
        SELECT idRostro, idImagen, descriptor
        FROM rostros
        WHERE deleted_at IS NULL
        `
      );

      let nuevosMatches = 0;

      for (const face of allFaces) {
        try {
          const faceParsed = parseDescriptor(face.descriptor);
          if (!faceParsed) continue;

          const faceDescriptor = new Float32Array(faceParsed);

          let sum = 0;

          for (let i = 0; i < userDescriptor.length; i++) {
            sum += Math.pow(userDescriptor[i] - faceDescriptor[i], 2);
          }

          const distance = Math.sqrt(sum);

          if (distance < DOUBT_THRESHOLD) {
            const confirmado = distance < CONFIDENT_THRESHOLD ? 1 : 0;
            const estadoRegistro = confirmado ? "procesado" : "pendiente";

            const [matchResult] = await db.execute(
              `
              INSERT INTO usuario_coincidencias (
                idUsuario,
                idImagen,
                distancia,
                confirmado,
                idEstadoRegistro
              )
              VALUES (
                ?, ?, ?, ?,
                (
                  SELECT idEstadoRegistro
                  FROM estados_registro
                  WHERE nombre = ?
                  LIMIT 1
                )
              )
              ON DUPLICATE KEY UPDATE
                distancia = VALUES(distancia),
                confirmado = VALUES(confirmado),
                idEstadoRegistro = VALUES(idEstadoRegistro),
                updated_at = CURRENT_TIMESTAMP,
                deleted_at = NULL,
                deleted_by = NULL
              `,
              [idUsuario, face.idImagen, distance, confirmado, estadoRegistro]
            );

            if (matchResult.affectedRows > 0) nuevosMatches++;
          }
        } catch (err) {
          console.warn(`⚠️ Rostro ${face.idRostro} omitido:`, err.message);
        }
      }

      return res.json({
        ok: true,
        mensaje:
          nuevosMatches > 0
            ? `¡Genial! Encontramos ${nuevosMatches} fotos nuevas.`
            : "No encontramos fotos nuevas por ahora.",
        encontradas: nuevosMatches,
      });
    } catch (error) {
      console.error("Error en findMyPhotos:", error);
      return res.status(500).json({
        ok: false,
        error: "Error en la búsqueda.",
      });
    }
  },

  async confirmMatch(req, res) {
    try {
      const { idImagen, esElUsuario } = req.body;
      const idUsuario = getUserId(req);

      if (!idUsuario) {
        return res.status(401).json({
          ok: false,
          error: "Usuario no autenticado.",
        });
      }

      if (!idImagen) {
        return res.status(400).json({
          ok: false,
          error: "Falta idImagen.",
        });
      }

      if (esElUsuario) {
        const [result] = await db.execute(
          `
          UPDATE usuario_coincidencias
          SET
            confirmado = 1,
            idEstadoRegistro = (
              SELECT idEstadoRegistro
              FROM estados_registro
              WHERE nombre = 'procesado'
              LIMIT 1
            ),
            updated_at = CURRENT_TIMESTAMP
          WHERE idUsuario = ?
            AND idImagen = ?
            AND deleted_at IS NULL
          `,
          [idUsuario, idImagen]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            ok: false,
            error: "No se encontró la coincidencia para confirmar.",
          });
        }

        await auditService.log({
          req,
          idAccion: 2,
          idTipoEntidad: 7,
          idEntidadAfectada: idImagen,
          detalle: `Usuario confirmó identidad en imagen #${idImagen}`,
        });

        return res.json({
          ok: true,
          mensaje: "Coincidencia confirmada correctamente.",
        });
      }

      const [result] = await db.execute(
        `
        UPDATE usuario_coincidencias
        SET
          confirmado = 0,
          idEstadoRegistro = (
            SELECT idEstadoRegistro
            FROM estados_registro
            WHERE nombre = 'eliminado'
            LIMIT 1
          ),
          deleted_at = NOW(),
          deleted_by = ?
        WHERE idUsuario = ?
          AND idImagen = ?
          AND deleted_at IS NULL
        `,
        [idUsuario, idUsuario, idImagen]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          ok: false,
          error: "No se encontró la coincidencia para rechazar.",
        });
      }

      await auditService.log({
        req,
        idAccion: 3,
        idTipoEntidad: 7,
        idEntidadAfectada: idImagen,
        detalle: `Usuario rechazó match sugerido en imagen #${idImagen}`,
      });

      return res.json({
        ok: true,
        mensaje: "Coincidencia rechazada correctamente.",
      });
    } catch (error) {
      console.error("Error en confirmMatch:", error);
      return res.status(500).json({
        ok: false,
        error: "Error al procesar la respuesta.",
      });
    }
  },
};