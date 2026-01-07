const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");
const cron = require("node-cron");

const app = express();
app.use(cors());

let JOBS = [];

// 🔁 Scraper (FreeJobAlert style)
async function scrapeJobs() {
  try {
    const url = "https://www.freejobalert.com/";
    const { data } = await axios.get(url, { timeout: 20000 });
    const $ = cheerio.load(data);

    const results = [];

    $("a").each((i, el) => {
      const title = $(el).text().trim();
      const link = $(el).attr("href");

      if (title && link && link.includes("freejobalert.com")) {
        results.push({
          id: results.length + 1,
          title,
          link,
          category: "Sarkari Job",
          date: new Date().toISOString().split("T")[0]
        });
      }
    });

    // Remove duplicates
    const unique = [];
    const seen = new Set();
    for (const j of results) {
      if (!seen.has(j.link)) {
        seen.add(j.link);
        unique.push(j);
      }
    }

    JOBS = unique.slice(0, 100); // latest 100 jobs
    console.log("✅ Jobs updated:", JOBS.length);
  } catch (err) {
    console.error("❌ Scrape error:", err.message);
  }
}

// First run
scrapeJobs();

// Run every 6 hours
cron.schedule("0 */6 * * *", scrapeJobs);

// Routes
app.get("/", (req, res) => {
  res.send("Sarkari Jobs API is running");
});

app.get("/api/jobs", (req, res) => {
  res.json(JOBS);
});

app.get("/api/job/:id", (req, res) => {
  const job = JOBS.find(j => j.id === Number(req.params.id));
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json(job);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
