
const express = require("express");
const router = express.Router();

const Event = require("../models/Event");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const mongoose = require("mongoose");

// CREATE EVENT
// Only Admin and Faculty can create events.

router.post(
    "/",
    authMiddleware,
    authorizeRoles("admin", "faculty"),
    async (req, res) => {
        try {
            const { title, description, date, time, venue } = req.body;

            if (
                typeof title !== "string" ||
                typeof description !== "string" ||
                typeof date !== "string" ||
                typeof time !== "string" ||
                typeof venue !== "string" ||
                !title.trim() ||
                !description.trim() ||
                !date.trim() ||
                !time.trim() ||
                !venue.trim()
            ) {
                return res.status(400).json({
                    message: "All event fields are required"
                });
            }

            const eventDate = new Date(date);

            if (Number.isNaN(eventDate.getTime())) {
                return res.status(400).json({
                    message: "Invalid event date"
                });
            }

            const event = await Event.create({
                title: title.trim(),
                description: description.trim(),
                date: eventDate,
                time: time.trim(),
                venue: venue.trim(),
                createdBy: req.user.id,
                creatorRole: req.user.role
            });

            res.status(201).json({
                message: "Event created successfully",
                event
            });

        } catch (error) {
            console.error("Create Event Error:", error);

            res.status(500).json({
                message: "Failed to create event"
            });
        }
    }
);


// GET ALL EVENTS
// Admin, Faculty and Students can view events.

router.get("/", authMiddleware, async (req, res) => {
    try {
        const events = await Event.find()
            .populate("createdBy", "name email")
            .sort({ date: 1 });

        res.status(200).json({
            message: "Events fetched successfully",
            totalEvents: events.length,
            events
        });

    } catch (error) {
        console.error("Get Events Error:", error);

        res.status(500).json({
            message: "Failed to fetch events"
        });
    }
});


// UPDATE EVENT
// Admin can update any event.
// Faculty can update only their own events.

router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, date, time, venue } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }

        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        if (
            req.user.role !== "admin" &&
            event.createdBy.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message: "You cannot update this event"
            });
        }

        const updates = { title, description, date, time, venue };

        for (const [field, value] of Object.entries(updates)) {
            if (value !== undefined) {
                if (typeof value !== "string" || !value.trim()) {
                    return res.status(400).json({
                        message: `${field} must be a valid non-empty string`
                    });
                }

                if (field === "date") {
                    const eventDate = new Date(value);

                    if (Number.isNaN(eventDate.getTime())) {
                        return res.status(400).json({
                            message: "Invalid event date"
                        });
                    }

                    event.date = eventDate;
                } else {
                    event[field] = value.trim();
                }
            }
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                message: "Nothing to update"
            });
        }

        await event.save();

        res.status(200).json({
            message: "Event updated successfully",
            event
        });

    } catch (error) {
        console.error("Update Event Error:", error);

        res.status(500).json({
            message: "Failed to update event"
        });
    }
});


// DELETE EVENT
// Admin can delete any event.
// Faculty can delete only their own events.

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }

        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        if (
            req.user.role !== "admin" &&
            event.createdBy.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message: "You cannot delete this event"
            });
        }

        await event.deleteOne();

        res.status(200).json({
            message: "Event deleted successfully"
        });

    } catch (error) {
        console.error("Delete Event Error:", error);

        res.status(500).json({
            message: "Failed to delete event"
        });
    }
});


module.exports = router;
