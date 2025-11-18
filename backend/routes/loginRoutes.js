import express from "express";
import db from "../db.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if(!email.endsWith("@universidadean.edu.co")) {
        return res.status(400).json({
            error: "Solo se permite correos terminados en @universidadean.edu.co"
        })
    }

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err });

        if (results.length === 0) {
            return res.status(400).json({ error: "Usuario no existe" });
        }

        const user = results[0];

        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(400).json({ error: "Contraseña incorrecta" });
        }

        res.json({
            message: "Login exitoso",
            fullname: user.fullname,
            email: user.email
        });
    });
});

export default router;
