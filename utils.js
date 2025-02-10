const urlencodedParser = express.urlencoded({ extended: false });
const fs = require("fs").promises;

const names = require("./src/data/names");
const phones = require("./src/data/phones");
const addresses = require("./src/data/addresses");
const urls = require("./src/data/urls");

function convertTime(timeString) {
  const [openTime, closeTime] = timeString.split("–").map((t) => t.trim());
  return {
    openTime: openTime + ":00", // Добавляем секунды для формата TIME
    closeTime: closeTime + ":00",
  };
}

async function insert() {
  const data = await fs.readFile("times.txt", "utf8");
  const timeLines = data.trim().split("\n");

  for (let i = 0; i < names.length; i++) {
    pool.query(
      "INSERT INTO salons (id, name, address, phone, image_url) VALUES(?, ?, ?, ?, ?)",
      [0, names[i], addresses[i], phones[i], urls[i]]
    );
  }

  for (let i = 0; i < names.length; i++) {
    const { openTime, closeTime } = convertTime(timeLines[i]);
    const salonId = i + 1;
    pool.query(
      "INSERT INTO working_hours (salon_id, open_time, close_time) VALUES (?, ?, ?)",
      [salonId, openTime, closeTime]
    );
  }
}
