require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const morgan = require("morgan");
const basicAuth = require("express-basic-auth");

const app = express();
const server = require("http").Server(app);

// const pool = mysql.createPool({
//   connectionLimit: 5,
//   host: process.env.DB_HOST,
//   user: process.env.DB_PORT,
//   database: process.env.DB_USER,
//   port: process.env.DB_PASSWORD,
//   password: process.env.DB_DATABASE,
// });

const pool = mysql.createPool({
  connectionLimit: 5,
  host: "sql7.freesqldatabase.com",
  user: "sql7761490",
  database: "sql7761490",
  port: "3306",
  password: "dTUvSeUg4Y",
});

app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(morgan("dev"));

app.use(
  basicAuth({
    users: { student: "password" },
    challenge: true,
    unauthorizedResponse: "Unauthorized",
  })
);

app.get("/api/salons", async (req, res) => {
  pool.query(
    `SELECT salons.*, working_hours.open_time, working_hours.close_time FROM salons LEFT JOIN working_hours ON salons.id = working_hours.salon_id;`,
    function (err, data) {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      return res.status(200).json(data);
    }
  );
});

app.get("/api/salons/:id", async (req, res) => {
  pool.query(
    `SELECT salons.*, working_hours.open_time, working_hours.close_time 
   FROM salons 
   LEFT JOIN working_hours ON salons.id = working_hours.salon_id 
   WHERE salons.id = ?`,
    [req.params["id"]],
    function (err, data) {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      return res.status(200).json(data);
    }
  );
});

app.get("/api/randomSalons/:count?", async (req, res) => {
  let count = req.params["count"] ?? 1;
  console.log(count);
  pool.query(
    `SELECT salons.*, working_hours.open_time, working_hours.close_time 
		 FROM salons 
		 LEFT JOIN working_hours ON salons.id = working_hours.salon_id 
		 ORDER BY RAND()
		 LIMIT ?`,
    [Number(count)],
    function (err, data) {
      if (err) {
        console.error("Error executing query:", err);
        return res
          .status(500)
          .json({ error: "Database query error", details: err.message });
      }

      if (!Array.isArray(data) || data.length === 0) {
        console.log("No data found");
        return res.status(404).json({ message: "No salons found" });
      }

      console.log("Query result:", data);
      return res.status(200).json(data);
    }
  );
});

app.get("/logout", (req, res) => {
  req.headers.authorization = null;
  console.log(req.headers.authorization);
  res.setHeader("WWW-Authenticate", 'Basic realm="MyApplication"');
  res.status(401).send("Logged out");
});

server.listen(
  process.env.PORT || 8080,
  process.env.IP || "127.0.0.1",
  function () {
    const addr = server.address();
    console.log("Server listening at", addr.address + ":" + addr.port);
  }
);
