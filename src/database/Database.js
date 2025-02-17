require("dotenv").config();
const fs = require("fs").promises;
const path = require("path");

module.exports = class MyDatabase {
  constructor(mysql) {
    this.pool = mysql.createPool({
      connectionLimit: 5,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    this.queryParts = {
      select: "*",
      from: "",
      where: "",
      join: "",
      rightJoin: "",
      leftJoin: "",
      orderBy: "",
      limit: "",
      values: [],
      columns: [],
    };
  }

  connect() {
    return this.pool;
  }

  convertTime(timeString) {
    const [openTime, closeTime] = timeString.split("–").map((t) => t.trim());
    return {
      openTime: openTime + ":00", // Добавляем секунды для формата TIME
      closeTime: closeTime + ":00",
    };
  }

  async seed() {
    const connection = await this.pool.getConnection();

    try {
      const names = require(path.resolve(__dirname, "../data/names"));
      const phones = require(path.resolve(__dirname, "../data/phones"));
      const addresses = require(path.resolve(__dirname, "../data/addresses"));
      const urls = require(path.resolve(__dirname, "../data/urls"));
      const data = await fs.readFile(
        path.resolve(__dirname, "../data/times.txt"),
        "utf8"
      );
      const timeLines = data.trim().split("\n");

      await connection.beginTransaction();

      const salonValues = names.map((name, i) => [
        i + 1, // ID
        name,
        addresses[i],
        phones[i],
        urls[i],
      ]);

      await this.insert("salons")
        .columns(["id", "name", "address", "phone", "image_url"])
        .values(salonValues);

      const timeValues = timeLines.map((time, i) => {
        const { openTime, closeTime } = this.convertTime(time);
        return [
          i + 1, // ID
          i + 1, // salonID
          openTime,
          closeTime,
        ];
      });

      await this.insert("working_hours")
        .columns(["id", "salon_id", "open_time", "close_time"])
        .values(timeValues);

      await connection.commit();
      console.log("Seeding completed successfully.");
    } catch (error) {
      console.error("Error during seeding:", error);
      await connection.rollback();
    } finally {
      connection.release();
    }
  }

  // Добавляем методы для columns и values
  columns(columns) {
    this.queryParts.columns = columns;
    return this;
  }

  values(values) {
    this.queryParts.values = values;
    return this;
  }

  // Универсальный метод INSERT
  insert(table) {
    this.queryParts.table = table;
    return this;
  }

  // SELECT
  select(columns = "*") {
    this.queryParts.select = columns;
    return this;
  }

  // FROM
  from(table) {
    this.queryParts.from = table;
    return this;
  }

  // WHERE
  where(condition, values = []) {
    this.queryParts.where = `WHERE ${condition}`;
    this.queryParts.values = [...this.queryParts.values, ...values];
    return this;
  }

  // LEFT JOIN
  leftJoin(table, condition) {
    this.queryParts.leftJoin = `LEFT JOIN ${table} ON ${condition}`;
    return this;
  }

  // RIGHT JOIN
  rightJoin(table, condition) {
    this.queryParts.rightJoin = `RIGHT JOIN ${table} ON ${condition}`;
    return this;
  }

  // JOIN
  join(table, condition) {
    this.queryParts.join = `JOIN ${table} ON ${condition}`;
    return this;
  }

  // ORDER BY
  orderBy(columns) {
    this.queryParts.orderBy = `ORDER BY ${columns}`;
    return this;
  }

  // LIMIT
  limit(count) {
    this.queryParts.limit = `LIMIT ${count}`;
    return this;
  }

  // Генерация итогового запроса для SELECT
  buildSelectQuery() {
    let query = `SELECT ${this.queryParts.select} FROM ${this.queryParts.from}`;

    if (this.queryParts.leftJoin) query += ` ${this.queryParts.leftJoin}`;
    if (this.queryParts.rightJoin) query += ` ${this.queryParts.rightJoin}`;
    if (this.queryParts.join) query += ` ${this.queryParts.join}`;
    if (this.queryParts.where) query += ` ${this.queryParts.where}`;
    if (this.queryParts.orderBy) query += ` ${this.queryParts.orderBy}`;
    if (this.queryParts.limit) query += ` ${this.queryParts.limit}`;

    return query;
  }

  // Генерация итогового запроса для INSERT
  buildInsertQuery() {
    const columns = this.queryParts.columns.join(", ");
    const placeholders = this.queryParts.values
      .map((row) => `(${row.map(() => "?").join(", ")})`)
      .join(", ");
    return `INSERT INTO ${this.queryParts.table} (${columns}) VALUES ${placeholders}`;
  }

  // Выполнение запроса
  async execute() {
    try {
      const connection = await this.pool.getConnection();

      let query;
      let values;

      if (this.queryParts.table) {
        // вставка данных
        query = this.buildInsertQuery();
        values = this.queryParts.values.flat();
      } else {
        // SELECT запрос
        query = this.buildSelectQuery();
        values = this.queryParts.values;
      }

      console.log("Executing query:", query);

      const [rows] = await connection.execute(query, values);
      connection.release();

      return rows;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  }

  async close() {
    try {
      await this.pool.end();
      console.log("Database connection closed.");
    } catch (error) {
      console.error("Error closing connection:", error);
    }
  }
};
