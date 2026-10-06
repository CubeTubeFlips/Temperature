const mysql = require("mysql2/promise");

let connectionPromise;

async function getConnection() {
    if (!connectionPromise) {
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

        connectionPromise = mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE
        });
    }

    try {
        return await connectionPromise;
    } catch (error) {
        connectionPromise = undefined;
        throw error;
    }
}

async function query(sql, parameters = []) {
    const connection = await getConnection();
    const [results] = await connection.execute(sql, parameters);
    return results;
}

module.exports = { query };
