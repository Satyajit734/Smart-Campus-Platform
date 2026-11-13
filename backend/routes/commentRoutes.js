
const express = require("express");
const router = express.Router();

const Comment = require("../models/Comment");
const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

// ================ CREATE COMMENT ================

router.post("/:postId", authMiddleware, async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;

        if (!mongoose.isValidObjectId(postId)) {
            return res.status(400).json({
                message: "Invalid post ID"
            });
        }

        if (
            typeof content !== "string" ||
            !content.trim()
        ) {
            return res.status(400).json({
                message: "Comment must be a valid non-empty string"
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const comment = await Comment.create({
            content: content.trim(),
            author: req.user.id,
            post: postId
        });

        res.status(201).json({
            message: "Comment added successfully",
            comment
        });

    } catch (error) {
        console.error("Create Comment Error:", error);

        res.status(500).json({
            message: "Failed to add comment"
        });
    }
});

// ================ GET COMMENTS ================

router.get("/:postId", async (req, res) => {
    try {
        const { postId } = req.params;

        if (!mongoose.isValidObjectId(postId)) {
            return res.status(400).json({
                message: "Invalid post ID"
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const comments = await Comment.find({
            post: postId
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

        res.status(500).json({
            message: "Failed to fetch comments"
        });
    }
});

// ================ DELETE COMMENT ================

router.delete("/:commentId", authMiddleware, async (req, res) => {
    try {
        const { commentId } = req.params;

        if (!mongoose.isValidObjectId(commentId)) {
            return res.status(400).json({
                message: "Invalid comment ID"
            });
        }

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You are not allowed to delete this comment"
            });
        }

        await comment.deleteOne();

        res.status(200).json({
            message: "Comment deleted successfully"
        });

    } catch (error) {
        console.error("Delete Comment Error:", error);

        res.status(500).json({
            message: "Failed to delete comment"
        });
    }
});

// ================ UPDATE COMMENT ================

router.put("/:commentId", authMiddleware, async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;

        if (!mongoose.isValidObjectId(commentId)) {
            return res.status(400).json({
                message: "Invalid comment ID"
            });
        }

        if (
            typeof content !== "string" ||
            !content.trim()
        ) {
            return res.status(400).json({
                message: "Comment must be a valid non-empty string"
            });
        }

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

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

        res.status(500).json({
            message: "Failed to update comment"
        });
    }
});

module.exports = router;
