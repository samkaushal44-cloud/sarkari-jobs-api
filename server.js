import express from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
app.use(cors());

// 🔎 Scrape helper
async function scrape(url){
  const { data } = await axios.get(url, { timeout: 20000 });
  const $ = cheerio.load(data);
  const items = [];

  // सभी links पढ़ो
  $("a[href]").each((_, el) => {
    const title = $(el).text().trim();
    const link = $(el).attr("href");

    // ❌ unwanted / source / category हटाओ
    if (
      title &&
      link &&
      title.length > 15 &&
      !title.toLowerCase().includes("freejobalert") &&
      !title.toLowerCase().includes("all india") &&
      !title.toLowerCase().includes("state govt") &&
      !title.toLowerCase().includes("jobs") &&
      !title.toLowerCase().includes("previous papers") &&
      !title.toLowerCase().includes("exam pattern") &&
      !title.toLowerCase().includes("selection process")
    ) {
      items.push({
        title,
        date: "",
        link: link.startsWith("http")
          ? link
          : `https://www.freejobalert.com${link}`
      });
    }
  });

  // 🧹 Duplicate हटाओ
  const unique = Array.from(new Map(items.map(i => [i.title, i])).values());

  return unique.slice(0, 30);
}

// Health check
app.get("/", (req, res) => res.send("Sarkari Jobs API Running"));

// Latest Jobs
app.get("/api/latest", async (req, res) => {
  try {
    const data = await scrape("https://www.freejobalert.com/");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Latest jobs fetch failed" });
  }
});

// Admit Cards
app.get("/api/admit", async (req, res) => {
  try {
    const data = await scrape("https://www.freejobalert.com/admit-card/");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Admit cards fetch failed" });
  }
});

// Results
app.get("/api/result", async (req, res) => {
  try {
    const data = await scrape("https://www.freejobalert.com/results/");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Results fetch failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running on", PORT));
