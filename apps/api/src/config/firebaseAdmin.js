import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Carga del archivo JSON del Admin SDK (asegurate de que el nombre coincida)
const serviceAccount = require(
  path.join(__dirname, "./serviceAccountKey.json")
);

// Inicialización de Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Exportar instancia de auth (útil si necesitás usarla)
const auth = admin.auth();

export { auth };
export default admin;
