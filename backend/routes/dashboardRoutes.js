
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    getStudentDashboard,
    getAdminDashboard,
    getFacultyDashboard
} = require("../controllers/dashboardController");

// Student Dashboard
router.get(
    "/student",
    authMiddleware,
    authorizeRoles("student"),
    getStudentDashboard
);
// Faculty Dashboard
router.get(
    "/faculty",
    authMiddleware,
    authorizeRoles("faculty"),
    getFacultyDashboard
);

// Admin Dashboard
router.get(
    "/admin",
    authMiddleware,
    authorizeRoles("admin"),
    getAdminDashboard
);

module.exports = router;
