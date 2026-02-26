const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// 🔥 GET semua produk
router.get("/", async(req, res) => {
    try {

        const products = await pool.query(
            "SELECT * FROM products ORDER BY product_id DESC"
        );

        res.json(products.rows);

    } catch (err) {
        res.status(500).json(err.message);
    }
});


// 🔥 Tambah produk
router.post("/", authMiddleware, async(req, res) => {
    try {

        const { category_id, name, price, stock, description } = req.body;

        const newProduct = await pool.query(
            `INSERT INTO products 
      (category_id, name, price, stock, description)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *`, [category_id, name, price, stock, description]
        );

        res.json(newProduct.rows[0]);

    } catch (err) {
        res.status(500).json(err.message);
    }
});


// 🔥 Hapus produk berdasarkan daftar nama (harus admin)
router.post('/delete-names', authMiddleware, async(req, res) => {
    try {
        if (!(req.user && (req.user.is_admin || req.user.role === 'admin'))) {
            return res.status(403).json('Forbidden');
        }

        const { names } = req.body;
        if (!names || !Array.isArray(names) || names.length === 0) {
            return res.status(400).json('No names provided');
        }

        const lowerNames = names.map(n => n.toLowerCase());
        const deleted = await pool.query(
            'DELETE FROM products WHERE lower(name) = ANY($1) RETURNING *', [lowerNames]
        );

        res.json({ deleted: deleted.rows.length, rows: deleted.rows });

    } catch (err) {
        res.status(500).json(err.message);
    }
});

// 🔥 Hapus semua produk tanpa gambar (yang tidak ada di list nama)
router.post('/delete-no-image', authMiddleware, async(req, res) => {
    try {
        if (!(req.user && (req.user.is_admin || req.user.role === 'admin'))) {
            return res.status(403).json('Forbidden');
        }

        const allowed = ['asbak', 'sapi', 'cangkir', 'piring', 'guci', 'wajan', 'vas'];
        const deleted = await pool.query(
            'DELETE FROM products WHERE lower(name) IS NULL OR NOT lower(name) = ANY($1) RETURNING *', [allowed]
        );

        res.json({ deleted: deleted.rows.length, rows: deleted.rows });

    } catch (err) {
        res.status(500).json(err.message);
    }
});

module.exports = router;