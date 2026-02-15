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

// Apuntamos a la carpeta de modelos
const MODELS_PATH = path.join(__dirname, "../models");

let modelsLoaded = false;
const DISTANCE_THRESHOLD = 0.5; 

export const faceService = {

  // 1. Carga de modelos
  async loadModels() {
    if (modelsLoaded) return;
    try {
      console.log("🧠 Cargando modelos de IA desde:", MODELS_PATH);

      if (!fs.existsSync(MODELS_PATH)) {
        console.warn("⚠️ ADVERTENCIA: La carpeta 'models' no existe en:", MODELS_PATH);
        return; 
      }

      // 👇 CAMBIO: Cargamos SSD MobileNet (coincide con tus archivos)
      await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
      await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
      await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);
      
      modelsLoaded = true;
      console.log("✅ Modelos de IA cargados correctamente.");

    } catch (error) {
      console.error("❌ ERROR CRÍTICO DE IA: Falló la carga de modelos.");
      console.error("   Detalle:", error.message);
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
      
      // 👇 CAMBIO: Usamos detectAllFaces por defecto (usa SSD MobileNet)
      // Quitamos 'new faceapi.TinyFaceDetectorOptions()'
      const detections = await faceapi.detectAllFaces(img)
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length === 0) return 0;

      const [users] = await db.query(
        "SELECT idUsuario, descriptor FROM usuarios WHERE descriptor IS NOT NULL"
      );

      for (const detection of detections) {
        const faceDescArray = Array.from(detection.descriptor);

        // Guardar la cara anónima
        await db.query(
          "INSERT INTO rostros (idImagen, descriptor) VALUES (?, ?)", 
          [idImagen, JSON.stringify(faceDescArray)]
        );

        // Buscar match con usuarios
        for (const user of users) {
          const userDescriptor = new Float32Array(JSON.parse(user.descriptor)); 
          const distance = faceapi.euclideanDistance(detection.descriptor, userDescriptor);

          if (distance < DISTANCE_THRESHOLD) {
            console.log(`🎯 MATCH: Usuario ${user.idUsuario} en imagen ${idImagen}`);
            await this.saveMatch(user.idUsuario, idImagen, distance, "¡Apareciste en una nueva foto!");
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
   * 🔄 FLUJO B: Registro de selfie
   */
  async registerUserFace(userId, selfiePath) {
    if (!modelsLoaded) {
        await this.loadModels();
        if (!modelsLoaded) throw new Error("Sistema de IA no disponible.");
    }

    const img = await loadImage(selfiePath);
    
    // 👇 CAMBIO: Usamos detectSingleFace por defecto (SSD MobileNet)
    const detection = await faceapi.detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      throw new Error("No se detectó rostro en la selfie.");
    }

    const descriptorArray = Array.from(detection.descriptor);

    // IMPORTANTE: Asegúrate de tener la columna 'descriptor' en tu tabla usuarios
    // Si no, cambia 'descriptor' por el nombre correcto de tu columna.
    await db.query(
      "UPDATE usuarios SET descriptor = ? WHERE idUsuario = ?", 
      [JSON.stringify(descriptorArray), userId]
    );

    console.log(`🔍 Escaneo retroactivo para usuario ${userId}...`);
    
    const [allFaces] = await db.query("SELECT idImagen, descriptor FROM rostros");
    let matchesFound = 0;

    for (const face of allFaces) {
      const storedDescriptor = new Float32Array(JSON.parse(face.descriptor)); 
      const distance = faceapi.euclideanDistance(detection.descriptor, storedDescriptor);

      if (distance < DISTANCE_THRESHOLD) {
        await this.saveMatch(userId, face.idImagen, distance, "Te encontramos en fotos anteriores");
        matchesFound++;
      }
    }

    return { matchesFound };
  },

  async saveMatch(idUsuario, idImagen, distancia, mensajeNotificacion) {
    try {
      await db.query(
        "INSERT IGNORE INTO usuario_coincidencias (idUsuario, idImagen) VALUES (?, ?)", 
        [idUsuario, idImagen]
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