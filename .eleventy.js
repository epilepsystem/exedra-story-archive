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

  // 인라인 <script>에 JSON을 안전하게 삽입하기 위한 필터
  // </script> 및 HTML 종료 패턴을 이스케이프
  eleventyConfig.addFilter("dump", (value) => {
    if (value === undefined || value === null) return "null";
    return JSON.stringify(value)
      .replace(/</g, "\\u003c")
      .replace(/>/g, "\\u003e")
      .replace(/&/g, "\\u0026");
  });

  return {
    dir: {
      input: ".",
      includes: "wiki-src/_includes",
      data: "wiki-src/_data",
      output: "_site",
    },

    // .html 파일도 Nunjucks 문법/include/매크로를 그대로 사용할 수 있게 함
    // (스토리 .html에서 .njk 틀을 바로 import할 수 있음)
    htmlTemplateEngine: "njk",
  };
};
