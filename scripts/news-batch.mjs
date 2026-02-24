// scripts/news-batch.mjs
import fs from "fs";
import Parser from "rss-parser";
import slugify from "slugify";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const parser = new Parser();
const feeds = JSON.parse(fs.readFileSync(new URL("./feeds.json", import.meta.url)));

const CACHE_FILE = new URL("./.cache.json", import.meta.url);

// Charger le cache pour éviter les doublons
let cache = { seenUrls: [] };
if (fs.existsSync(CACHE_FILE)) {
  cache = JSON.parse(fs.readFileSync(CACHE_FILE));
}

// --- SCRAPER EatRightPro ---
async function scrapeEatRightPro() {
  console.log("🔎 Scraping EatRightPro...");
  const res = await fetch("https://www.eatrightpro.org/news-center");
  const html = await res.text();
  const $ = cheerio.load(html);

  let items = [];
  $(".news-list-item").each((i, el) => {
    const title = $(el).find("a").text().trim();
    const link = "https://www.eatrightpro.org" + $(el).find("a").attr("href");
    const snippet = $(el).find("p").text().trim();
    items.push({
      title,
      link,
      contentSnippet: snippet,
      pubDate: new Date().toISOString()
    });
  });

  return items.slice(0, 5); // limiter à 5
}

// --- Fonction principale ---
async function main() {
  let articles = [];

  for (const feed of feeds) {
    try {
      if (feed.startsWith("SCRAPE:")) {
        const source = feed.split(":")[1];
        if (source === "EATRIGHTPRO") {
          articles = articles.concat(await scrapeEatRightPro());
        }
      } else {
        const parsedFeed = await parser.parseURL(feed);
        articles = articles.concat(
          parsedFeed.items.map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            contentSnippet: item.contentSnippet || ""
          }))
        );
      }
    } catch (err) {
      console.error(`❌ Error with feed ${feed}: ${err.message}`);
    }
  }

  // Trier par date et filtrer les doublons
  articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  articles = articles.filter(a => !cache.seenUrls.includes(a.link));

  // Prendre les 5 plus récents
  const selected = articles.slice(0, 5);

  for (const article of selected) {
    const slug = slugify(article.title, { lower: true, strict: true });
    const date = new Date().toISOString().split("T")[0];

    const md = `---
title: "${article.title}"
date: ${date}
description: "${article.contentSnippet.replace(/"/g, "'")}"
layout: post.njk
source: "${article.link}"
---

${article.contentSnippet}

👉 [Read the full article here](${article.link})
`;

    const filePath = new URL(`../news/${date}-${slug}.md`, import.meta.url);
    fs.writeFileSync(filePath, md, "utf-8");

    // Ajouter au cache
    cache.seenUrls.push(article.link);
  }

  // Sauvegarder le cache
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));

  console.log(`✅ Added ${selected.length} new articles`);
}

main();
