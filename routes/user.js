import express from "express";
import bcrypt from "bcrypt";
import { db } from "../db.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, password, name } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ error: "모든 필드를 입력해주세요." });
  }

  try {
    const [rows] = await db.query("SELECT id FROM user WHERE id = ?", [username]);
    if (rows.length > 0) {
      return res.status(409).json({ error: "이미 존재하는 아이디입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query("INSERT INTO user (id, password, name) VALUES (?, ?, ?)", [username, hashedPassword, name]);

    res.json({ message: "회원가입 성공!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 오류" });
  }
});

export default router;
