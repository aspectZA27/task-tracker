import "dotenv/config";
import express from "express";

const app = express();
const port = 3001;

app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
