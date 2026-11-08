
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
// ================= ADMIN REGISTER =================

router.post("/admin/register", async (req, res) => {
    try {
        const { name, email, password, secretKey } = req.body;

        if (!name || !email || !password || !secretKey) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (secretKey !== process.env.ADMIN_SECRET_KEY) {
            return res.status(403).json({
                message: "Invalid admin secret key"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "admin"
        });

        res.status(201).json({
            message: "Admin registered successfully",
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        console.error("Admin Register Error:", error);

        res.status(500).json({
            message: "Admin registration failed"
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

// ================= ROLE-BASED PROFILE =================

const getRoleProfile = (role) => async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.user.id,
            role: role
        }).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        res.status(200).json({
            message: `${role} profile fetched successfully`,
            user
        });

    } catch (error) {
        console.error("Profile Error:", error);

        res.status(500).json({
            message: "Failed to fetch profile"
        });
    }
};

// ================= STUDENT PROFILE =================

router.get(
    "/student/profile",
    authMiddleware,
    authorizeRoles("student"),
    getRoleProfile("student")
);

// ================= FACULTY PROFILE =================

router.get(
    "/faculty/profile",
    authMiddleware,
    authorizeRoles("faculty"),
    getRoleProfile("faculty")
);

// ================= ADMIN PROFILE =================

router.get(
    "/admin/profile",
    authMiddleware,
    authorizeRoles("admin"),
    getRoleProfile("admin")
);
// ================= UPDATE PROFILE =================

router.put("/update-profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Fields allowed for each role
        const allowedFields = {
            student: ["name", "department", "profilePicture"],
            faculty: ["name", "department", "designation", "profilePicture"],
            admin: ["name", "designation", "profilePicture"]
        };

        const fields = allowedFields[user.role] || [];

        let updated = false;

        fields.forEach((field) => {
            if (req.body[field] !== undefined) {
                user[field] = req.body[field];
                updated = true;
            }
        });

        if (!updated) {
            return res.status(400).json({
                message: "No valid profile fields provided"
            });
        }

        await user.save();

        const updatedUser = await User.findById(user._id)
            .select("-password");

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update Profile Error:", error);

        res.status(500).json({
            message: "Failed to update profile"
        });
    }
});

// ================= ADMIN UPDATE USER ROLE =================

router.put(
    "/users/:id/role",
    authMiddleware,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const { role } = req.body;
            const validRoles = ["student", "faculty", "admin"];

            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    message: "Invalid role"
                });
            }

            const user = await User.findByIdAndUpdate(
                req.params.id,
                { role },
                { new: true, runValidators: true }
            ).select("-password");

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            res.status(200).json({
                message: "User role updated successfully",
                user
            });

        } catch (error) {
            console.error("Update Role Error:", error);

            res.status(500).json({
                message: "Failed to update user role"
            });
        }
    }
);

module.exports = router;
