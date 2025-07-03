// server.js (ESM version)
import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/github", async (req, res) => {
    const githubApiPath = req.url; // Just the path part (e.g., /users/lpJei)
    const githubApiUrl = `https://api.github.com${githubApiPath}`;
    
    try {
        const response = await fetch(githubApiUrl, {
        headers: {
            Accept: "application/vnd.github.v3+json",
            Authorization: `token ${GITHUB_TOKEN}`,
        },
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error("GitHub API proxy error:", error);
        res.status(500).json({ error: "Proxy failed" });
    }
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
