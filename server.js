import express from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
app.use(cors());

async function scrape(url){
  const { data } = await axios.get(url, { timeout: 20000 });
  const $ = cheerio.load(data);
  const items = [];

  $("table#myTable tr").each((_, el) => {
    const title = $(el).find("td:nth-child(1) a").text().trim();
    const date  = $(el).find("td:nth-child(2)").text().trim();
    const link  = $(el).find("td:nth-child(1) a").attr("href");

    if(title && link){
      items.push({
        title,
        date,
        link: link.startsWith("http") ? link : `https://www.freejobalert.com${link}`
      });
    }
  });

  return items.slice(0,50);
}

app.get("/", (req,res)=> res.send("API Running"));

app.get("/api/latest", async (req,res)=>{
  try{
    const data = await scrape("https://www.freejobalert.com/");
    res.json(data);
  }catch(err){
    res.status(500).json({error:"Latest fetch failed"});
  }
});

app.get("/api/admit", async (req,res)=>{
  try{
    const data = await scrape("https://www.freejobalert.com/admit-card/");
    res.json(data);
  }catch(err){
    res.status(500).json({error:"Admit fetch failed"});
  }
});

app.get("/api/result", async (req,res)=>{
  try{
    const data = await scrape("https://www.freejobalert.com/results/");
    res.json(data);
  }catch(err){
    res.status(500).json({error:"Result fetch failed"});
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("Running on", PORT));
