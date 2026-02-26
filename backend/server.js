const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();


// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());


// ===== ROUTES =====

// Auth (Login & Register)
app.use("/api/auth", authRoutes);

// Products
app.use("/api/products", productRoutes);


// ===== TEST PROTECTED ROUTE =====
app.get("/api/dashboard", authMiddleware, (req, res) => {
    res.json({
        message: "Selamat datang di Dashboard",
        user: req.user
    });
});


// ===== SERVER START =====
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});