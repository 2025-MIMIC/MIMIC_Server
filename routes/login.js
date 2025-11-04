import express from "express";
import bcrypt from "bcrypt"; // 비밀번호 비교용
import { db } from "../db.js"; // DB 연결

const router = express.Router();

// POST /api/login
router.post("/", async (req, res) => {
    const { id, password } = req.body;

    // 1. 입력값 검증
    if (!id || !password) {
        return res.status(400).json({ error: "아이디와 비밀번호를 모두 입력하세요" });
    }

    try {
        // 2. DB에서 사용자 조회
        const [rows] = await db.execute("SELECT * FROM user WHERE id = ?", [id]);
        if (rows.length === 0) {
            return res.status(400).json({ error: "존재하지 않는 아이디입니다" });
        }

        const user = rows[0];

        // 3. 비밀번호 비교
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "비밀번호가 올바르지 않습니다" });
        }

        // 4. 로그인 성공
        // (JWT나 세션을 사용할 수 있지만, 여기서는 기본 응답만 예시로 줍니다)
        res.json({
            message: "로그인 성공",
            user: {
                id: user.id,
                name: user.name,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "서버 오류" });
    }
});

export default router;
