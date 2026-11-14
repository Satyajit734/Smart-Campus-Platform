
const express = require("express");
const router = express.Router();

const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
const authorizeRoles = require("../middleware/authorizeRoles");

// ================ CREATE POST ================

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;

            if (
            typeof title !== "string" ||
            typeof content !== "string" ||
            !title.trim() ||
            !content.trim()
        ) {
            return res.status(400).json({
                message: "Title and content must be valid non-empty strings"
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


 // ================ UPDATE POST ================

router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        // Validate MongoDB ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid post ID"
            });
        }

        if (title === undefined && content === undefined) {
            return res.status(400).json({
                message: "Nothing to update"
            });
        }

        if (
            (title !== undefined &&
                (typeof title !== "string" || !title.trim())) ||
            (content !== undefined &&
                (typeof content !== "string" || !content.trim()))
        ) {
            return res.status(400).json({
                message: "Title and content cannot be empty"
            });
        }

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

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
// ================ LIKE POST ================

router.post("/:id/like", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid post ID"
            });
        }

        const post = await Post.findByIdAndUpdate(
            id,
            {
                $addToSet: { likes: req.user.id }
            },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        res.status(200).json({
            message: "Post liked successfully",
            likeCount: post.likes.length,
            likes: post.likes
        });

    } catch (error) {
        console.error("Like Post Error:", error);

        res.status(500).json({
            message: "Failed to like post"
        });
    }
});  
// ================ UNLIKE POST ================

router.delete("/:id/like", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid post ID"
            });
        }

        const post = await Post.findByIdAndUpdate(
            id,
            {
                $pull: { likes: req.user.id }
            },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        res.status(200).json({
            message: "Post unliked successfully",
            likeCount: post.likes.length,
            likes: post.likes
        });

    } catch (error) {
        console.error("Unlike Post Error:", error);

        res.status(500).json({
            message: "Failed to unlike post"
        });
    }
});
// ================ ADMIN DELETE POST ================

// ================ ADMIN DELETE POST ================

router.delete(
    "/admin/:id",
    authMiddleware,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const { id } = req.params;

            // Validate MongoDB ID
            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({
                    message: "Invalid post ID"
                });
            }

            const post = await Post.findById(id);

            if (!post) {
                return res.status(404).json({
                    message: "Post not found"
                });
            }

            await post.deleteOne();

            res.status(200).json({
                message: "Post deleted successfully by Admin"
            });

        } catch (error) {
            console.error("Admin Delete Error:", error);

            res.status(500).json({
                message: "Failed to delete post"
            });
        }
    }
);

// ================ SEARCH POSTS ================

router.get("/search", async (req, res) => {
    try {
        const { keyword } = req.query;

        // Validate keyword
        if (
            typeof keyword !== "string" ||
            !keyword.trim()
        ) {
            return res.status(400).json({
                message: "A valid search keyword is required"
            });
        }

        const searchKeyword = keyword.trim();

        // Maximum keyword length
        if (searchKeyword.length > 100) {
            return res.status(400).json({
                message: "Search keyword cannot exceed 100 characters"
            });
        }

        // Escape special regex characters
        const escapedKeyword = searchKeyword.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        const posts = await Post.find({
            $or: [
                {
                    title: {
                        $regex: escapedKeyword,
                        $options: "i"
                    }
                },
                {
                    content: {
                        $regex: escapedKeyword,
                        $options: "i"
                    }
                }
            ]
        })
            .populate("author", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Search results fetched successfully",
            totalPosts: posts.length,
            posts
        });

    } catch (error) {
        console.error("Search Posts Error:", error);

        res.status(500).json({
            message: "Failed to search posts"
        });
    }
});


// ================ FILTER POSTS ================

router.get("/filter", async (req, res) => {
    try {
        const { sortBy } = req.query;

        let sortOption = {};

        if (sortBy === "latest") {
            sortOption = { createdAt: -1 };
        } 
        else if (sortBy === "oldest") {
            sortOption = { createdAt: 1 };
        } 
        else if (sortBy === "popular") {
            sortOption = { likes: -1 };
        } 
        else {
            return res.status(400).json({
                message: "Invalid filter option"
            });
        }

        const posts = await Post.find()
            .populate("author", "name email")
            .sort(sortOption);

        res.status(200).json({
            message: "Posts filtered successfully",
            totalPosts: posts.length,
            posts
        });

    } catch (error) {
        console.error("Filter Posts Error:", error);

        res.status(500).json({
            message: "Failed to filter posts"
        });
    }
});



// ================ PAGINATION ================

router.get("/pagination", async (req, res) => {
    try {
        const { page: pageQuery, limit: limitQuery } = req.query;

        // Validate page
        if (
            pageQuery !== undefined &&
            (!/^[1-9]\d*$/.test(pageQuery))
        ) {
            return res.status(400).json({
                message: "Page must be a positive integer"
            });
        }

        // Validate limit
        if (
            limitQuery !== undefined &&
            (!/^[1-9]\d*$/.test(limitQuery))
        ) {
            return res.status(400).json({
                message: "Limit must be a positive integer"
            });
        }

        const page = pageQuery === undefined ? 1 : Number(pageQuery);
        let limit = limitQuery === undefined ? 5 : Number(limitQuery);

        // Maximum 50 posts per page
        limit = Math.min(limit, 50);

        const skip = (page - 1) * limit;

        const totalPosts = await Post.countDocuments();

        const posts = await Post.find()
            .populate("author", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            message: "Posts fetched successfully",
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts,
            postsPerPage: limit,
            posts
        });

    } catch (error) {
        console.error("Pagination Error:", error);

        res.status(500).json({
            message: "Failed to fetch paginated posts"
        });
    }
});


module.exports = router;
