import sharp from "sharp";
import { db } from "../config/db.js";

export const crearAlbum = async (req, res) => {
  try {
    const { nombreEvento, fechaEvento, localizacion, descripcion } = req.body;

    const [result] = await db.query(
      "INSERT INTO album (nombreEvento, fechaEvento, localizacion, descripcion) VALUES (?, ?, ?, ?)",
      [nombreEvento, fechaEvento, localizacion, descripcion]
    );

    res.json({ idAlbum: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al crear álbum" });
  }
};

export const obtenerAlbums = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM album");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ msg: "Error al obtener álbumes" });
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


