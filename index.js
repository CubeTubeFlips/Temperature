require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const express = require("express");
const { query } = require("./Model/connection");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", async (req, res) => {
    try {
        const readings = await query(
            "SELECT id, temperature FROM temperature ORDER BY id DESC"
        );
        const rows = readings.map(({ id, temperature }) =>
            `<tr><td>${escapeHtml(id)}</td><td>${escapeHtml(temperature)}</td></tr>`
        ).join("");

        res.type("html").send(
            `<h1>Temperature readings</h1><table><tr><th>ID</th><th>Temperature (&deg;F)</th></tr>${rows || "<tr><td colspan=\"2\">No readings yet</td></tr>"}</table>`
        );
    } catch (error) {
        console.error("Unable to display temperature readings:", error);
        res.status(500).type("text").send("Unable to load temperature readings.");
    }
});

app.post(["/api/sensor", "/temperature/"], async (req, res) => {
    const { temperature } = req.body;

    if (typeof temperature !== "number" || !Number.isFinite(temperature)) {
        return res.status(400).json({
            message: "A numeric temperature is required"
        });
    }

    try {
        await query(
            "INSERT INTO temperature (temperature) VALUES (?)",
            [temperature]
        );

        res.json({
            message: "Sensor data received"
        });
    } catch (error) {
        console.error("Unable to save temperature reading:", error);
        res.status(500).json({
            message: "Database error"
        });
    }
});

app.get("/api/temperature", async (req, res) => {
    try {
        const readings = await query(
            "SELECT id, temperature FROM temperature ORDER BY id ASC"
        );
        res.json(readings);
    } catch (error) {
        console.error("Unable to load temperature readings:", error);
        res.status(500).json({
            message: "Database error"
        });
    }
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
});

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };
        return entities[character];
    });
}
