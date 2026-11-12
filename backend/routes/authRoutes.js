
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


// ================= ADMIN: REGISTER FACULTY =================

router.post(
    "/admin/register-faculty",
    authMiddleware,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const {
                name,
                email,
                password,
                department,
                facultyId,
                designation
            } = req.body;

            // Validate required fields
            if (
                !name ||
                !email ||
                !password ||
                !department ||
                !facultyId ||
                !designation
            ) {
                return res.status(400).json({
                    message: "All fields are required"
                });
            }

            if (password.length < 8) {
                return res.status(400).json({
                    message: "Password must be at least 8 characters"
                });
            }

            const normalizedEmail = email.trim().toLowerCase();

            // Check existing email
            const existingUser = await User.findOne({
                email: normalizedEmail
            });

            if (existingUser) {
                return res.status(400).json({
                    message: "Email already registered"
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create Faculty
            const faculty = await User.create({
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                role: "faculty",
                department: department.trim(),
                facultyId: facultyId.trim(),
                designation: designation.trim()
            });

            res.status(201).json({
                message: "Faculty registered successfully",
                faculty: {
                    id: faculty._id,
                    name: faculty.name,
                    email: faculty.email,
                    role: faculty.role,
                    department: faculty.department,
                    facultyId: faculty.facultyId,
                    designation: faculty.designation
                }
            });

        } catch (error) {
            console.error("Faculty Registration Error:", error);

            res.status(500).json({
                message: "Faculty registration failed"
            });
        }
    }
);


// ================= LOGIN =================
router.post("/login", async (req, res) => {
    try {
        console.log("LOGIN BODY:", req.body);
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
        // Check if account is active
        if (user.isActive === false) {
            return res.status(403).json({
                message: "Your account is inactive. Please contact admin."
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
// ================ ADMIN DELETE USER ================
router.delete(
    "/users/:id",
    authMiddleware,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const { id } = req.params;

            // Validate MongoDB ID
            if (!/^[0-9a-fA-F]{24}$/.test(id)) {
                return res.status(400).json({
                    message: "Invalid user ID"
                });
            }

            const user = await User.findById(id);

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            // Admin cannot delete their own account
            if (user._id.toString() === req.user.id) {
                return res.status(403).json({
                    message: "You cannot delete your own account"
                });
            }

            // Protect the last admin account
            if (user.role === "admin") {
                const adminCount = await User.countDocuments({
                    role: "admin"
                });

                if (adminCount <= 1) {
                    return res.status(403).json({
                        message: "Cannot delete the last admin"
                    });
                }
            }

            await User.findByIdAndDelete(id);

            res.status(200).json({
                message: "User deleted successfully",
                deletedUser: {
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            console.error("Delete User Error:", error);

            res.status(500).json({
                message: "Failed to delete user"
            });
        }
    }
);


// ================ ADMIN UPDATE USER DETAILS ================

router.put(
    "/users/:id/details",
    authMiddleware,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const { id } = req.params;

            // Validate MongoDB ID
            if (!/^[0-9a-fA-F]{24}$/.test(id)) {
                return res.status(400).json({
                    message: "Invalid user ID"
                });
            }

            const user = await User.findById(id);

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            // Validate isActive field
            if (
                req.body.isActive !== undefined &&
                typeof req.body.isActive !== "boolean"
            ) {
                return res.status(400).json({
                    message: "isActive must be true or false"
                });
            }

            // Protect the last active admin
            if (user.role === "admin" && req.body.isActive === false) {
                const activeAdminCount = await User.countDocuments({
                    role: "admin",
                    isActive: true
                });

                if (activeAdminCount <= 1) {
                    return res.status(403).json({
                        message: "Cannot deactivate the last active admin"
                    });
                }
            }

            // Fields allowed for each role
            const allowedFields = {
                student: [
                    "name",
                    "department",
                    "studentId",
                    "course",
                    "semester",
                    "profilePicture",
                    "isActive"
                ],
                faculty: [
                    "name",
                    "department",
                    "facultyId",
                    "designation",
                    "profilePicture",
                    "isActive"
                ],
                admin: [
                    "name",
                    "designation",
                    "profilePicture",
                    "isActive"
                ]
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
                    message: "No valid fields provided"
                });
            }

            await user.save();

            const updatedUser = await User.findById(id)
                .select("-password");

            res.status(200).json({
                message: "User details updated successfully",
                user: updatedUser
            });

        } catch (error) {
            console.error("Admin Update User Error:", error);

            res.status(500).json({
                message: "Failed to update user details"
            });
        }
    }
);


 // ============== FACULTY: VIEW OWN DEPARTMENT STUDENTS ==============

router.get(
    "/faculty/students",
    authMiddleware,
    authorizeRoles("faculty"),
    async (req, res) => {
        try {
            // Find logged-in faculty
            const faculty = await User.findById(req.user.id);

            if (!faculty) {
                return res.status(404).json({
                    message: "Faculty not found"
                });
            }

            // Find students from the same department
            const students = await User.find({
                role: "student",
                department: faculty.department
            })
                .select("-password")
                .sort({ createdAt: -1 });

            res.status(200).json({
                message: "Department students fetched successfully",
                department: faculty.department,
                totalStudents: students.length,
                students
            });

        } catch (error) {
            console.error("Faculty Students Error:", error);

            res.status(500).json({
                message: "Failed to fetch department students"
            });
        }
    }
);

module.exports = router;
