const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 10000;

// Home route
app.get("/", (req, res) => {
  res.send("Sarkari Jobs API Running");
});

// 🔥 JOBS API ROUTE (THIS WAS MISSING)
app.get("/jobs", async (req, res) => {
  try {
    const url = "https://www.freejobalert.com/";
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const items = [];

    $("a[href*='freejobalert.com']").each((i, el) => {
      const title = $(el).text().trim();
      const link = $(el).attr("href");

      if (title && link && title.length > 10) {
        items.push({
          title: title,
          link: link.startsWith("http")
            ? link
            : `https://www.freejobalert.com${link}`,
          date: "",
          category: "Sarkari Job",
        });
      }
    });

    // Remove duplicate titles
    const unique = Array.from(
      new Map(items.map((i) => [i.title, i])).values()
    );

    res.json(unique.slice(0, 30));
  } catch (err) {
    console.error("Scraping Error:", err.message);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
