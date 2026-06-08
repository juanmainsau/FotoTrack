// src/services/face.service.js
import * as faceapi from "face-api.js";
import { createCanvas, Image, ImageData, loadImage } from "@napi-rs/canvas";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../config/db.js";
import fs from "fs";
import { whatsappService } from "./whatsapp.service.js";

const CanvasConstructor = createCanvas(1, 1).constructor;

faceapi.env.monkeyPatch({
  Canvas: CanvasConstructor,
  Image,
  ImageData,
  createCanvasElement: (width, height) => {
    const w = width || 640;
    const h = height || 480;
    return createCanvas(w, h);
  },
  createImageElement: () => new Image(),
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS_PATH = path.join(__dirname, "../models");

let modelsLoaded = false;

const CONFIDENT_THRESHOLD = 0.5;
const DOUBT_THRESHOLD = 0.65;

const parseDescriptor = (dbData) => {
  if (!dbData) return null;

  if (typeof dbData === "string") {
    return JSON.parse(dbData);
  }

  if (Buffer.isBuffer(dbData)) {
    return JSON.parse(dbData.toString("utf-8"));
  }

  return dbData;
};

export const faceService = {
  async loadModels() {
    if (modelsLoaded) return;

    try {
      console.log("🧠 Cargando modelos de IA desde:", MODELS_PATH);

      if (!fs.existsSync(MODELS_PATH)) {
        console.warn("⚠️ ADVERTENCIA: La carpeta 'models' no existe.");
        return;
      }

      await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
      await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
      await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);

      modelsLoaded = true;
      console.log("✅ Modelos de IA cargados correctamente.");
    } catch (error) {
      console.error("❌ ERROR CRÍTICO DE IA:", error.message);
    }
  },

  async getActiveUserReferenceDescriptors() {
    const [users] = await db.execute(`
      SELECT
        u.idUsuario,
        u.nombre,
        u.apellido,
        u.correo,
        irf.descriptor
      FROM img_referencia_facial irf
      INNER JOIN usuarios u
        ON u.idUsuario = irf.idUsuario
      INNER JOIN estados_registro er
        ON er.idEstadoRegistro = u.idEstadoRegistro
      WHERE irf.esActiva = 1
        AND irf.deleted_at IS NULL
        AND irf.descriptor IS NOT NULL
        AND u.deleted_at IS NULL
        AND er.nombre = 'activo'
    `);

    return users;
  },

  async extractSingleFaceDescriptor(imagePath) {
    if (!modelsLoaded) {
      await this.loadModels();

      if (!modelsLoaded) {
        throw new Error("Sistema de IA no disponible.");
      }
    }

    const img = await loadImage(imagePath);

    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      throw new Error("No se detectó ningún rostro en la imagen.");
    }

    return detection.descriptor;
  },

  async identifyUserByFace(selfiePath) {
    if (!modelsLoaded) {
      await this.loadModels();

      if (!modelsLoaded) {
        throw new Error("Sistema de IA no disponible.");
      }
    }

    const inputDescriptor = await this.extractSingleFaceDescriptor(selfiePath);

    const users = await this.getActiveUserReferenceDescriptors();

    if (!users.length) {
      throw new Error("No hay usuarios con Face ID configurado.");
    }

    let bestMatch = null;

    for (const user of users) {
      try {
        const parsedData = parseDescriptor(user.descriptor);
        if (!parsedData) continue;

        const referenceDescriptor = new Float32Array(parsedData);

        const distance = faceapi.euclideanDistance(
          inputDescriptor,
          referenceDescriptor
        );

        if (!bestMatch || distance < bestMatch.distance) {
          bestMatch = {
            idUsuario: user.idUsuario,
            nombre: user.nombre,
            apellido: user.apellido,
            correo: user.correo,
            distance,
          };
        }
      } catch (error) {
        console.warn(
          `⚠️ Descriptor inválido para usuario ${user.idUsuario}:`,
          error.message
        );
      }
    }

    if (!bestMatch) {
      throw new Error("No se pudo comparar el rostro con los usuarios registrados.");
    }

    console.log(
      `🔐 Face ID mejor coincidencia: usuario ${bestMatch.idUsuario} | distancia ${bestMatch.distance.toFixed(
        4
      )}`
    );

    if (bestMatch.distance > CONFIDENT_THRESHOLD) {
      return {
        ok: false,
        match: null,
        distance: bestMatch.distance,
        error: "No pudimos identificarte con suficiente confianza.",
      };
    }

    return {
      ok: true,
      match: bestMatch,
      distance: bestMatch.distance,
    };
  },

  async processAndIndexImage(imagePath, idImagen) {
    if (!modelsLoaded) {
      await this.loadModels();
      if (!modelsLoaded) return 0;
    }

    try {
      const img = await loadImage(imagePath);

      const detections = await faceapi
        .detectAllFaces(img)
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length === 0) return 0;

      const users = await this.getActiveUserReferenceDescriptors();

      for (const detection of detections) {
        const faceDescArray = Array.from(detection.descriptor);

        await db.execute(
          `
          INSERT INTO rostros (
            idImagen,
            descriptor
          )
          VALUES (?, ?)
          `,
          [idImagen, JSON.stringify(faceDescArray)]
        );

        for (const user of users) {
          try {
            const parsedData = parseDescriptor(user.descriptor);
            if (!parsedData) continue;

            const userDescriptor = new Float32Array(parsedData);

            const distance = faceapi.euclideanDistance(
              detection.descriptor,
              userDescriptor
            );

            if (distance < CONFIDENT_THRESHOLD) {
              console.log(
                `🎯 MATCH SEGURO: Usuario ${user.idUsuario} (Dist: ${distance.toFixed(
                  4
                )})`
              );

              await this.saveMatch(
                user.idUsuario,
                idImagen,
                distance,
                "procesado",
                "¡Apareciste en una nueva foto!"
              );
            } else if (distance < DOUBT_THRESHOLD) {
              console.log(
                `🤔 DUDA: Usuario ${user.idUsuario} (Dist: ${distance.toFixed(
                  4
                )})`
              );

              await this.saveMatch(
                user.idUsuario,
                idImagen,
                distance,
                "pendiente",
                "¿Sos vos en esta foto? Ayudanos a confirmar."
              );
            }
          } catch (parseErr) {
            console.error(
              `Error procesando descriptor del usuario ${user.idUsuario}`,
              parseErr.message
            );
          }
        }
      }

      return detections.length;
    } catch (error) {
      console.error(`Error procesando img ${idImagen}:`, error);
      return 0;
    }
  },

  async registerUserFace(userId, selfiePath) {
    if (!modelsLoaded) {
      await this.loadModels();

      if (!modelsLoaded) {
        throw new Error("Sistema de IA no disponible.");
      }
    }

    const img = await loadImage(selfiePath);

    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      throw new Error("No se detectó rostro en la selfie.");
    }

    const descriptorArray = Array.from(detection.descriptor);

    await db.query(
      `
      UPDATE img_referencia_facial
      SET
        esActiva = 0,
        updated_at = CURRENT_TIMESTAMP
      WHERE idUsuario = ?
        AND esActiva = 1
        AND deleted_at IS NULL
      `,
      [userId]
    );

    await db.query(
      `
      INSERT INTO img_referencia_facial (
        idUsuario,
        rutaArchivo,
        descriptor,
        esActiva,
        idEstadoRegistro
      )
      VALUES (
        ?, ?, ?, 1,
        (
          SELECT idEstadoRegistro
          FROM estados_registro
          WHERE nombre = 'activo'
          LIMIT 1
        )
      )
      `,
      [userId, selfiePath, JSON.stringify(descriptorArray)]
    );

    console.log(`🔍 Escaneo retroactivo para usuario ${userId}...`);

    const [allFaces] = await db.query(`
      SELECT
        idRostro,
        idImagen,
        descriptor
      FROM rostros
      WHERE deleted_at IS NULL
    `);

    let matchesFound = 0;

    for (const face of allFaces) {
      try {
        const parsedData = parseDescriptor(face.descriptor);
        if (!parsedData) continue;

        const storedDescriptor = new Float32Array(parsedData);

        const distance = faceapi.euclideanDistance(
          detection.descriptor,
          storedDescriptor
        );

        if (distance < CONFIDENT_THRESHOLD) {
          await this.saveMatch(
            userId,
            face.idImagen,
            distance,
            "procesado",
            "Te encontramos en fotos anteriores"
          );

          matchesFound++;
        } else if (distance < DOUBT_THRESHOLD) {
          await this.saveMatch(
            userId,
            face.idImagen,
            distance,
            "pendiente",
            "¿Sos vos en fotos anteriores? Ayudanos a confirmar."
          );

          matchesFound++;
        }
      } catch (err) {
        console.error(
          `⚠️ Omitiendo rostro ID ${face.idRostro} por datos corruptos:`,
          err.message
        );
      }
    }

    return { matchesFound };
  },

  async saveMatch(idUsuario, idImagen, distancia, estado, mensajeNotificacion) {
    try {
      const estadoNormalizado =
        estado === "procesado" || estado === "confirmado"
          ? "procesado"
          : "pendiente";

      const confirmado = estadoNormalizado === "procesado" ? 1 : 0;

      await db.query(
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
        [
          idUsuario,
          idImagen,
          distancia,
          confirmado,
          estadoNormalizado,
        ]
      );

      let notificationData = null;

      try {
        const [result] = await db.query(
          `
          INSERT INTO notificaciones (
            idUsuario,
            idAlbum,
            mensaje,
            canal,
            leida,
            fechaEnvio,
            idEstadoRegistro
          )
          SELECT
            ?,
            i.idAlbum,
            ?,
            'sistema',
            0,
            NOW(),
            (
              SELECT idEstadoRegistro
              FROM estados_registro
              WHERE nombre = 'activo'
              LIMIT 1
            )
          FROM imagenes i
          WHERE i.idImagen = ?
          LIMIT 1
          `,
          [idUsuario, mensajeNotificacion, idImagen]
        );

        notificationData = result;
      } catch (e) {
        console.error("⚠️ Error creando notificación facial:", e.message);
      }

      try {
        const [rows] = await db.query(
          `
          SELECT
            u.idUsuario,
            u.nombre,
            u.correo,
            p.telefono,
            a.nombreEvento
          FROM usuarios u
          LEFT JOIN perfiles p
            ON p.idUsuario = u.idUsuario
          AND p.deleted_at IS NULL
          LEFT JOIN imagenes i
            ON i.idImagen = ?
          AND i.deleted_at IS NULL
          LEFT JOIN album a
            ON a.idAlbum = i.idAlbum
          AND a.deleted_at IS NULL
          WHERE u.idUsuario = ?
            AND u.deleted_at IS NULL
          LIMIT 1
          `,
          [idImagen, idUsuario]
        );

        const user = rows[0];

        if (!user?.telefono) {
          console.log(
            `📲 Usuario ${idUsuario} sin teléfono cargado. No se envía WhatsApp.`
          );
          return;
        }

        const mensajeWhatsapp = `📸 FotoTrack encontró una nueva foto donde aparecés${
          user.nombreEvento ? ` en el álbum "${user.nombreEvento}"` : ""
        }. Ingresá al sistema para verla.`;

        await db.query(
          `
          INSERT INTO notificaciones (
            idUsuario,
            idAlbum,
            mensaje,
            canal,
            leida,
            fechaEnvio,
            idEstadoRegistro
          )
          SELECT
            ?,
            i.idAlbum,
            ?,
            'whatsapp',
            0,
            NOW(),
            (
              SELECT idEstadoRegistro
              FROM estados_registro
              WHERE nombre = 'activo'
              LIMIT 1
            )
          FROM imagenes i
          WHERE i.idImagen = ?
          LIMIT 1
          `,
          [idUsuario, mensajeWhatsapp, idImagen]
        );

        await whatsappService.sendFaceDetectedNotification({
          telefono: user.telefono,
          nombre: user.nombre,
          album: user.nombreEvento,
          idImagen,
        });
      } catch (e) {
        console.error("⚠️ Error procesando WhatsApp facial:", e.message);
      }
    } catch (err) {
      console.error("Error en saveMatch:", err);
    }
  },
};