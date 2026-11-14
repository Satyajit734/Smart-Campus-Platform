
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

// ================= STUDENT DASHBOARD =================

const getStudentDashboard = async (req, res) => {
    try {
        const studentId = req.user.id;

        // Fetch student profile
        const student = await User.findById(studentId)
            .select("-password");

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Count total posts
        const totalPosts = await Post.countDocuments({
            author: studentId
        });

        // Count total comments
        const totalComments = await Comment.countDocuments({
            author: studentId
        });

        // Calculate total likes
        const studentPosts = await Post.find({
            author: studentId
        }).select("likes");

        const totalLikes = studentPosts.reduce(
            (total, post) => total + post.likes.length,
            0
        );

        // Fetch recent 5 posts
        const recentPosts = await Post.find({
            author: studentId
        })
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            message: "Student dashboard fetched successfully",
            dashboard: {
                profile: student,
                totalPosts,
                totalComments,
                totalLikes,
                recentPosts
            }
        });

    } catch (error) {
        console.error("Student Dashboard Error:", error);

        res.status(500).json({
            message: "Failed to fetch student dashboard"
        });
    }
};

//faculty dashboard//
const getFacultyDashboard = async (req, res) => {
    try {
        const facultyId = req.user.id;

        const faculty = await User.findById(facultyId)
            .select("-password");

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty not found"
            });
        }

        const totalPosts = await Post.countDocuments({
            author: facultyId
        });

        const totalComments = await Comment.countDocuments({
            author: facultyId
        });

        const facultyPosts = await Post.find({
            author: facultyId
        }).select("likes");

        const totalLikes = facultyPosts.reduce(
            (total, post) => total + post.likes.length,
            0
        );

        const recentPosts = await Post.find({
            author: facultyId
        })
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            message: "Faculty dashboard fetched successfully",
            dashboard: {
                profile: faculty,
                totalPosts,
                totalComments,
                totalLikes,
                recentPosts
            }
        });

    } catch (error) {
        console.error("Faculty Dashboard Error:", error);

        res.status(500).json({
            message: "Failed to fetch faculty dashboard"
        });
    }
};


// ================= ADMIN DASHBOARD =================

const getAdminDashboard = async (req, res) => {
    try {
        // Count total users
        const totalUsers = await User.countDocuments({});

        // Count students and faculty
        const totalStudents = await User.countDocuments({
            role: "student"
        });

        const totalFaculty = await User.countDocuments({
            role: "faculty"
        });

        // Count posts and comments
        const totalPosts = await Post.countDocuments({});
        const totalComments = await Comment.countDocuments({});

        // Fetch recent 5 users
        const recentUsers = await User.find({})
            .select("-password")
            .sort({ createdAt: -1 })
            .limit(5);

        // Fetch recent 5 posts
        const recentPosts = await Post.find({})
            .populate("author", "name role")
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            message: "Admin dashboard fetched successfully",
            dashboard: {
                totalUsers,
                totalStudents,
                totalFaculty,
                totalPosts,
                totalComments,
                recentUsers,
                recentPosts
            }
        });

    } catch (error) {
        console.error("Admin Dashboard Error:", error);

        res.status(500).json({
            message: "Failed to fetch admin dashboard"
        });
    }
};


module.exports = {
    getStudentDashboard,
    getAdminDashboard,
    getFacultyDashboard
};
