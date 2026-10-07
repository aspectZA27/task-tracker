import bcrypt from "bcrypt";
import cors from "cors";
import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import { Pool } from "pg";

const app = express();
const port = 3001;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    if (!password) {
        return res.status(400).json({ error: "Password is required" });
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const result = await pool.query("INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id", [
            email,
            hashedPassword,
        ]);
        const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(201).json({
            message: "User signed up successfully",
            email: email,
            id: result.rows[0].id,
            token: token,
        });
    } catch (error) {
        console.error("Error hashing password:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Token is required" });
    } else {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            console.error("Error verifying token:", error);
            res.status(403).json({ error: "Invalid token" });
        }
    }
}

app.post("/tasks", authenticateToken, async (req, res) => {
    const { title } = req.body;
    const userId = req.user.userId;

    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    try {
        const result = await pool.query("INSERT INTO tasks (user_id, title) VALUES ($1, $2) RETURNING *", [
            userId,
            title,
        ]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/tasks", authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const result = await pool.query("SELECT * FROM tasks WHERE user_id = $1", [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.patch("/tasks/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    const userId = req.user.userId;

    if (completed === undefined) {
        return res.status(400).json({ error: "Completed status is required" });
    }

    try {
        const result = await pool.query("UPDATE tasks SET completed = $1 WHERE id = $2 AND user_id = $3 RETURNING *", [
            completed,
            id,
            userId,
        ]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.delete("/tasks/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const result = await pool.query("DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *", [id, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
