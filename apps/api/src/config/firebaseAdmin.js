import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Ruta ABSOLUTA al archivo JSON
const serviceAccount = require(path.join(__dirname, "../../firebase-service-account.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
