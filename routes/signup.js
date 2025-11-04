import express from "express";
import bcrypt from "bcrypt"; // 비밀번호 암호화
import { db } from "../db.js"; // db 연결

const router = express.Router();

// POST /api/signup
router.post("/", async (req, res) => {
    const { id, password, name } = req.body;

    if (!id || !password || !name) {
        return res.status(400).json({ error: "모든 필드를 입력하세요" });
    }

    try {
        // 1. 이미 존재하는 id인지 확인
        const [rows] = await db.execute("SELECT id FROM user WHERE id=?", [id]);
        if (rows.length > 0) {
            return res.status(400).json({ error: "이미 존재하는 아이디입니다" });
        }

        // 2. 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. DB에 삽입
        await db.execute(
            "INSERT INTO user (id, password, name) VALUES (?, ?, ?)",
            [id, hashedPassword, name]
        );

        res.json({ message: "회원가입 성공" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "서버 오류" });
    }
});

export default router;
