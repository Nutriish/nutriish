import fs from "fs";
import path from "path";
import Parser from "rss-parser";
import slugify from "slugify";

const __dirname = process.cwd();
const newsDir = path.join(__dirname, "news");
const feedsFile = path.join(__dirname, "feeds.json");

const parser = new Parser();
const MAX_ARTICLES = 5; // nombre max de posts par batch

// Cache des articles déjà publiés
const cacheFile = path.join(newsDir, ".cache.json");
let cache = new Set();

if (fs.existsSync(cacheFile)) {
  try {
    const data = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
    cache = new Set(data);
  } catch (err) {
    console.error("⚠️ Error reading cache, starting fresh.");
  }
}

// Helper pour écrire un fichier .md
function createMarkdownFile(article) {
  const slug = slugify(article.title, { lower: true, strict: true }).slice(0, 60);
  const date = new Date().toISOString().split("T")[0];
  const filename = `${date}-${slug}.md`;
  const filePath = path.join(newsDir, filename);

  const mdContent = `---
layout: news/news-detail.njk
title: "${article.title.replace(/"/g, "'")}"
description: "${(article.contentSnippet || "").slice(0, 150)}"
date: ${date}
tags: news
---

**Nutriish Summary:**  
${article.contentSnippet || "No summary available."}

🔗 [Read the full article here](${article.link})
`;

  fs.writeFileSync(filePath, mdContent, "utf-8");
  console.log(`✅ Created: ${filename}`);
  cache.add(article.link);
}

async function run() {
  if (!fs.existsSync(newsDir)) {
    fs.mkdirSync(newsDir);
  }

  const feeds = JSON.parse(fs.readFileSync(feedsFile, "utf-8"));
  let articles = [];

  for (const feedUrl of feeds) {
    try {
      const feed = await parser.parseURL(feedUrl);
      articles = articles.concat(feed.items.slice(0, 3));
    } catch (err) {
      console.error(`❌ Error parsing feed ${feedUrl}:`, err.message);
    }
  }

  articles = articles
    .filter(a => a.title && a.link && !cache.has(a.link)) // exclure doublons
    .sort((a, b) => new Date(b.isoDate || b.pubDate) - new Date(a.isoDate || a.pubDate))
    .slice(0, MAX_ARTICLES);

  if (articles.length === 0) {
    console.log("ℹ️ No new articles to add.");
  }

  articles.forEach(article => createMarkdownFile(article));

  // Mise à jour du cache
  fs.writeFileSync(cacheFile, JSON.stringify([...cache]), "utf-8");
}

run();
