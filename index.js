let express = require("express");
const path = require("path");
const { query } = require("./Model/connection");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/sensor", async (req, res) => {
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

[3000, 8080].forEach((port) => {
    app.listen(port, "0.0.0.0", () => {
        console.log(`Server running on port ${port}`);
    });
});
