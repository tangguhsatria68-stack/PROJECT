const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const router = express.Router();

// ===== DEBUG: Informational GET endpoints (browser-friendly)
router.get('/register', (req, res) => {
    res.json({
        message: 'Endpoint menerima POST untuk mendaftar. Gunakan POST dengan JSON {username, password, full_name}.'
    });
});

router.get('/login', (req, res) => {
    res.json({
        message: 'Endpoint menerima POST untuk login. Gunakan POST dengan JSON {username, password}.'
    });
});


// REGISTER
router.post("/register", async(req, res) => {
    try {
        const { username, password, full_name } = req.body;

        const checkUser = await pool.query(
            "SELECT * FROM users WHERE username=$1", [username]
        );

        if (checkUser.rows.length > 0) {
            return res.status(400).json("Username sudah digunakan");
        }

        const hashed = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            `INSERT INTO users (username,password,full_name)
       VALUES ($1,$2,$3)
       RETURNING user_id,username,full_name`, [username, hashed, full_name]
        );

        res.json(newUser.rows[0]);

    } catch (err) {
        res.status(500).json(err.message);
    }
});


// LOGIN
router.post("/login", async(req, res) => {
    try {
        const { username, password } = req.body;

        const user = await pool.query(
            "SELECT * FROM users WHERE username=$1", [username]
        );

        if (user.rows.length === 0)
            return res.status(400).json("User tidak ditemukan");

        const userRow = user.rows[0];

        // Jika kolom `is_active` ada dan bernilai false, tolak akses.
        // Jika kolom tidak ada (mis. skema lama), anggap user aktif.
        if (Object.prototype.hasOwnProperty.call(userRow, 'is_active') && userRow.is_active === false)
            return res.status(403).json("User tidak aktif");

        const valid = await bcrypt.compare(
            password,
            user.rows[0].password
        );

        if (!valid)
            return res.status(400).json("Password salah");

        const token = jwt.sign({
                id: userRow.user_id,
                role: userRow.role || 'user'
            },
            process.env.JWT_SECRET, { expiresIn: "1h" }
        );

        res.json({ token });

    } catch (err) {
        res.status(500).json(err.message);
    }
});

module.exports = router;