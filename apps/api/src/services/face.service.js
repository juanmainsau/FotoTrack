// src/services/face.service.js
import * as faceapi from "face-api.js";
import { createCanvas, Image, ImageData, loadImage } from "@napi-rs/canvas"; 
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../config/db.js";
import fs from "fs";

/**
 * 🔧 CONFIGURACIÓN DE ENTORNO
 */
const CanvasConstructor = createCanvas(1, 1).constructor;

faceapi.env.monkeyPatch({
  Canvas: CanvasConstructor,
  Image: Image,
  ImageData: ImageData,
  createCanvasElement: (width, height) => {
    const w = width || 640; 
    const h = height || 480; 
    return createCanvas(w, h);
  },
  createImageElement: () => new Image()
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS_PATH = path.join(__dirname, "../models");

let modelsLoaded = false;

// 🟢 UMBRALES DE INTELIGENCIA
const CONFIDENT_THRESHOLD = 0.5; // Menos de 0.5: Es match seguro.
const DOUBT_THRESHOLD = 0.65;    // Entre 0.5 y 0.65: Zona de duda (pregunta al usuario).

/**
 * 🛡️ HELPER: Parseo robusto del descriptor desde MySQL
 * Identifica si viene como String, Buffer o ya parseado como Array.
 */
const parseDescriptor = (dbData) => {
  if (!dbData) return null;
  if (typeof dbData === 'string') return JSON.parse(dbData);
  if (Buffer.isBuffer(dbData)) return JSON.parse(dbData.toString('utf-8'));
  return dbData; // Si ya es un array porque MySQL lo parseó automático
};

export const faceService = {

  // 1. Carga de modelos
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

  /**
   * 🔄 FLUJO A: Procesar fotos del álbum
   */
  async processAndIndexImage(imagePath, idImagen) {
    if (!modelsLoaded) {
        await this.loadModels();
        if (!modelsLoaded) return 0;
    }

    try {
      const img = await loadImage(imagePath);
      const detections = await faceapi.detectAllFaces(img)
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length === 0) return 0;

      const [users] = await db.execute(
        "SELECT idUsuario, descriptor FROM usuarios WHERE descriptor IS NOT NULL"
      );

      for (const detection of detections) {
        const faceDescArray = Array.from(detection.descriptor);

        await db.execute(
          "INSERT INTO rostros (idImagen, descriptor) VALUES (?, ?)", 
          [idImagen, JSON.stringify(faceDescArray)]
        );

        for (const user of users) {
          try {
            // ✅ FIX: Usamos el helper robusto
            const parsedData = parseDescriptor(user.descriptor);
            const userDescriptor = new Float32Array(parsedData); 
            
            const distance = faceapi.euclideanDistance(detection.descriptor, userDescriptor);

            // 🤖 Lógica de decisión por umbral
            if (distance < CONFIDENT_THRESHOLD) {
              console.log(`🎯 MATCH SEGURO: Usuario ${user.idUsuario} (Dist: ${distance.toFixed(4)})`);
              await this.saveMatch(user.idUsuario, idImagen, distance, 'confirmado', "¡Apareciste en una nueva foto!");
            } 
            else if (distance < DOUBT_THRESHOLD) {
              console.log(`🤔 DUDA: Usuario ${user.idUsuario} (Dist: ${distance.toFixed(4)})`);
              await this.saveMatch(user.idUsuario, idImagen, distance, 'pendiente', "¿Sos vos en esta foto? Ayudanos a confirmar.");
            }
          } catch (parseErr) {
            console.error(`Error procesando descriptor del usuario ${user.idUsuario}`, parseErr.message);
          }
        }
      }
      return detections.length;
    } catch (error) {
      console.error(`Error procesando img ${idImagen}:`, error);
      return 0;
    }
  },

  /**
   * 🔄 FLUJO B: Registro de selfie (Escaneo retroactivo)
   */
  async registerUserFace(userId, selfiePath) {
    if (!modelsLoaded) {
        await this.loadModels();
        if (!modelsLoaded) throw new Error("Sistema de IA no disponible.");
    }

    const img = await loadImage(selfiePath);
    const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

    if (!detection) throw new Error("No se detectó rostro en la selfie.");

    const descriptorArray = Array.from(detection.descriptor);

    await db.query(
      "UPDATE usuarios SET descriptor = ? WHERE idUsuario = ?", 
      [JSON.stringify(descriptorArray), userId]
    );

    console.log(`🔍 Escaneo retroactivo para usuario ${userId}...`);
    const [allFaces] = await db.query("SELECT id, idImagen, descriptor FROM rostros");
    let matchesFound = 0;

    for (const face of allFaces) {
      try {
        // ✅ FIX: Usamos el helper robusto aquí también
        const parsedData = parseDescriptor(face.descriptor);
        const storedDescriptor = new Float32Array(parsedData); 
        
        const distance = faceapi.euclideanDistance(detection.descriptor, storedDescriptor);

        if (distance < CONFIDENT_THRESHOLD) {
          await this.saveMatch(userId, face.idImagen, distance, 'confirmado', "Te encontramos en fotos anteriores");
          matchesFound++;
        } 
        else if (distance < DOUBT_THRESHOLD) {
          await this.saveMatch(userId, face.idImagen, distance, 'pendiente', "¿Sos vos en fotos anteriores? Ayudanos a confirmar.");
          matchesFound++;
        }
      } catch (err) {
        console.error(`⚠️ Omitiendo rostro ID ${face.id} por datos corruptos:`, err.message);
        continue;
      }
    }
    return { matchesFound };
  },

  async saveMatch(idUsuario, idImagen, distancia, estado, mensajeNotificacion) {
    try {
      // 🛡️ Guardamos el estado (confirmado/pendiente) en la relación
      await db.query(
        "INSERT IGNORE INTO usuario_coincidencias (idUsuario, idImagen, estado) VALUES (?, ?, ?)", 
        [idUsuario, idImagen, estado]
      );

      try {
        await db.query(
          "INSERT INTO notificaciones (idUsuario, mensaje, leido) VALUES (?, ?, 0)",
          [idUsuario, mensajeNotificacion]
        );
      } catch (e) { }
    } catch (err) {
      console.error("Error en saveMatch:", err);
    }
  }
};