
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    getStudentDashboard
} = require("../controllers/dashboardController");

// Student Dashboard
router.get(
    "/student",
    authMiddleware,
    authorizeRoles("student"),
    getStudentDashboard
);

module.exports = router;
