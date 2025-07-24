module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("Nutriish_logo.png");
  eleventyConfig.addPassthroughCopy("image_background.jpg");
  eleventyConfig.addPassthroughCopy("brooke-lark-t7wg7BJU2-s-unsplash.jpg");
  eleventyConfig.addPassthroughCopy("coffee-7074304_1280.jpg");
  eleventyConfig.addPassthroughCopy("iced-tea-6391412_1280.jpg");
  eleventyConfig.addPassthroughCopy("lemon-2610759_1280.jpg");
  eleventyConfig.addPassthroughCopy("lemonade-6668438_1280.jpg");
  eleventyConfig.addPassthroughCopy("smoothie-ingredients-glasses.jpg");
  eleventyConfig.addPassthroughCopy("*.jpg");
  eleventyConfig.addPassthroughCopy("*.png");
  eleventyConfig.addPassthroughCopy("styles.css");
  // Add more passthroughs if needed (images, css, etc)
};
