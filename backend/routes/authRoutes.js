
const express = require("express");
const router = express.Router();

const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

// ================= REGISTER =================
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const userExists = await User.findOne({
            email: normalizedEmail
        });

        if (userExists) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Public registration always creates Student
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "student"
        });

        res.status(201).json({
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        res.status(500).json({
            message: "Registration failed"
        });
    }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Login failed"
        });
    }
});

// ================= OWN PROFILE =================
// Student, Faculty and Admin can view own profile
router.get(
    "/profile",
    authMiddleware,
    async (req, res) => {
        try {
            const user = await User.findById(
                req.user.id
            ).select("-password");

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            res.status(200).json({
                message: "Profile fetched successfully",
                user
            });

        } catch (error) {
            res.status(500).json({
                message: "Failed to fetch profile"
            });
        }
    }
);

// ================= STUDENT ACCESS =================
// Student, Faculty and Admin can access
router.get(
    "/student",
    authMiddleware,
    authorizeRoles("student", "faculty", "admin"),
    (req, res) => {
        res.status(200).json({
            message: "Student access granted",
            user: req.user
        });
    }
);

// ================= FACULTY ACCESS =================
// Faculty can access own faculty route
// Admin can also access this route
router.get(
    "/faculty",
    authMiddleware,
    authorizeRoles("faculty", "admin"),
    (req, res) => {
        res.status(200).json({
            message: "Faculty access granted",
            user: req.user
        });
    }
);

// ================= ADMIN ACCESS =================
// Only Admin can access
router.get(
    "/admin",
    authMiddleware,
    authorizeRoles("admin"),
    (req, res) => {
        res.status(200).json({
            message: "Welcome Admin",
            user: req.user
        });
    }
);

// ================= ADMIN: VIEW ALL USERS =================
router.get(
    "/users",
    authMiddleware,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const users = await User.find()
                .select("-password")
                .sort({ createdAt: -1 });

            res.status(200).json({
                message: "Users fetched successfully",
                totalUsers: users.length,
                users
            });

        } catch (error) {
            res.status(500).json({
                message: "Failed to fetch users"
            });
        }
    }
);

// ================= ADMIN: VIEW ALL STUDENTS =================
router.get(
    "/students",
    authMiddleware,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const students = await User.find({
                role: "student"
            })
                .select("-password")
                .sort({ createdAt: -1 });

            res.status(200).json({
                message: "Students fetched successfully",
                totalStudents: students.length,
                students
            });

        } catch (error) {
            res.status(500).json({
                message: "Failed to fetch students"
            });
        }
    }
);

// ================= ADMIN: VIEW ALL FACULTY =================
router.get(
    "/faculties",
    authMiddleware,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const faculties = await User.find({
                role: "faculty"
            })
                .select("-password")
                .sort({ createdAt: -1 });

            res.status(200).json({
                message: "Faculty fetched successfully",
                totalFaculty: faculties.length,
                faculties
            });

        } catch (error) {
            res.status(500).json({
                message: "Failed to fetch faculty"
            });
        }
    }
);


module.exports = router;
