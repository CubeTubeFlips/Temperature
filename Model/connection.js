const mysql = require("mysql2/promise");

const requiredSettings = [
    "MYSQL_HOST",
    "MYSQL_USER",
    "MYSQL_PASSWORD",
    "MYSQL_DATABASE"
];
const missingSettings = requiredSettings.filter((setting) => !process.env[setting]);

if (missingSettings.length > 0) {
    throw new Error(
        `Missing required database configuration: ${missingSettings.join(", ")}`
    );
}

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10
});

async function query(sql, parameters = []) {
    const [results] = await pool.execute(sql, parameters);
    return results;
}

module.exports = { query };
