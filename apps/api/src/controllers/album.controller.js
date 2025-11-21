import sharp from "sharp";
import * as AlbumService from "../services/album.service.js";

export const crearAlbum = async (req, res) => {
  try {
    const { nombreEvento, fechaEvento, localizacion, descripcion } = req.body;
    const result = await AlbumService.crearAlbum({
      nombreEvento,
      fechaEvento,
      localizacion,
      descripcion,
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al crear álbum", error: err.message });
  }
};

export const obtenerAlbums = async (req, res) => {
  try {
    const rows = await AlbumService.listarAlbums();
    res.json(rows);
  } catch (err) {
    console.error("Error obtenerAlbums:", err);
    res.status(500).json({ msg: "Error al obtener álbumes", error: err.message });
  }
};

export const uploadAlbumImages = async (req, res) => {
  try {
    const albumId = req.params.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: "No se enviaron imágenes" });
    }

    const insertedImages = [];

    for (const file of req.files) {
      const optimizedPath = file.path.replace(/(\.[a-z]+)$/i, "-opt.webp");

      await sharp(file.path)
        .resize(1920)
        .webp({ quality: 80 })
        .toFile(optimizedPath);

      const [result] = await db.query(
        "INSERT INTO Imagen (idAlbum, ruta, nombreArchivo) VALUES (?, ?, ?)",
        [albumId, optimizedPath, file.filename]
      );

      insertedImages.push({
        idImagen: result.insertId,
        ruta: optimizedPath,
        nombre: file.filename,
      });
    }

    res.json({
      msg: "Imágenes subidas correctamente",
      insertedImages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al procesar las imágenes" });
  }
};


