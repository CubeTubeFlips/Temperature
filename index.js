let express = require("express");
const mysql = require("mysql2/promise");

const app = express();

const port = 8080

app.use(express.json());

let connection = null;

async function getConnection() {
if (connection === null) {
connection = await mysql.createConnection({
host: "student-databases.cvode4s4cwrc.us-west-2.rds.amazonaws.com",
user: "LIAMGABBARD",
password: "SEzH7tURMHzyliOyLJiId8U2MJ7QyjuarOC",
database: "temperature"
});
}

return connection;


}

// Arduino sends temperature here
app.post("/api/sensor", async (req, res) => {
console.log(req.body);

try {
    const temperature = req.body.temperature;

    if (temperature === undefined) {
        return res.status(400).json({
            message: "Temperature is required"
        });
    }

    const db = await getConnection();

    await db.execute(
        "INSERT INTO temperature (temperature) VALUES (?)",
        [temperature]
    );

    res.json({
        message: "Sensor data received"
    });

} catch (error) {
    console.error(error);

    res.status(500).json({
        message: "Database error"
    });
}


});

// Get all temperature readings
app.get("/api/temperature", async (req, res) => {
try {
const db = await getConnection();

    const [rows] = await db.execute(
        "SELECT id, temperature FROM temperature ORDER BY id ASC"
    );

    res.json(rows);

} catch (error) {
    console.error(error);

    res.status(500).json({
        message: "Database error"
    });
}


});

app.listen(port, '0.0.0.0.0/0', () => {
    console.log(`Application listening at http://localhost:${port}`);
})