import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.error("Error executing query", err.stack);
    } else {
        console.log("Database connection successful:", res.rows);
    }
});
