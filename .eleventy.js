const { DateTime } = require("luxon");

// Reading time filter
const readingTime = (text) => {
  if (!text) return '1 min read';
  const wpm = 200;
  const words = text.split(/\s+/g).length;
  const minutes = Math.ceil(words / wpm);
  return `${minutes} min read`;
};

module.exports = function(eleventyConfig) {
  // Add readingTime filter for all templates
  eleventyConfig.addFilter("readingTime", readingTime);

  // Add date filter for Nunjucks (fixes your news error!)
  eleventyConfig.addNunjucksFilter("date", function(dateObj, format = "MMMM d, yyyy") {
    // Make sure to handle both JS Dates and ISO strings
    let dt = dateObj instanceof Date ? dateObj : new Date(dateObj);
    return DateTime.fromJSDate(dt, { zone: 'utc' }).toFormat(format);
  });

  // Passthrough copy for static assets
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("robots.txt");

  // News collection with default layout for each news article
  eleventyConfig.addCollection("news", function(collection) {
    return collection.getFilteredByGlob("news/*.md").map(item => {
      item.data.layout = "news/news-detail.njk"; // force le layout détail pour chaque news
      return item;
    });
  });
};
