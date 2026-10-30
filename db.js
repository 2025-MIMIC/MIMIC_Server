import mysql from "mysql2/promise";
import { config } from "./config.js";

// createConnection establishes the connection; a failure must stop startup.
export const db = await mysql.createConnection(config.db).catch(() => {
  throw new Error("Database connection failed; check database configuration.");
});
console.log("DB 연결 성공");
