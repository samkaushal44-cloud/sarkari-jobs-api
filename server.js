import express from "express";
import cors from "cors";
import { fetchLatest, fetchAdmit, fetchResult } from "./scraper.js";

const app = express();
app.use(cors());

app.get("/", (_, res) => res.json({ status: "OK" }));
app.get("/api/latest", async (_, res) => {
  try { res.json(await fetchLatest()); }
  catch { res.status(500).json({ error: "latest failed" }); }
});
app.get("/api/admit", async (_, res) => {
  try { res.json(await fetchAdmit()); }
  catch { res.status(500).json({ error: "admit failed" }); }
});
app.get("/api/result", async (_, res) => {
  try { res.json(await fetchResult()); }
  catch { res.status(500).json({ error: "result failed" }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running:", PORT));
