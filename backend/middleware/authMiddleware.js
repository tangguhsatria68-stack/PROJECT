const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

    const authHeader = req.header("Authorization");

    if (!authHeader) return res.status(401).json("Tidak ada token");

    // Dukungan untuk format "Bearer <token>" atau token langsung
    const parts = authHeader.split(' ');
    const token = parts.length === 2 && parts[0].toLowerCase() === 'bearer' ? parts[1] : authHeader;

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json("Token tidak valid");
    }

};