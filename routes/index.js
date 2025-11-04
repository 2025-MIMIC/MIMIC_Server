// routes/index.js
import express from "express";
import { db } from "../db.js"; // ✅ 여기 수정

const router = express.Router();

router.get("/test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT NOW() AS current_time"); // ✅ db로 변경
    res.json({ message: "DB 연결 성공", time: rows[0].current_time });
  } catch (err) {
    console.error("DB 에러:", err);
    res.status(500).json({ error: "DB 연결 실패", details: err.message });
  }
});

export default router;