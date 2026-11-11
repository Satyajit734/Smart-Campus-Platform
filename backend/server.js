
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./configuration/db");
const authRoutes = require("./routes/authRoutes");
const postRoutes =require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

dotenv.config();

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Welcome to Campus Connect");
});

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log("Server is Running");
    });
};

startServer();
