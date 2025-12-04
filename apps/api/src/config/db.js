import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// 🔥 AQUÍ CREAMOS Y EXPORTAMOS db COMO EXPORT NOMBRADO
export const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "fototrack",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
