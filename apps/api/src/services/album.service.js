// src/services/album.service.js
import { albumRepository } from "../repositories/album.repository.js";
import { imageRepository } from "../repositories/image.repository.js"; // Necesario para buscar fotos
import cloudinary from "../config/cloudinary.js"; // Necesario para borrar de la nube

export const albumService = {
  
  // --- MÉTODOS DE LECTURA (Sin cambios) ---
  async listAlbums() {
    return await albumRepository.getAll();
  },

  async listPublicAlbums() {
    return await albumRepository.getAllPublic();
  },

  async getAlbumById(idAlbum) {
    return await albumRepository.findById(idAlbum);
  },

  // --- CREAR (Sin cambios) ---
  async createAlbum(data) {
    const { nombreEvento, fechaEvento } = data;

    if (!nombreEvento || !fechaEvento) {
      throw new Error("Faltan datos obligatorios del álbum (nombre y fecha).");
    }

    const fechaMySQL = fechaEvento.split("T")[0];
    const precioFoto = data.precioFoto ? Number(data.precioFoto) : null;
    const precioAlbum = data.precioAlbum ? Number(data.precioAlbum) : null;

    if ((data.precioFoto && isNaN(precioFoto)) || (data.precioAlbum && isNaN(precioAlbum))) {
      throw new Error("Los precios deben ser numéricos.");
    }

    return await albumRepository.create({
      ...data,
      fechaEvento: fechaMySQL,
      precioFoto,
      precioAlbum,
    });
  },

  // ⭐ ACTUALIZADO: ELIMINAR ÁLBUM COMPLETO (Hard Delete)
  // Ahora borra las 3 versiones de cada foto usando la API Admin de Cloudinary
  async deleteAlbumHard(idAlbum) {
    console.log(`🗑️ Iniciando borrado profundo del álbum ${idAlbum}...`);

    // 1. Obtener todas las imágenes del álbum desde la BD
    const imagenes = await imageRepository.getByAlbum(idAlbum);

    // 2. Recopilar TODOS los IDs de Cloudinary (Original, Thumb, Optimized)
    const cloudIds = [];
    
    imagenes.forEach(img => {
        if (img.public_id) cloudIds.push(img.public_id);
        if (img.public_id_thumb) cloudIds.push(img.public_id_thumb);
        if (img.public_id_optimized) cloudIds.push(img.public_id_optimized);
    });

    // 3. Borrar masivamente en Cloudinary
    if (cloudIds.length > 0) {
        try {
            console.log(`☁️ Intentando eliminar ${cloudIds.length} recursos en Cloudinary...`);
            
            // Usamos la API de Admin para borrar en lote (mucho más rápido y seguro)
            // Nota: delete_resources acepta arrays de hasta 100 o 1000 items dependiendo del plan.
            // Si tienes álbumes gigantes, Cloudinary maneja esto bastante bien, pero idealmente se hace por chunks.
            // Para tu caso de uso actual, esto funcionará perfecto.
            await cloudinary.api.delete_resources(cloudIds); 
            
            console.log("✅ Limpieza de Cloudinary completada.");
        } catch (err) {
            console.error("⚠ Error en borrado masivo Cloudinary (posiblemente permisos o rate limit):", err.message);
            
            // Fallback: Si falla el borrado masivo (ej. por permisos de API Admin), 
            // intentamos el método lento uno por uno para no dejar basura.
            console.log("🔄 Intentando borrado alternativo (uno por uno)...");
            for (const id of cloudIds) {
                await cloudinary.uploader.destroy(id).catch(e => console.warn(`Fallo borrar ${id}`, e.message));
            }
        }
    }

    // 4. Borrar el álbum y sus datos de la BD 
    // (Al borrar el álbum, las filas de la tabla 'imagenes' deberían borrarse por CASCADE en SQL,
    // pero el repositorio se asegura de limpiar la referencia del álbum).
    return await albumRepository.deleteHard(idAlbum);
  },

  // --- ACTUALIZAR (Sin cambios, mantiene tu lógica de fusión) ---
  async actualizarAlbum(idAlbum, data) {
    const actual = await albumRepository.findById(idAlbum);
    if (!actual) throw new Error("El álbum no existe");

    const merge = {
      nombreEvento: data.nombreEvento || actual.nombreEvento,
      localizacion: data.localizacion || actual.localizacion,
      descripcion: data.descripcion || actual.descripcion,
      
      fechaEvento: data.fechaEvento 
        ? (data.fechaEvento.includes("T") ? data.fechaEvento.split("T")[0] : data.fechaEvento)
        : actual.fechaEvento,

      precioFoto: data.precioFoto !== undefined && data.precioFoto !== "" 
        ? Number(data.precioFoto) 
        : actual.precioFoto,
      
      precioAlbum: data.precioAlbum !== undefined && data.precioAlbum !== "" 
        ? Number(data.precioAlbum) 
        : actual.precioAlbum,

      estado: data.estado || actual.estado,
      visibilidad: data.visibilidad || actual.visibilidad,
      tags: data.tags || actual.tags,
    };

    if (isNaN(merge.precioFoto) || isNaN(merge.precioAlbum)) {
      throw new Error("Los precios deben ser numéricos.");
    }

    return await albumRepository.actualizarAlbum(idAlbum, merge);
  },
};