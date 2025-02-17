require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const basicAuth = require("express-basic-auth");
const apiRoutes = require("./src/routes");

const mysql = require("mysql2/promise");
const MyDatabase = require("./src/database/Database");

const database = new MyDatabase(mysql);

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  basicAuth({
    users: { [process.env.BASIC_AUTH_LOGIN]: process.env.BASIC_AUTH_PASSWORD },
    challenge: true,
    unauthorizedResponse: "Unauthorized",
  })
);

app.use((req, res, next) => {
  req.database = database; // Добавляем database в объект req
  next();
});

app.use("/api/salons", apiRoutes);

app.get("/logout", (req, res) => {
  res.status(401).json({ message: "Successfully logout" });
});

app.get("*", (req, res) => {
  res.sendStatus("404");
});

// amvera: port = 8080 host ="0.0.0.0"
const port = process.env.PORT || 8080;
app.listen(port, process.env.HOST || "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});
