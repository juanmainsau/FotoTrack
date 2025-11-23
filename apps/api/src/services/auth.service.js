// src/services/auth.service.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import admin from "../config/firebaseAdmin.js";
import { userRepository } from "../repositories/user.repository.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Normaliza el usuario que viene de la DB
function normalizeUser(dbUser) {
  if (!dbUser) return null;

  const id =
    dbUser.idUsuario !== undefined ? dbUser.idUsuario : dbUser.id || null;

  return {
    id,
    correo: dbUser.correo,
    nombre: dbUser.nombre || "",
    rol: dbUser.rol || "cliente",
    firebase_uid: dbUser.firebase_uid || null,
  };
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      correo: user.correo,
      rol: user.rol,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export const authService = {
  // Registro tradicional: correo + contraseña
  async register({ correo, password }) {
    const existing = await userRepository.findByEmail(correo);
    if (existing) {
      const error = new Error("EMAIL_IN_USE");
      error.code = "EMAIL_IN_USE";
      throw error;
    }

    const hash = await bcrypt.hash(password, 10);

    const created = await userRepository.createTraditionalUser({
      correo,
      passwordHash: hash,
    });

    const user = normalizeUser({
      id: created.id,
      correo: created.correo,
      rol: created.rol,
    });

    const token = signToken(user);

    return { token, user };
  },

  // Login tradicional: correo + contraseña
  async login({ correo, password }) {
    const dbUser = await userRepository.findByEmail(correo);

    if (!dbUser || !dbUser.contrasena) {
      const error = new Error("INVALID_CREDENTIALS");
      error.code = "INVALID_CREDENTIALS";
      throw error;
    }

    const isValid = await bcrypt.compare(password, dbUser.contrasena);
    if (!isValid) {
      const error = new Error("INVALID_CREDENTIALS");
      error.code = "INVALID_CREDENTIALS";
      throw error;
    }

    const user = normalizeUser(dbUser);
    const token = signToken(user);

    return { token, user };
  },

  // Login / registro con Google + vinculación
  async loginWithGoogle(idToken) {
    // 1) Verificar token de Firebase
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decoded;

    if (!email) {
      const error = new Error("GOOGLE_WITHOUT_EMAIL");
      error.code = "GOOGLE_WITHOUT_EMAIL";
      throw error;
    }

    // 2) ¿Existe por firebase_uid?
    let dbUser = await userRepository.findByFirebaseUid(uid);

    if (!dbUser) {
      // 3) ¿Existe cuenta tradicional con ese correo?
      const byEmail = await userRepository.findByEmail(email);

      if (byEmail) {
        // Vinculamos Google a cuenta existente
        dbUser = await userRepository.linkGoogleAccountByEmail({
          firebaseUid: uid,
          correo: email,
        });
      } else {
        // 4) Crear usuario nuevo a partir de Google
        const created = await userRepository.createGoogleUser({
          firebaseUid: uid,
          correo: email,
          nombre: name,
        });

        // Simulamos un "dbUser" completo
        dbUser = {
          id: created.id,
          correo: created.correo,
          nombre: created.nombre,
          rol: created.rol,
          firebase_uid: created.firebase_uid,
        };
      }
    }

    const user = normalizeUser(dbUser);
    const token = signToken(user);

    return { token, user };
  },
};
