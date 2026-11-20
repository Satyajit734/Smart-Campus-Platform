
const express = require("express");
const mongoose = require("mongoose");
const Resource = require("../models/Resource");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();

// GET ALL RESOURCES
router.get("/", authMiddleware, async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate("uploadedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      totalResources: resources.length,
      resources
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPLOAD RESOURCE
router.post(
  "/",
  authMiddleware,
  authorizeRoles("faculty", "admin"),
  async (req, res) => {
    try {
      const { title, description, category, subject, fileUrl, fileName } = req.body;

      if (!title || !category || !subject || !fileUrl || !fileName) {
        return res.status(400).json({
          message: "Please provide all required fields"
        });
      }

      const resource = await Resource.create({
        title,
        description,
        category,
        subject,
        fileUrl,
        fileName,
        uploadedBy: req.user.id
      });

      res.status(201).json({
        message: "Resource uploaded successfully",
        resource
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// DELETE RESOURCE
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid resource ID" });
    }

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const isOwner = resource.uploadedBy.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You are not allowed to delete this resource"
      });
    }

    await resource.deleteOne();

    res.status(200).json({
      message: "Resource deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
