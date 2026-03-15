// src/controllers/auth.controller.js
import { userRepository } from "../repositories/user.repository.js";
import { db } from "../config/db.js";
import { faceService } from "../services/face.service.js"; 
import { auditService } from "../services/audit.service.js";
import crypto from "crypto"; 

// 🧠 Función auxiliar para calcular distancia euclidiana (IA)
const getEuclideanDistance = (arr1, arr2) => {
  return Math.sqrt(
    arr1.reduce((sum, val, i) => sum + Math.pow(val - arr2[i], 2), 0)
  );
};

// 🔐 Funciones auxiliares para contraseñas con Crypto
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`; 
};

// 🔑 Función para verificar contraseña al loguearse
const verifyPassword = (password, storedValue) => {
  if (!storedValue || !storedValue.includes(":")) return false;
  const [salt, storedHash] = storedValue.split(":");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === storedHash;
};

export const authController = {
  
  // =========================================================
  // 🔐 AUTENTICACIÓN Y PERFIL
  // =========================================================

  async login(req, res) {
    try {
      const { correo, password } = req.body;

      if (!correo || !password) {
        return res.status(400).json({ ok: false, error: "Correo y contraseña requeridos." });
      }

      const [rows] = await db.query(
        "SELECT * FROM usuarios WHERE correo = ? AND estado != 'eliminado'", 
        [correo.trim()]
      );

      // ✅ CORRECCIÓN: Extraemos el primer elemento del array
      const user = rows[0]; 

      // 🚨 NOTA: Usamos 'contrasena' ya que así figura en tu base de datos
      if (!user || !user.contrasena || !verifyPassword(password, user.contrasena)) {
        return res.status(401).json({ ok: false, error: "Credenciales incorrectas." });
      }

      if (user.estado === 'inactivo') {
        return res.status(403).json({ ok: false, error: "Tu cuenta está suspendida. Contacta al administrador." });
      }

      await auditService.log({
        req: { ...req, user: { idUsuario: user.idUsuario } },
        idAccion: 2, 
        idTipoEntidad: 1,
        idEntidadAfectada: user.idUsuario,
        detalle: `Inicio de sesión exitoso vía Email: ${correo}`
      });

      return res.json({ 
        ok: true, 
        mensaje: "Bienvenido a FotoTrack",
        user: {
          idUsuario: user.idUsuario,
          nombre: user.nombre,
          rol: user.rol
        }
      });

    } catch (error) {
      console.error("❌ Error en login:", error);
      return res.status(500).json({ ok: false, error: "Error interno al intentar iniciar sesión." });
    }
  },

  async me(req, res) {
    try {
      const user = await userRepository.findById(req.user.idUsuario || req.user.id);

      if (!user) {
        return res.status(404).json({ ok: false, error: "Usuario no encontrado" });
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
          foto_referencia: user.foto_referencia,
          estado: user.estado,
        },
      });
    } catch (err) {
      console.error("Error en /auth/me:", err);
      return res.status(500).json({ ok: false, error: "Error al obtener usuario" });
    }
  },

  async register(req, res) {
    try {
      const { nombre, correo, password } = req.body;

      if (!correo || !password || !nombre) {
        return res.status(400).json({ ok: false, error: "Todos los campos son obligatorios." });
      }

      const [existing] = await db.query("SELECT idUsuario FROM usuarios WHERE correo = ?", [correo]);
      if (existing.length > 0) {
        return res.status(400).json({ ok: false, error: "El correo ya está registrado." });
      }

      const hashedPassword = hashPassword(password);

      // 🚨 NOTA: Usamos 'contrasena' para coincidir con tu esquema de DB
      const [result] = await db.query(
        `INSERT INTO usuarios (nombre, correo, contrasena, rol, estado) 
         VALUES (?, ?, ?, 'cliente', 'activo')`,
        [nombre.trim(), correo.trim(), hashedPassword]
      );

      await auditService.log({
        req: { ...req, user: { idUsuario: result.insertId } },
        idAccion: 1, 
        idTipoEntidad: 1,
        idEntidadAfectada: result.insertId,
        detalle: `Nueva cuenta creada vía Email: ${correo}`
      });

      return res.status(201).json({ ok: true, mensaje: "Usuario registrado con éxito." });
    } catch (error) {
      console.error("❌ Error en registro:", error);
      return res.status(500).json({ ok: false, error: "Error al crear la cuenta." });
    }
  },

  async updateProfile(req, res) {
    try {
      const idUsuario = req.user?.idUsuario || req.user?.id;
      const { nombre, cuit } = req.body;

      if (!idUsuario) {
        return res.status(401).json({ ok: false, error: "Usuario no autenticado." });
      }

      if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ ok: false, error: "El nombre debe tener al menos 3 caracteres." });
      }

      const cuitFinal = cuit && cuit.trim() !== "" ? cuit.trim() : null;

      const [result] = await db.query(
        "UPDATE usuarios SET nombre = ?, cuit = ? WHERE idUsuario = ?", 
        [nombre.trim(), cuitFinal, idUsuario]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, error: "Usuario no encontrado." });
      }

      await auditService.log({
        req,
        idAccion: 4, 
        idTipoEntidad: 1,
        idEntidadAfectada: idUsuario,
        detalle: `Perfil actualizado. CUIT: ${cuitFinal || 'No especificado'}`
      });

      return res.json({ ok: true, mensaje: "Perfil actualizado correctamente." });
    } catch (error) {
      console.error("❌ Error en updateProfile:", error);
      return res.status(500).json({ ok: false, error: "Error al actualizar el perfil." });
    }
  },

  // =========================================================
  // 📸 RECONOCIMIENTO FACIAL E IA
  // =========================================================

  async uploadSelfie(req, res) {
    try {
      const idUsuario = req.user?.idUsuario || req.user?.id;

      if (!req.file) {
        return res.status(400).json({ ok: false, error: "No se recibió ninguna imagen." });
      }

      const photoUrl = `/uploads/selfies/${req.file.filename}`;
      const absolutePath = req.file.path; 

      console.log(`🧠 Iniciando reconocimiento facial para usuario ${idUsuario}...`);

      const resultadoIA = await faceService.registerUserFace(idUsuario, absolutePath);

      await db.query(
        "UPDATE usuarios SET foto_referencia = ? WHERE idUsuario = ?", 
        [photoUrl, idUsuario]
      );

      return res.json({ 
        ok: true, 
        mensaje: "Reconocimiento facial configurado con éxito",
        matchesEncontrados: resultadoIA.matchesFound,
        url: photoUrl
      });
    } catch (error) {
      console.error("❌ Error en uploadSelfie/IA:", error);
      return res.status(500).json({ ok: false, error: "Error al procesar la selfie." });
    }
  },

  async findMyPhotos(req, res) {
    try {
      const idUsuario = req.user.idUsuario || req.user.id;

      const [userRows] = await db.execute(
        "SELECT descriptor FROM usuarios WHERE idUsuario = ?", 
        [idUsuario]
      );

      // ✅ CORRECCIÓN: Extraemos el primer usuario del array de resultados
      const user = userRows[0];

      if (!user || !user.descriptor) {
        return res.status(400).json({ 
          ok: false, 
          error: "Primero debes subir tu selfie en el perfil para poder buscarte." 
        });
      }

      const [allFaces] = await db.execute("SELECT idImagen, descriptor FROM rostros");
      const userDescriptor = new Float32Array(JSON.parse(user.descriptor));
      let nuevosMatches = 0;

      for (const face of allFaces) {
        try {
          const faceDescriptor = new Float32Array(JSON.parse(face.descriptor));
          const distance = getEuclideanDistance(userDescriptor, faceDescriptor);

          if (distance < 0.6) { 
            const estado = distance < 0.5 ? 'confirmado' : 'pendiente';
            
            const [matchResult] = await db.execute(
              "INSERT IGNORE INTO usuario_coincidencias (idUsuario, idImagen, estado) VALUES (?, ?, ?)",
              [idUsuario, face.idImagen, estado]
            );
            
            if (matchResult.affectedRows > 0) nuevosMatches++;
          }
        } catch (e) { continue; }
      }

      return res.json({ 
        ok: true, 
        mensaje: nuevosMatches > 0 
          ? `¡Genial! Encontramos ${nuevosMatches} fotos nuevas.` 
          : "No encontramos fotos nuevas por ahora.",
        encontradas: nuevosMatches
      });
    } catch (error) {
      console.error("Error en findMyPhotos:", error);
      return res.status(500).json({ ok: false, error: "Error en la búsqueda." });
    }
  },

  async confirmMatch(req, res) {
    try {
      const { idImagen, esElUsuario } = req.body;
      const idUsuario = req.user.idUsuario || req.user.id;

      if (esElUsuario) {
        await db.execute(
          "UPDATE usuario_coincidencias SET estado = 'confirmado' WHERE idUsuario = ? AND idImagen = ?",
          [idUsuario, idImagen]
        );
        await auditService.log({
          req, idAccion: 5, idTipoEntidad: 5, idEntidadAfectada: idImagen,
          detalle: `Usuario confirmó identidad en imagen #${idImagen}`
        });
      } else {
        await db.execute(
          "DELETE FROM usuario_coincidencias WHERE idUsuario = ? AND idImagen = ?",
          [idUsuario, idImagen]
        );
        await auditService.log({
          req, idAccion: 6, idTipoEntidad: 5, idEntidadAfectada: idImagen,
          detalle: `Usuario rechazó match sugerido en imagen #${idImagen}`
        });
      }

      return res.json({ ok: true });
    } catch (error) {
      console.error("Error en confirmMatch:", error);
      return res.status(500).json({ ok: false, error: "Error al procesar la respuesta." });
    }
  }
};