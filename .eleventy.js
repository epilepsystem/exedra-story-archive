module.exports = function (eleventyConfig) {
  // 정적 자산 복사 (css/js/images는 main/ 바로 아래에 위치)
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");

  // 위키 소스가 아닌 파일은 템플릿 처리에서 제외
  // (wiki-src/index.njk 와 내용이 겹친 이전 버전 정적 HTML들)
  eleventyConfig.ignores.add("test.html");
  eleventyConfig.ignores.add("index.html");
  eleventyConfig.ignores.add("README.md");

  return {
    dir: {
      input: ".",
      includes: "wiki-src/_includes",
      data: "wiki-src/_data",
      output: "_site",
    },
  };
};
