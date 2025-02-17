const router = require("express").Router();

router.get("/seed", async (req, res) => {
  await req.database.seed();
  return res.status(200);
});

router.get("/", async (req, res) => {
  const salons = await req.database
    .select("salons.*, working_hours.open_time, working_hours.close_time")
    .from("salons")
    .leftJoin("working_hours", "salons.id = working_hours.salon_id")
    .execute();

  return res.status(200).json(salons);
});

router.get("/:id", async (req, res) => {
  const salon = await req.database
    .select("salons.*, working_hours.open_time, working_hours.close_time")
    .from("salons")
    .leftJoin("working_hours", "salons.id = working_hours.salon_id")
    .where("salons.id = ?", [req.params["id"]])
    .execute();

  return res.status(200).json(salon);
});

router.get("/random/:count?", async (req, res) => {
  let count = req.params["count"] ?? 1;
  const salons = await req.database
    .select("salons.*, working_hours.open_time, working_hours.close_time")
    .from("salons")
    .leftJoin("working_hours", "salons.id = working_hours.salon_id")
    .orderBy("RAND()")
    .limit(Number(count))
    .execute();

  return res.status(200).json(salons);
});

module.exports = router;
