
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

module.exports = {
    getStudentDashboard
};
