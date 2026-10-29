module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");

  eleventyConfig.addPassthroughCopy({
    "site/images": "images"
  });

  return {
    dir: {
      input: "wiki-src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    }
  };
};