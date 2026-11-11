const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access denied. Token required"
            });
        }

        const token = authHeader.split(" ")[1];

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        // Get current user from database
        const user = await User.findById(decoded.id)
            .select("_id role isActive");

        if (!user) {
            return res.status(401).json({
                message: "User not found. Please login again"
            });
        }

        // Check account status
        if (!user.isActive) {
            return res.status(403).json({
                message: "Your account is inactive"
            });
        }

        // Use current database role
        req.user = {
            id: user._id.toString(),
            role: user.role
        };

        next();

    } catch (error) {
        console.error("Authentication Error:", error);

        return res.status(500).json({
            message: "Server error during authentication"
        });
    }
};

module.exports = authMiddleware;