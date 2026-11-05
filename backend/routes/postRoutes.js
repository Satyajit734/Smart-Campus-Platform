
const express = require("express");
const router = express.Router();

const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");

// ================ CREATE POST ================

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: "Title and content are required"
            });
        }

        const post = await Post.create({
            title: title.trim(),
            content: content.trim(),
            author: req.user.id
        });

        res.status(201).json({
            message: "Post created successfully",
            post
        });

    } catch (error) {
        console.error("Create Post Error:", error);

        res.status(500).json({
            message: "Failed to create post"
        });
    }
});


// ================ GET ALL POSTS ================

router.get("/", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Posts fetched successfully",
            totalPosts: posts.length,
            posts
        });

    } catch (error) {
        console.error("Get Posts Error:", error);

        res.status(500).json({
            message: "Failed to fetch posts"
        });
    }
});


// ================ UPDATE POST ================

router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;

        if (title === undefined && content === undefined) {
            return res.status(400).json({
                message: "Nothing to update"
            });
        }

        if (
            (title !== undefined && (typeof title !== "string" || !title.trim())) ||
            (content !== undefined && (typeof content !== "string" || !content.trim()))
        ) {
            return res.status(400).json({
                message: "Title and content cannot be empty"
            });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        // Check post ownership
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You cannot update this post"
            });
        }

        if (title !== undefined) {
            post.title = title.trim();
        }

        if (content !== undefined) {
            post.content = content.trim();
        }

        await post.save();

        res.status(200).json({
            message: "Post updated successfully",
            post
        });

    } catch (error) {
        console.error("Update Post Error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid post ID"
            });
        }

        res.status(500).json({
            message: "Failed to update post"
        });
    }
});
// ================ DELETE POST ================

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You cannot delete this post"
            });
        }

        await post.deleteOne();

        res.status(200).json({
            message: "Post deleted successfully"
        });

    } catch (error) {
        console.error("Delete Post Error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid post ID"
            });
        }

        res.status(500).json({
            message: "Failed to delete post"
        });
    }
});




module.exports = router;
