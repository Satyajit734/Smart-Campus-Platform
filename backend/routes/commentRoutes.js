const express = require("express");
const router = express.Router();

const Comment = require("../models/Comment");
const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");
router.post("/:postId", authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                message: "Comment cannot be empty"
            });
        }

        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const comment = await Comment.create({
            content: content.trim(),
            author: req.user.id,
            post: req.params.postId
        });

        res.status(201).json({
            message: "Comment added successfully",
            comment
        });

    } catch (error) {
        console.error("Create Comment Error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid post ID"
            });
        }

        res.status(500).json({
            message: "Failed to add comment"
        });
    }
});
// ================ GET COMMENTS ================

router.get("/:postId", async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const comments = await Comment.find({
            post: req.params.postId
        })
        .populate("author", "name email")
        .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Comments fetched successfully",
            totalComments: comments.length,
            comments
        });

    } catch (error) {
        console.error("Get Comments Error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid post ID"
            });
        }

        res.status(500).json({
            message: "Failed to fetch comments"
        });
    }
});
// ================ DELETE COMMENT ================

router.delete("/:commentId", authMiddleware, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        // Check comment owner
        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You are not allowed to delete this comment"
            });
        }

        await Comment.findByIdAndDelete(req.params.commentId);

        res.status(200).json({
            message: "Comment deleted successfully"
        });

    } catch (error) {
        console.error("Delete Comment Error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid comment ID"
            });
        }

        res.status(500).json({
            message: "Failed to delete comment"
        });
    }
});
// ================ UPDATE COMMENT ================

router.put("/:commentId", authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                message: "Comment cannot be empty"
            });
        }

        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        // Check comment owner
        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You are not allowed to update this comment"
            });
        }

        comment.content = content.trim();

        await comment.save();

        res.status(200).json({
            message: "Comment updated successfully",
            comment
        });

    } catch (error) {
        console.error("Update Comment Error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid comment ID"
            });
        }

        res.status(500).json({
            message: "Failed to update comment"
        });
    }
});

module.exports = router;