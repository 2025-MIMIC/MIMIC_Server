import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const db = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "mydatabase",
});

try {
    await db.connect();
    console.log("DB 연결 성공");
} catch (err) {
    console.error("DB 연결 실패", err);
}
