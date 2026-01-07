import axios from "axios";
import * as cheerio from "cheerio";

async function scrape(url){
  const { data } = await axios.get(url, { timeout: 20000 });
  const $ = cheerio.load(data);
  const items = [];
  $("table#myTable tr").each((_, el) => {
    const title = $(el).find("td:nth-child(1) a").text().trim();
    const date  = $(el).find("td:nth-child(2)").text().trim();
    const link  = $(el).find("td:nth-child(1) a").attr("href");
    if (title && link) {
      items.push({
        title,
        date,
        link: link.startsWith("http") ? link : `https://www.freejobalert.com${link}`
      });
    }
  });
  return items.slice(0, 50);
}

export const fetchLatest = () => scrape("https://www.freejobalert.com/");
export const fetchAdmit  = () => scrape("https://www.freejobalert.com/admit-card/");
export const fetchResult = () => scrape("https://www.freejobalert.com/results/");
